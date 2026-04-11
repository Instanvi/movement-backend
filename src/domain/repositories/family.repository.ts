import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, SQL } from 'drizzle-orm';
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
    pagination?: { limit: number; offset: number },
  ): Promise<FamilySelect[]> {
    const query = this.db
      .select()
      .from(family)
      .where(eq(family.churchId, churchId));

    if (pagination) {
      const results = await query
        .limit(pagination.limit)
        .offset(pagination.offset);
      return results as FamilySelect[];
    }

    const results = await query;
    return results as FamilySelect[];
  }

  async findAll(
    where?: SQL,
    pagination?: { limit: number; offset: number },
  ): Promise<FamilySelect[]> {
    let query = this.db.select().from(family).$dynamic();
    if (where) query = query.where(where);
    if (pagination) {
      query = query.limit(pagination.limit).offset(pagination.offset);
    }
    return await query;
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
