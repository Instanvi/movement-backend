import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { DB_CONNECTION } from '../../core/db.provider';
import * as schema from '../../core/schema';
import { subscription } from '../../core/schema/subscription.schema';

type SubscriptionSelect = typeof subscription.$inferSelect;
type SubscriptionInsert = typeof subscription.$inferInsert;

@Injectable()
export class SubscriptionRepository implements BaseRepository<
  typeof subscription
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(id: string): Promise<SubscriptionSelect | undefined> {
    const [result] = await this.db
      .select()
      .from(subscription)
      .where(eq(subscription.id, id));
    return result;
  }

  async findByChurchId(churchId: string): Promise<SubscriptionSelect[]> {
    return await this.db
      .select()
      .from(subscription)
      .where(eq(subscription.churchId, churchId));
  }

  async findActiveByChurchId(
    churchId: string,
  ): Promise<SubscriptionSelect | undefined> {
    const [result] = await this.db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.churchId, churchId),
          eq(subscription.status, 'active'),
        ),
      );
    return result;
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: SubscriptionSelect[]; total: number }> {
    let query = this.db.select().from(subscription).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(subscription)
        .where(where ?? sql`true`),
    ]);

    return { items: items as SubscriptionSelect[], total: total ?? 0 };
  }

  async create(data: SubscriptionInsert): Promise<SubscriptionSelect> {
    const [result] = await this.db
      .insert(subscription)
      .values(data)
      .returning();
    return result;
  }

  async update(
    id: string,
    data: Partial<SubscriptionInsert>,
  ): Promise<SubscriptionSelect> {
    const [result] = await this.db
      .update(subscription)
      .set(data)
      .where(eq(subscription.id, id))
      .returning();
    return result;
  }

  async updateByStripeId(
    stripeSubscriptionId: string,
    data: Partial<SubscriptionInsert>,
  ): Promise<SubscriptionSelect> {
    const [result] = await this.db
      .update(subscription)
      .set(data)
      .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(subscription).where(eq(subscription.id, id));
  }
}
