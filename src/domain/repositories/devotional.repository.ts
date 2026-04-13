import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/devotional.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, sql, desc } from 'drizzle-orm';

@Injectable()
export class DevotionalRepository implements BaseRepository<
  typeof schema.devotional
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.devotional)
      .where(eq(schema.devotional.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit?: number; offset?: number }) {
    const itemsQuery = this.db.select().from(schema.devotional).$dynamic();
    if (where) itemsQuery.where(where);
    if (pagination) {
      if (pagination.limit) itemsQuery.limit(pagination.limit);
      if (pagination.offset) itemsQuery.offset(pagination.offset);
    }
    itemsQuery.orderBy(
      desc(schema.devotional.publishDate),
      desc(schema.devotional.timeOfDay),
    );

    const items = await itemsQuery;

    const totalQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.devotional);
    if (where) totalQuery.where(where);
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.count ?? 0);

    return { items, total };
  }

  async create(data: typeof schema.devotional.$inferInsert) {
    const results = await this.db
      .insert(schema.devotional)
      .values(data)
      .returning();
    return results[0];
  }

  async update(
    id: string,
    data: Partial<typeof schema.devotional.$inferInsert>,
  ) {
    const results = await this.db
      .update(schema.devotional)
      .set(data)
      .where(eq(schema.devotional.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.devotional).where(eq(schema.devotional.id, id));
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    return this.findAll(eq(schema.devotional.churchId, churchId), pagination);
  }
}
