import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/donation.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, SQL, sql } from 'drizzle-orm';

@Injectable()
export class DonationRepository implements BaseRepository<
  typeof schema.donation
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.donation)
      .where(eq(schema.donation.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit?: number; offset?: number }) {
    const itemsQuery = this.db.select().from(schema.donation).$dynamic();
    if (where) itemsQuery.where(where);
    if (pagination) {
      if (pagination.limit) itemsQuery.limit(pagination.limit);
      if (pagination.offset) itemsQuery.offset(pagination.offset);
    }
    const items = await itemsQuery;

    const totalQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.donation);
    if (where) totalQuery.where(where);
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.count ?? 0);

    return { items, total };
  }

  async create(data: typeof schema.donation.$inferInsert) {
    const results = await this.db
      .insert(schema.donation)
      .values(data)
      .returning();
    return results[0];
  }

  async update(id: string, data: Partial<typeof schema.donation.$inferInsert>) {
    const results = await this.db
      .update(schema.donation)
      .set(data)
      .where(eq(schema.donation.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.donation).where(eq(schema.donation.id, id));
  }

  async findByBranch(
    branchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    return this.findAll(eq(schema.donation.branchId, branchId), pagination);
  }

  async findByOrganization(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    return this.findAll(eq(schema.donation.churchId, churchId), pagination);
  }
}
