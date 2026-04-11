import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
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

@Injectable()
export class FinanceRepository implements BaseRepository<
  typeof schemaExports.financialAccount
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schemaExports>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schemaExports.financialAccount)
      .where(eq(schemaExports.financialAccount.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db
      .select()
      .from(schemaExports.financialAccount)
      .$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schemaExports.financialAccount.$inferInsert) {
    const results = await this.db
      .insert(schemaExports.financialAccount)
      .values(data)
      .returning();
    return results[0];
  }

  async update(
    id: string,
    data: Partial<typeof schemaExports.financialAccount.$inferInsert>,
  ) {
    const results = await this.db
      .update(schemaExports.financialAccount)
      .set(data)
      .where(eq(schemaExports.financialAccount.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db
      .delete(schemaExports.financialAccount)
      .where(eq(schemaExports.financialAccount.id, id));
  }

  async findByChurch(churchId: string) {
    return await this.db.query.financialAccount.findMany({
      where: eq(schemaExports.financialAccount.churchId, churchId),
    });
  }

  async sumAccountBalanceForChurch(
    churchId: string,
    type: 'asset' | 'liability',
  ): Promise<string> {
    const [row] = await this.db
      .select({
        s: sql<string>`coalesce(sum(${schemaExports.financialAccount.balance}), 0)::text`,
      })
      .from(schemaExports.financialAccount)
      .where(
        and(
          eq(schemaExports.financialAccount.churchId, churchId),
          isNull(schemaExports.financialAccount.archivedAt),
          eq(schemaExports.financialAccount.type, type),
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
      .from(schemaExports.financialAccount)
      .where(
        and(
          eq(schemaExports.financialAccount.churchId, churchId),
          isNull(schemaExports.financialAccount.archivedAt),
          eq(schemaExports.financialAccount.type, type),
        ),
      );
    return row?.n ?? 0;
  }

  async countCategoriesForChurch(churchId: string): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(schemaExports.financialCategory)
      .where(
        and(
          eq(schemaExports.financialCategory.churchId, churchId),
          isNull(schemaExports.financialCategory.archivedAt),
        ),
      );
    return row?.n ?? 0;
  }

  async countPayeesForChurch(churchId: string): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(schemaExports.payee)
      .where(
        and(
          eq(schemaExports.payee.churchId, churchId),
          isNull(schemaExports.payee.archivedAt),
        ),
      );
    return row?.n ?? 0;
  }

  async listAccountsWithFundForChurch(
    churchId: string,
    opts?: { filter?: AccountingAccountFilter; search?: string },
  ) {
    const filter = opts?.filter ?? 'all';
    const parts: SQL[] = [
      eq(schemaExports.financialAccount.churchId, churchId),
      isNull(schemaExports.financialAccount.archivedAt),
      inArray(schemaExports.financialAccount.type, ['asset', 'liability']),
    ];
    if (filter === 'asset') {
      parts.push(eq(schemaExports.financialAccount.type, 'asset'));
    } else if (filter === 'liability') {
      parts.push(eq(schemaExports.financialAccount.type, 'liability'));
    }
    if (opts?.search?.trim()) {
      const safe = opts.search.trim().replace(/[%_\\]/g, '');
      if (safe.length > 0) {
        parts.push(ilike(schemaExports.financialAccount.name, `%${safe}%`));
      }
    }
    return await this.db
      .select({
        id: schemaExports.financialAccount.id,
        name: schemaExports.financialAccount.name,
        code: schemaExports.financialAccount.code,
        description: schemaExports.financialAccount.description,
        type: schemaExports.financialAccount.type,
        churchId: schemaExports.financialAccount.churchId,
        branchId: schemaExports.financialAccount.branchId,
        fundId: schemaExports.financialAccount.fundId,
        balance: schemaExports.financialAccount.balance,
        openingBalance: schemaExports.financialAccount.openingBalance,
        openingDate: schemaExports.financialAccount.openingDate,
        createdAt: schemaExports.financialAccount.createdAt,
        updatedAt: schemaExports.financialAccount.updatedAt,
        archivedAt: schemaExports.financialAccount.archivedAt,
        fundName: schemaExports.fund.name,
      })
      .from(schemaExports.financialAccount)
      .leftJoin(
        schemaExports.fund,
        eq(schemaExports.financialAccount.fundId, schemaExports.fund.id),
      )
      .where(and(...parts))
      .orderBy(asc(schemaExports.financialAccount.name));
  }

  async createTransaction(data: typeof schemaExports.transaction.$inferInsert) {
    const results = await this.db
      .insert(schemaExports.transaction)
      .values(data)
      .returning();
    return results[0];
  }

  async getTransactions(accountId: string) {
    return await this.db.query.transaction.findMany({
      where: eq(schemaExports.transaction.accountId, accountId),
    });
  }

  // Fund management
  async createFund(data: typeof schemaExports.fund.$inferInsert) {
    const results = await this.db
      .insert(schemaExports.fund)
      .values(data)
      .returning();
    return results[0];
  }

  async listFundsByChurch(churchId: string) {
    return await this.db.query.fund.findMany({
      where: eq(schemaExports.fund.churchId, churchId),
    });
  }

  async findFundOne(id: string) {
    return await this.db.query.fund.findFirst({
      where: eq(schemaExports.fund.id, id),
    });
  }

  async updateFund(
    id: string,
    data: Partial<typeof schemaExports.fund.$inferInsert>,
  ) {
    const results = await this.db
      .update(schemaExports.fund)
      .set(data)
      .where(eq(schemaExports.fund.id, id))
      .returning();
    return results[0];
  }

  // Pledges
  async createPledge(
    data: typeof schemaExports.stewardshipPledge.$inferInsert,
  ) {
    const results = await this.db
      .insert(schemaExports.stewardshipPledge)
      .values(data)
      .returning();
    return results[0];
  }

  async listPledgesByUser(userId: string) {
    return await this.db.query.stewardshipPledge.findMany({
      where: eq(schemaExports.stewardshipPledge.userId, userId),
    });
  }

  async createPledgeCampaign(
    data: typeof schemaExports.pledgeCampaign.$inferInsert,
  ) {
    const [row] = await this.db
      .insert(schemaExports.pledgeCampaign)
      .values(data)
      .returning();
    return row;
  }

  async getChurchPledgeSummaryFromCampaignPledges(churchId: string) {
    const rows = await this.db
      .select({
        totalPledged: sql<string>`coalesce(sum(${schemaExports.stewardshipPledge.targetAmount}), 0)`,
        totalRaised: sql<string>`coalesce(sum(${schemaExports.stewardshipPledge.raisedAmount}), 0)`,
      })
      .from(schemaExports.stewardshipPledge)
      .innerJoin(
        schemaExports.pledgeCampaign,
        eq(
          schemaExports.stewardshipPledge.pledgeCampaignId,
          schemaExports.pledgeCampaign.id,
        ),
      )
      .where(
        and(
          eq(schemaExports.pledgeCampaign.churchId, churchId),
          isNull(schemaExports.pledgeCampaign.archivedAt),
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
      eq(schemaExports.pledgeCampaign.churchId, churchId),
      isNull(schemaExports.pledgeCampaign.archivedAt),
    ];

    if (search) {
      const safe = search.replace(/[%_\\]/g, '');
      if (safe.length > 0) {
        parts.push(ilike(schemaExports.pledgeCampaign.name, `%${safe}%`));
      }
    }

    const now = new Date();
    if (filter === 'in_progress') {
      parts.push(ne(schemaExports.pledgeCampaign.status, 'closed'));
      parts.push(
        or(
          isNull(schemaExports.pledgeCampaign.endDate),
          gte(schemaExports.pledgeCampaign.endDate, now),
        ) as SQL,
      );
      parts.push(lte(schemaExports.pledgeCampaign.startDate, now));
    } else if (filter === 'completed') {
      parts.push(
        or(
          eq(schemaExports.pledgeCampaign.status, 'closed'),
          and(
            isNotNull(schemaExports.pledgeCampaign.endDate),
            lt(schemaExports.pledgeCampaign.endDate, now),
          ),
        ) as SQL,
      );
    }

    return await this.db
      .select({
        id: schemaExports.pledgeCampaign.id,
        churchId: schemaExports.pledgeCampaign.churchId,
        fundId: schemaExports.pledgeCampaign.fundId,
        name: schemaExports.pledgeCampaign.name,
        startDate: schemaExports.pledgeCampaign.startDate,
        endDate: schemaExports.pledgeCampaign.endDate,
        status: schemaExports.pledgeCampaign.status,
        createdAt: schemaExports.pledgeCampaign.createdAt,
        updatedAt: schemaExports.pledgeCampaign.updatedAt,
        fundName: schemaExports.fund.name,
        totalPledged: sql<string>`coalesce(sum(${schemaExports.stewardshipPledge.targetAmount}), 0)`,
        totalRaised: sql<string>`coalesce(sum(${schemaExports.stewardshipPledge.raisedAmount}), 0)`,
      })
      .from(schemaExports.pledgeCampaign)
      .innerJoin(
        schemaExports.fund,
        eq(schemaExports.fund.id, schemaExports.pledgeCampaign.fundId),
      )
      .leftJoin(
        schemaExports.stewardshipPledge,
        eq(
          schemaExports.stewardshipPledge.pledgeCampaignId,
          schemaExports.pledgeCampaign.id,
        ),
      )
      .where(and(...parts))
      .groupBy(
        schemaExports.pledgeCampaign.id,
        schemaExports.fund.id,
        schemaExports.fund.name,
      );
  }

  async findPledgeCampaignById(id: string) {
    return await this.db.query.pledgeCampaign.findFirst({
      where: eq(schemaExports.pledgeCampaign.id, id),
    });
  }

  async updatePledgeCampaign(
    id: string,
    data: Partial<typeof schemaExports.pledgeCampaign.$inferInsert>,
  ) {
    const [row] = await this.db
      .update(schemaExports.pledgeCampaign)
      .set(data)
      .where(eq(schemaExports.pledgeCampaign.id, id))
      .returning();
    return row;
  }

  async listPledgesByCampaign(campaignId: string) {
    return await this.db.query.stewardshipPledge.findMany({
      where: eq(schemaExports.stewardshipPledge.pledgeCampaignId, campaignId),
    });
  }
}
