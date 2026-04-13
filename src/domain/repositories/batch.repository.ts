import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq, ilike, isNotNull, isNull, sql, SQL } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { DB_CONNECTION } from '../../core/db.provider';
import * as schema from '../../core/schema';
import { batch } from '../../core/schema/batch.schema';
import { donation } from '../../core/schema/donation.schema';

type BatchSelect = typeof batch.$inferSelect;
type BatchInsert = typeof batch.$inferInsert;

export type BatchListFilter = 'all' | 'open' | 'archived';

@Injectable()
export class BatchRepository implements BaseRepository<typeof batch> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private batchFilterParts(churchId: string, filter: BatchListFilter): SQL[] {
    const parts: SQL[] = [eq(batch.churchId, churchId)];
    if (filter === 'open') {
      parts.push(isNull(batch.archivedAt));
    } else if (filter === 'archived') {
      parts.push(isNotNull(batch.archivedAt));
    }
    return parts;
  }

  async findOne(id: string): Promise<BatchSelect | undefined> {
    const [result] = await this.db.select().from(batch).where(eq(batch.id, id));
    return result;
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: BatchSelect[]; total: number }> {
    const filters = eq(batch.churchId, churchId);
    let query = this.db.select().from(batch).where(filters).$dynamic();

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(batch)
        .where(filters),
    ]);

    return { items: items as BatchSelect[], total: total ?? 0 };
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: BatchSelect[]; total: number }> {
    let query = this.db.select().from(batch).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(batch)
        .where(where ?? sql`true`),
    ]);

    return { items: items as BatchSelect[], total: total ?? 0 };
  }

  async create(data: BatchInsert): Promise<BatchSelect> {
    const [result] = await this.db.insert(batch).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<BatchInsert>): Promise<BatchSelect> {
    const [result] = await this.db
      .update(batch)
      .set(data)
      .where(eq(batch.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(batch).where(eq(batch.id, id));
  }

  async countBatchesForChurch(
    churchId: string,
    filter: BatchListFilter,
    search?: string,
  ): Promise<number> {
    const parts = this.batchFilterParts(churchId, filter);
    if (search?.trim()) {
      const safe = search.trim().replace(/[%_\\]/g, '');
      if (safe.length > 0) {
        parts.push(ilike(batch.name, `%${safe}%`));
      }
    }
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(batch)
      .where(and(...parts));
    return row?.n ?? 0;
  }

  async countDistinctDonorsForChurchBatches(
    churchId: string,
    filter: BatchListFilter,
    search?: string,
  ): Promise<number> {
    const parts = this.batchFilterParts(churchId, filter);
    if (search?.trim()) {
      const safe = search.trim().replace(/[%_\\]/g, '');
      if (safe.length > 0) {
        parts.push(ilike(batch.name, `%${safe}%`));
      }
    }
    const [row] = await this.db
      .select({
        n: sql<number>`count(distinct ${donation.donorId})::int`,
      })
      .from(donation)
      .innerJoin(batch, eq(donation.batchId, batch.id))
      .where(and(...parts, isNotNull(donation.batchId)));
    return row?.n ?? 0;
  }

  async listBatchesWithAggregates(
    churchId: string,
    opts?: {
      filter?: BatchListFilter;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const filter = opts?.filter ?? 'all';
    const parts = this.batchFilterParts(churchId, filter);
    if (opts?.search?.trim()) {
      const safe = opts.search.trim().replace(/[%_\\]/g, '');
      if (safe.length > 0) {
        parts.push(ilike(batch.name, `%${safe}%`));
      }
    }

    let q = this.db
      .select({
        id: batch.id,
        name: batch.name,
        description: batch.description,
        status: batch.status,
        batchDate: batch.batchDate,
        churchId: batch.churchId,
        branchId: batch.branchId,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
        archivedAt: batch.archivedAt,
        uniqueContributors: sql<number>`count(distinct ${donation.donorId})::int`,
        totalAmount: sql<string>`coalesce(sum(${donation.amount}), 0)::text`,
      })
      .from(batch)
      .leftJoin(donation, eq(donation.batchId, batch.id))
      .where(and(...parts))
      .groupBy(batch.id)
      .orderBy(desc(batch.batchDate))
      .$dynamic();

    if (opts?.limit != null) {
      q = q.limit(opts.limit);
    }
    if (opts?.offset != null) {
      q = q.offset(opts.offset);
    }

    return await q;
  }

  /** Sum completed, non-archived donations on this batch (for deposit amount). */
  async sumDonationAmountForBatch(batchId: string): Promise<string> {
    const [row] = await this.db
      .select({
        total: sql<string>`coalesce(sum(${donation.amount}), 0)::text`,
      })
      .from(donation)
      .where(and(eq(donation.batchId, batchId), isNull(donation.archivedAt)));
    return row?.total ?? '0';
  }

  async countDonationsForBatch(batchId: string): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(donation)
      .where(eq(donation.batchId, batchId));
    return row?.n ?? 0;
  }
}
