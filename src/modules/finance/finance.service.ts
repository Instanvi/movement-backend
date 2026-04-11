import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { pledgeCampaign } from '../../core/schema/finance.schema';
import {
  AccountingAccountFilter,
  FinanceRepository,
} from '../../domain/repositories/finance.repository';
import {
  CreateFinancialAccountDto,
  CreateTransactionDto,
  CreateFundDto,
  CreateStewardshipPledgeDto,
  CreatePledgeCampaignDto,
  UpdatePledgeCampaignDto,
} from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly financeRepo: FinanceRepository) {}

  async createAccount(churchId: string, dto: CreateFinancialAccountDto) {
    if (dto.fundId) {
      const fund = await this.financeRepo.findFundOne(dto.fundId);
      if (!fund || fund.churchId !== churchId) {
        throw new BadRequestException('Fund not found in this church');
      }
    }
    const { openingBalance, openingDate, ...rest } = dto;
    return await this.financeRepo.create({
      ...rest,
      churchId,
      balance: '0',
      openingBalance: openingBalance.toString(),
      openingDate: new Date(openingDate),
    });
  }

  async getAccount(id: string) {
    const account = await this.financeRepo.findOne(id);
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  /** Target account for batch deposits (Gracely “Deposit to Account”): church asset, not archived. */
  async assertFinancialAccountForDeposit(accountId: string, churchId: string) {
    const account = await this.getAccount(accountId);
    if (account.churchId !== churchId) {
      throw new BadRequestException(
        'Financial account does not belong to this church',
      );
    }
    if (account.archivedAt != null) {
      throw new BadRequestException('Cannot deposit to an archived account');
    }
    if (account.type !== 'asset') {
      throw new BadRequestException(
        'Deposits must be posted to an asset account (e.g. checking)',
      );
    }
    return account;
  }

  async addTransaction(
    churchId: string,
    accountId: string,
    dto: CreateTransactionDto,
  ) {
    const account = await this.getAccount(accountId);
    if (account.churchId !== churchId) {
      throw new BadRequestException(
        'Financial account does not belong to this church',
      );
    }

    const transaction = await this.financeRepo.createTransaction({
      ...dto,
      accountId,
      amount: dto.amount.toString(),
    });

    // Update account balance
    const currentBalance = parseFloat(account.balance);
    const amountVal = dto.amount;
    const newBalance =
      dto.type === 'credit'
        ? currentBalance + amountVal
        : currentBalance - amountVal;

    await this.financeRepo.update(accountId, {
      balance: newBalance.toString(),
    });

    // Update Fund balance if fundId is provided
    if (dto.fundId) {
      const fund = await this.financeRepo.findFundOne(dto.fundId);
      if (fund) {
        const newFundBalance =
          dto.type === 'credit'
            ? parseFloat(fund.balance) + amountVal
            : parseFloat(fund.balance) - amountVal;

        await this.financeRepo.updateFund(dto.fundId, {
          balance: newFundBalance.toString(),
        });
      }
    }

    return transaction;
  }

  async getTransactions(churchId: string, accountId: string) {
    const account = await this.getAccount(accountId);
    if (account.churchId !== churchId) {
      throw new BadRequestException(
        'Financial account does not belong to this church',
      );
    }
    return await this.financeRepo.getTransactions(accountId);
  }

  async listAccountsByChurch(churchId: string) {
    return await this.financeRepo.findByChurch(churchId);
  }

  /** Gracely Accounting page: KPIs + account table (asset/liability, connected fund name). */
  async getAccountingOverview(
    churchId: string,
    opts?: { filter?: string; search?: string },
  ) {
    const filter: AccountingAccountFilter =
      opts?.filter === 'asset' || opts?.filter === 'liability'
        ? opts.filter
        : 'all';
    const [
      assetAccountCount,
      liabilityAccountCount,
      assetBalanceSum,
      liabilityBalanceSum,
      categoryCount,
      payeeCount,
      accounts,
    ] = await Promise.all([
      this.financeRepo.countAccountsByTypeForChurch(churchId, 'asset'),
      this.financeRepo.countAccountsByTypeForChurch(churchId, 'liability'),
      this.financeRepo.sumAccountBalanceForChurch(churchId, 'asset'),
      this.financeRepo.sumAccountBalanceForChurch(churchId, 'liability'),
      this.financeRepo.countCategoriesForChurch(churchId),
      this.financeRepo.countPayeesForChurch(churchId),
      this.financeRepo.listAccountsWithFundForChurch(churchId, {
        filter,
        search: opts?.search,
      }),
    ]);
    const assets = parseFloat(assetBalanceSum) || 0;
    const liabilities = parseFloat(liabilityBalanceSum) || 0;
    return {
      summary: {
        totalBalance: assets - liabilities,
        assetAccountCount,
        liabilityAccountCount,
        categoryCount,
        payeeCount,
      },
      accounts,
    };
  }

  // Fund management
  async createFund(churchId: string, dto: CreateFundDto) {
    return await this.financeRepo.createFund({
      ...dto,
      churchId,
      balance: '0',
      targetAmount: dto.targetAmount?.toString() || null,
    });
  }

  async listFundsByChurch(churchId: string) {
    return await this.financeRepo.listFundsByChurch(churchId);
  }

  async createPledgeCampaign(churchId: string, dto: CreatePledgeCampaignDto) {
    const fund = await this.financeRepo.findFundOne(dto.fundId);
    if (!fund || fund.churchId !== churchId) {
      throw new BadRequestException('Fund not found in this church');
    }
    const start = new Date(dto.startDate);
    const end = dto.endDate ? new Date(dto.endDate) : null;
    if (end && start.getTime() > end.getTime()) {
      throw new BadRequestException('startDate must be before endDate');
    }
    return await this.financeRepo.createPledgeCampaign({
      churchId,
      fundId: dto.fundId,
      name: dto.name,
      startDate: start,
      endDate: end,
    });
  }

  async getPledgeCampaignOverview(
    churchId: string,
    opts?: { filter?: string; search?: string },
  ) {
    const filter =
      opts?.filter === 'in_progress' || opts?.filter === 'completed'
        ? opts.filter
        : 'all';
    const rows = await this.financeRepo.listPledgeCampaignsWithAggregates(
      churchId,
      { filter, search: opts?.search },
    );
    const summaryRow =
      await this.financeRepo.getChurchPledgeSummaryFromCampaignPledges(
        churchId,
      );

    const parseN = (v: string | null | undefined) =>
      Math.max(0, parseFloat(v ?? '0') || 0);

    const churchTotalPledged = parseN(summaryRow?.totalPledged);
    const churchTotalRaised = parseN(summaryRow?.totalRaised);

    const campaigns = rows.map((row) => {
      const totalPledged = parseN(row.totalPledged);
      const totalRaised = parseN(row.totalRaised);
      const remaining = Math.max(0, totalPledged - totalRaised);
      const progressPercent =
        totalPledged > 0
          ? Math.min(
              100,
              Math.round((totalRaised / totalPledged) * 10000) / 100,
            )
          : 0;
      return {
        id: row.id,
        churchId: row.churchId,
        fundId: row.fundId,
        fundName: row.fundName,
        name: row.name,
        startDate: row.startDate,
        endDate: row.endDate,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        totalPledged,
        totalRaised,
        remaining,
        progressPercent,
      };
    });

    return {
      summary: {
        totalPledged: churchTotalPledged,
        totalRaised: churchTotalRaised,
        remaining: Math.max(0, churchTotalPledged - churchTotalRaised),
      },
      campaigns,
    };
  }

  async updatePledgeCampaign(
    churchId: string,
    campaignId: string,
    dto: UpdatePledgeCampaignDto,
  ) {
    const campaign = await this.financeRepo.findPledgeCampaignById(campaignId);
    if (!campaign || campaign.churchId !== churchId) {
      throw new NotFoundException('Pledge campaign not found');
    }
    const patch: Partial<typeof pledgeCampaign.$inferInsert> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.startDate !== undefined) patch.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) {
      patch.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.status !== undefined) patch.status = dto.status;
    if (dto.archived === true) patch.archivedAt = new Date();
    if (dto.archived === false) patch.archivedAt = null;
    if (Object.keys(patch).length === 0) {
      return campaign;
    }
    return await this.financeRepo.updatePledgeCampaign(campaignId, patch);
  }

  async listPledgesForCampaign(churchId: string, campaignId: string) {
    const campaign = await this.financeRepo.findPledgeCampaignById(campaignId);
    if (!campaign || campaign.churchId !== churchId) {
      throw new NotFoundException('Pledge campaign not found');
    }
    return await this.financeRepo.listPledgesByCampaign(campaignId);
  }

  async createPledge(churchId: string, dto: CreateStewardshipPledgeDto) {
    if (dto.pledgeCampaignId) {
      const campaign = await this.financeRepo.findPledgeCampaignById(
        dto.pledgeCampaignId,
      );
      if (!campaign || campaign.churchId !== churchId) {
        throw new BadRequestException('Pledge campaign not found in this church');
      }
      if (campaign.fundId !== dto.fundId) {
        throw new BadRequestException(
          'fundId must match the campaign’s associated fund',
        );
      }
    }
    return await this.financeRepo.createPledge({
      userId: dto.userId,
      fundId: dto.fundId,
      pledgeCampaignId: dto.pledgeCampaignId ?? null,
      targetAmount: dto.targetAmount.toString(),
      raisedAmount: '0',
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
  }

  async getStats(churchId: string, branchId?: string) {
    const accounts = await this.financeRepo.findByChurch(churchId);
    const funds = await this.financeRepo.listFundsByChurch(churchId);

    // Filter by branch if provided
    const filteredAccounts = branchId
      ? accounts.filter((a) => a.branchId === branchId)
      : accounts;
    const filteredFunds = branchId
      ? funds.filter((f) => f.branchId === branchId)
      : funds;

    const totalBalance = filteredAccounts.reduce(
      (sum, acc) => sum + parseFloat(acc.balance),
      0,
    );
    const fundStats = filteredFunds.map((f) => ({
      name: f.name,
      balance: parseFloat(f.balance),
      target: f.targetAmount ? parseFloat(f.targetAmount) : null,
      progress: f.targetAmount
        ? (parseFloat(f.balance) / parseFloat(f.targetAmount)) * 100
        : null,
    }));

    return {
      totalBalance,
      accountCount: filteredAccounts.length,
      fundCount: filteredFunds.length,
      funds: fundStats,
    };
  }
}
