import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/branch.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql, SQL } from 'drizzle-orm';

@Injectable()
export class BranchRepository implements BaseRepository<typeof schema.branch> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.branch)
      .where(eq(schema.branch.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schema.branch).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schema.branch.$inferInsert) {
    const results = await this.db
      .insert(schema.branch)
      .values(data)
      .returning();
    return results[0];
  }

  async update(id: string, data: Partial<typeof schema.branch.$inferInsert>) {
    const results = await this.db
      .update(schema.branch)
      .set(data)
      .where(eq(schema.branch.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.branch).where(eq(schema.branch.id, id));
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit: number; offset: number },
  ) {
    return this.findAll(eq(schema.branch.churchId, churchId), pagination);
  }

  async countByChurchId(churchId: string): Promise<number> {
    const [row] = await this.db
      .select({ n: sql<number>`count(*)::int`.mapWith(Number) })
      .from(schema.branch)
      .where(eq(schema.branch.churchId, churchId));
    return row?.n ?? 0;
  }
}
