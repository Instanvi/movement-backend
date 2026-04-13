import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import {
  financialAccount,
  financialCategory,
  payee,
  transaction,
  fund,
  stewardshipPledge,
  pledgeCampaign,
} from '../../core/schema/finance.schema';
import * as schemaExports from '../../core/schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  and,
  asc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
  SQL,
} from 'drizzle-orm';

export type AccountingAccountFilter = 'all' | 'asset' | 'liability';

type FinancialAccountSelect = typeof financialAccount.$inferSelect;
type FinancialAccountInsert = typeof financialAccount.$inferInsert;

@Injectable()
export class FinanceRepository implements BaseRepository<
  typeof financialAccount
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schemaExports>,
  ) {}

  async findOne(id: string): Promise<FinancialAccountSelect | undefined> {
    const results = await this.db
      .select()
      .from(financialAccount)
      .where(eq(financialAccount.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: FinancialAccountSelect[]; total: number }> {
    let query = this.db.select().from(financialAccount).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(financialAccount)
        .where(where ?? sql`true`),
    ]);

    return { items: items as FinancialAccountSelect[], total: total ?? 0 };
  }

  async create(data: FinancialAccountInsert): Promise<FinancialAccountSelect> {
    const results = await this.db
      .insert(financialAccount)
      .values(data)
      .returning();
    return results[0];
  }

  async update(
    id: string,
    data: Partial<FinancialAccountInsert>,
  ): Promise<FinancialAccountSelect> {
    const results = await this.db
      .update(financialAccount)
      .set(data)
      .where(eq(financialAccount.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(financialAccount).where(eq(financialAccount.id, id));
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: FinancialAccountSelect[]; total: number }> {
    const filters = eq(financialAccount.churchId, churchId);
    let query = this.db
      .select()
      .from(financialAccount)
      .where(filters)
      .$dynamic();

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(financialAccount)
        .where(filters),
    ]);

    return { items: items as FinancialAccountSelect[], total: total ?? 0 };
  }

  async sumAccountBalanceForChurch(
    churchId: string,
    type: 'asset' | 'liability',
  ): Promise<string> {
    const [row] = await this.db
      .select({
        s: sql<string>`coalesce(sum(${financialAccount.balance}), 0)::text`,
      })
      .from(financialAccount)
      .where(
        and(
          eq(financialAccount.churchId, churchId),
          isNull(financialAccount.archivedAt),
          eq(financialAccount.type, type),
        ),
      );
    return row?.s ?? '0';
  }

  async countAccountsByTypeForChurch(
    churchId: string,
    type: 'asset' | 'liability',
  ): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(financialAccount)
      .where(
        and(
          eq(financialAccount.churchId, churchId),
          isNull(financialAccount.archivedAt),
          eq(financialAccount.type, type),
        ),
      );
    return row?.n ?? 0;
  }

  async countCategoriesForChurch(churchId: string): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(financialCategory)
      .where(
        and(
          eq(financialCategory.churchId, churchId),
          isNull(financialCategory.archivedAt),
        ),
      );
    return row?.n ?? 0;
  }

  async countPayeesForChurch(churchId: string): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(payee)
      .where(and(eq(payee.churchId, churchId), isNull(payee.archivedAt)));
    return row?.n ?? 0;
  }

  async listAccountsWithFundForChurch(
    churchId: string,
    opts?: { filter?: AccountingAccountFilter; search?: string },
  ) {
    const filter = opts?.filter ?? 'all';
    const parts: SQL[] = [
      eq(financialAccount.churchId, churchId),
      isNull(financialAccount.archivedAt),
      inArray(financialAccount.type, ['asset', 'liability']),
    ];
    if (filter === 'asset') {
      parts.push(eq(financialAccount.type, 'asset'));
    } else if (filter === 'liability') {
      parts.push(eq(financialAccount.type, 'liability'));
    }
    if (opts?.search?.trim()) {
      const safe = opts.search.trim().replace(/[%_\\]/g, '');
      if (safe.length > 0) {
        parts.push(ilike(financialAccount.name, `%${safe}%`));
      }
    }
    return await this.db
      .select({
        id: financialAccount.id,
        name: financialAccount.name,
        code: financialAccount.code,
        description: financialAccount.description,
        type: financialAccount.type,
        churchId: financialAccount.churchId,
        branchId: financialAccount.branchId,
        fundId: financialAccount.fundId,
        balance: financialAccount.balance,
        openingBalance: financialAccount.openingBalance,
        openingDate: financialAccount.openingDate,
        createdAt: financialAccount.createdAt,
        updatedAt: financialAccount.updatedAt,
        archivedAt: financialAccount.archivedAt,
        fundName: fund.name,
      })
      .from(financialAccount)
      .leftJoin(fund, eq(financialAccount.fundId, fund.id))
      .where(and(...parts))
      .orderBy(asc(financialAccount.name));
  }

  async createTransaction(data: typeof transaction.$inferInsert) {
    const [result] = await this.db.insert(transaction).values(data).returning();
    return result;
  }

  async getTransactions(accountId: string) {
    return await this.db
      .select()
      .from(transaction)
      .where(eq(transaction.accountId, accountId));
  }

  // Fund management
  async createFund(data: typeof fund.$inferInsert) {
    const [result] = await this.db.insert(fund).values(data).returning();
    return result;
  }

  async listFundsByChurch(churchId: string) {
    return await this.db.select().from(fund).where(eq(fund.churchId, churchId));
  }

  async findFundOne(id: string) {
    const [result] = await this.db
      .select()
      .from(fund)
      .where(eq(fund.id, id))
      .limit(1);
    return result;
  }

  async updateFund(id: string, data: Partial<typeof fund.$inferInsert>) {
    const [result] = await this.db
      .update(fund)
      .set(data)
      .where(eq(fund.id, id))
      .returning();
    return result;
  }

  // Pledges
  async createPledge(data: typeof stewardshipPledge.$inferInsert) {
    const [result] = await this.db
      .insert(stewardshipPledge)
      .values(data)
      .returning();
    return result;
  }

  async listPledgesByUser(userId: string) {
    return await this.db
      .select()
      .from(stewardshipPledge)
      .where(eq(stewardshipPledge.userId, userId));
  }

  async createPledgeCampaign(data: typeof pledgeCampaign.$inferInsert) {
    const [row] = await this.db.insert(pledgeCampaign).values(data).returning();
    return row;
  }

  async getChurchPledgeSummaryFromCampaignPledges(churchId: string) {
    const rows = await this.db
      .select({
        totalPledged: sql<string>`coalesce(sum(${stewardshipPledge.targetAmount}), 0)`,
        totalRaised: sql<string>`coalesce(sum(${stewardshipPledge.raisedAmount}), 0)`,
      })
      .from(stewardshipPledge)
      .innerJoin(
        pledgeCampaign,
        eq(stewardshipPledge.pledgeCampaignId, pledgeCampaign.id),
      )
      .where(
        and(
          eq(pledgeCampaign.churchId, churchId),
          isNull(pledgeCampaign.archivedAt),
        ),
      );
    return rows[0];
  }

  async listPledgeCampaignsWithAggregates(
    churchId: string,
    opts?: { filter?: 'all' | 'in_progress' | 'completed'; search?: string },
  ) {
    const filter = opts?.filter ?? 'all';
    const search = opts?.search?.trim();

    const parts: SQL[] = [
      eq(pledgeCampaign.churchId, churchId),
      isNull(pledgeCampaign.archivedAt),
    ];

    if (search) {
      const safe = search.replace(/[%_\\]/g, '');
      if (safe.length > 0) {
        parts.push(ilike(pledgeCampaign.name, `%${safe}%`));
      }
    }

    const now = new Date();
    if (filter === 'in_progress') {
      parts.push(ne(pledgeCampaign.status, 'closed'));
      parts.push(
        or(
          isNull(pledgeCampaign.endDate),
          gte(pledgeCampaign.endDate, now),
        ) as SQL,
      );
      parts.push(lte(pledgeCampaign.startDate, now));
    } else if (filter === 'completed') {
      parts.push(
        or(
          eq(pledgeCampaign.status, 'closed'),
          and(
            isNotNull(pledgeCampaign.endDate),
            lt(pledgeCampaign.endDate, now),
          ),
        ) as SQL,
      );
    }

    return await this.db
      .select({
        id: pledgeCampaign.id,
        churchId: pledgeCampaign.churchId,
        fundId: pledgeCampaign.fundId,
        name: pledgeCampaign.name,
        startDate: pledgeCampaign.startDate,
        endDate: pledgeCampaign.endDate,
        status: pledgeCampaign.status,
        createdAt: pledgeCampaign.createdAt,
        updatedAt: pledgeCampaign.updatedAt,
        fundName: fund.name,
        totalPledged: sql<string>`coalesce(sum(${stewardshipPledge.targetAmount}), 0)`,
        totalRaised: sql<string>`coalesce(sum(${stewardshipPledge.raisedAmount}), 0)`,
      })
      .from(pledgeCampaign)
      .innerJoin(fund, eq(fund.id, pledgeCampaign.fundId))
      .leftJoin(
        stewardshipPledge,
        eq(stewardshipPledge.pledgeCampaignId, pledgeCampaign.id),
      )
      .where(and(...parts))
      .groupBy(pledgeCampaign.id, fund.id, fund.name);
  }

  async findPledgeCampaignById(id: string) {
    const [result] = await this.db
      .select()
      .from(pledgeCampaign)
      .where(eq(pledgeCampaign.id, id))
      .limit(1);
    return result;
  }

  async updatePledgeCampaign(
    id: string,
    data: Partial<typeof pledgeCampaign.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(pledgeCampaign)
      .set(data)
      .where(eq(pledgeCampaign.id, id))
      .returning();
    return row;
  }

  async listPledgesByCampaign(campaignId: string) {
    return await this.db
      .select()
      .from(stewardshipPledge)
      .where(eq(stewardshipPledge.pledgeCampaignId, campaignId));
  }
}
