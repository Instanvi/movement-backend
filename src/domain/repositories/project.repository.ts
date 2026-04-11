import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/project.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL } from 'drizzle-orm';

@Injectable()
export class ProjectRepository implements BaseRepository<
  typeof schema.project
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.project)
      .where(eq(schema.project.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schema.project).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schema.project.$inferInsert) {
    const results = await this.db
      .insert(schema.project)
      .values(data)
      .returning();
    return results[0];
  }

  async update(id: string, data: Partial<typeof schema.project.$inferInsert>) {
    const results = await this.db
      .update(schema.project)
      .set(data)
      .where(eq(schema.project.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.project).where(eq(schema.project.id, id));
  }

  async findActiveByBranch(
    branchId: string,
    pagination?: { limit: number; offset: number },
  ) {
    return this.findAll(
      and(
        eq(schema.project.branchId, branchId),
        eq(schema.project.status, 'active'),
      ),
      pagination,
    );
  }
}
