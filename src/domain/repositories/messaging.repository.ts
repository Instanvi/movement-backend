import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { messaging } from '../../core/schema/messaging.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, sql } from 'drizzle-orm';

type MessagingSelect = typeof messaging.$inferSelect;
type MessagingInsert = typeof messaging.$inferInsert;

@Injectable()
export class MessagingRepository implements BaseRepository<typeof messaging> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string): Promise<MessagingSelect | undefined> {
    const [result] = await this.db
      .select()
      .from(messaging)
      .where(eq(messaging.id, id))
      .limit(1);
    return result;
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: MessagingSelect[]; total: number }> {
    let query = this.db.select().from(messaging).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(messaging)
        .where(where ?? sql`true`),
    ]);

    return { items: items as MessagingSelect[], total: total ?? 0 };
  }

  async create(data: MessagingInsert): Promise<MessagingSelect> {
    const [result] = await this.db.insert(messaging).values(data).returning();
    return result;
  }

  async update(
    id: string,
    data: Partial<MessagingInsert>,
  ): Promise<MessagingSelect> {
    const [result] = await this.db
      .update(messaging)
      .set(data)
      .where(eq(messaging.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(messaging).where(eq(messaging.id, id));
  }

  async findByBranchOrChurch(
    churchId: string,
    branchId?: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: MessagingSelect[]; total: number }> {
    const conditions: SQL[] = [eq(messaging.churchId, churchId)];
    if (branchId) {
      conditions.push(eq(messaging.branchId, branchId));
    }
    return this.findAll(and(...conditions), pagination);
  }
}
