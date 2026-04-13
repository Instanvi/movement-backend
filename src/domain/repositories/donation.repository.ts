import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { DB_CONNECTION } from '../../core/db.provider';
import * as schema from '../../core/schema';
import { donation } from '../../core/schema/donation.schema';

type DonationSelect = typeof donation.$inferSelect;
type DonationInsert = typeof donation.$inferInsert;

@Injectable()
export class DonationRepository implements BaseRepository<typeof donation> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(id: string): Promise<DonationSelect | undefined> {
    const [result] = await this.db
      .select()
      .from(donation)
      .where(eq(donation.id, id))
      .limit(1);
    return result;
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: DonationSelect[]; total: number }> {
    let query = this.db.select().from(donation).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(donation)
        .where(where ?? sql`true`),
    ]);

    return { items: items as DonationSelect[], total: total ?? 0 };
  }

  async create(data: DonationInsert): Promise<DonationSelect> {
    const [result] = await this.db.insert(donation).values(data).returning();
    return result;
  }

  async update(
    id: string,
    data: Partial<DonationInsert>,
  ): Promise<DonationSelect> {
    const [result] = await this.db
      .update(donation)
      .set(data)
      .where(eq(donation.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(donation).where(eq(donation.id, id));
  }

  async findByBranch(
    branchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: DonationSelect[]; total: number }> {
    return this.findAll(eq(donation.branchId, branchId), pagination);
  }

  async findByOrganization(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: DonationSelect[]; total: number }> {
    return this.findAll(eq(donation.churchId, churchId), pagination);
  }
}
