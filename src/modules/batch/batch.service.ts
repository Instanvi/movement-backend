import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BatchListFilter,
  BatchRepository,
} from '../../domain/repositories/batch.repository';
import { FinanceService } from '../finance/finance.service';
import { CreateBatchDto, UpdateBatchDto } from './dto/batch.dto';

@Injectable()
export class BatchService {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly financeService: FinanceService,
  ) {}

  async create(churchId: string, dto: CreateBatchDto) {
    const { batchDate, ...rest } = dto;
    return await this.batchRepo.create({
      ...rest,
      churchId,
      ...(batchDate ? { batchDate: new Date(batchDate) } : {}),
    });
  }

  async getBatchOverview(
    churchId: string,
    opts?: {
      filter?: BatchListFilter;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const filter = opts?.filter ?? 'all';
    const limit = opts?.limit ?? 100;
    const offset = opts?.offset ?? 0;
    const search = opts?.search;

    const [batchCount, uniqueContributors, rows] = await Promise.all([
      this.batchRepo.countBatchesForChurch(churchId, filter, search),
      this.batchRepo.countDistinctDonorsForChurchBatches(
        churchId,
        filter,
        search,
      ),
      this.batchRepo.listBatchesWithAggregates(churchId, {
        filter,
        search,
        limit,
        offset,
      }),
    ]);

    return {
      summary: {
        batchCount,
        uniqueContributors,
      },
      batches: rows.map((r) => ({
        ...r,
        uniqueContributors: Number(r.uniqueContributors),
      })),
    };
  }

  private async assertBatchInChurch(churchId: string, id: string) {
    const b = await this.batchRepo.findOne(id);
    if (!b || b.churchId !== churchId) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return b;
  }

  async findOne(churchId: string, id: string) {
    return await this.assertBatchInChurch(churchId, id);
  }

  async update(churchId: string, id: string, dto: UpdateBatchDto) {
    await this.assertBatchInChurch(churchId, id);
    const { batchDate, archived, ...rest } = dto;
    const payload: Parameters<BatchRepository['update']>[1] = { ...rest };
    if (batchDate !== undefined) {
      payload.batchDate = new Date(batchDate);
    }
    if (archived !== undefined) {
      payload.archivedAt = archived ? new Date() : null;
    }
    return await this.batchRepo.update(id, payload);
  }

  async delete(churchId: string, id: string) {
    await this.assertBatchInChurch(churchId, id);
    const donationCount = await this.batchRepo.countDonationsForBatch(id);
    if (donationCount > 0) {
      throw new BadRequestException(
        'Cannot delete a batch that has donations. Remove or reassign donations first.',
      );
    }
    await this.batchRepo.delete(id);
  }

  /** Gracely “Archive” row action: hide from Open tab without posting a deposit. */
  async archiveBatch(churchId: string, batchId: string) {
    const batch = await this.assertBatchInChurch(churchId, batchId);
    if (batch.archivedAt != null) {
      throw new BadRequestException('Batch is already archived');
    }
    return await this.batchRepo.update(batchId, { archivedAt: new Date() });
  }

  /**
   * Gracely-style deposit: credit the chosen bank (asset) account for the batch
   * donation total, then close and archive the batch.
   */
  async depositBatch(churchId: string, batchId: string, accountId: string) {
    const batch = await this.assertBatchInChurch(churchId, batchId);
    if (batch.archivedAt != null) {
      throw new BadRequestException('Batch is already archived');
    }
    if (batch.status !== 'open') {
      throw new BadRequestException('Only open batches can be deposited');
    }
    await this.financeService.assertFinancialAccountForDeposit(
      accountId,
      churchId,
    );
    const totalStr = await this.batchRepo.sumDonationAmountForBatch(batchId);
    const amount = parseFloat(totalStr);
    if (Number.isNaN(amount) || amount < 0) {
      throw new BadRequestException('Invalid batch total');
    }
    const transaction = await this.financeService.addTransaction(
      churchId,
      accountId,
      {
        amount,
        description: `Batch deposit: ${batch.name}`,
        type: 'credit',
        referenceId: batchId,
      },
    );
    const updated = await this.batchRepo.update(batchId, {
      archivedAt: new Date(),
      status: 'closed',
    });
    return { batch: updated, transaction };
  }
}
