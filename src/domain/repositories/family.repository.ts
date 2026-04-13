import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, SQL, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { DB_CONNECTION } from '../../core/db.provider';
import * as schema from '../../core/schema';
import { family } from '../../core/schema';

type FamilySelect = typeof family.$inferSelect;
type FamilyInsert = typeof family.$inferInsert;

@Injectable()
export class FamilyRepository implements BaseRepository<typeof family> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(id: string): Promise<FamilySelect | undefined> {
    const [result] = await this.db
      .select()
      .from(family)
      .where(eq(family.id, id));
    return result;
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: FamilySelect[]; total: number }> {
    const filters = eq(family.churchId, churchId);
    let query = this.db.select().from(family).where(filters).$dynamic();

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(family)
        .where(filters),
    ]);

    return { items: items as FamilySelect[], total: total ?? 0 };
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: FamilySelect[]; total: number }> {
    let query = this.db.select().from(family).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(family)
        .where(where ?? sql`true`),
    ]);

    return { items: items as FamilySelect[], total: total ?? 0 };
  }

  async create(data: FamilyInsert): Promise<FamilySelect> {
    const [result] = await this.db.insert(family).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<FamilyInsert>): Promise<FamilySelect> {
    const [result] = await this.db
      .update(family)
      .set(data)
      .where(eq(family.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(family).where(eq(family.id, id));
  }
}
