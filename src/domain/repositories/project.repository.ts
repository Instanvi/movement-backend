import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { project } from '../../core/schema/project.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, sql } from 'drizzle-orm';

type ProjectSelect = typeof project.$inferSelect;
type ProjectInsert = typeof project.$inferInsert;

@Injectable()
export class ProjectRepository implements BaseRepository<typeof project> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string): Promise<ProjectSelect | undefined> {
    const [result] = await this.db
      .select()
      .from(project)
      .where(eq(project.id, id))
      .limit(1);
    return result;
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: ProjectSelect[]; total: number }> {
    let query = this.db.select().from(project).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(project)
        .where(where ?? sql`true`),
    ]);

    return { items: items as ProjectSelect[], total: total ?? 0 };
  }

  async create(data: ProjectInsert): Promise<ProjectSelect> {
    const [result] = await this.db.insert(project).values(data).returning();
    return result;
  }

  async update(
    id: string,
    data: Partial<ProjectInsert>,
  ): Promise<ProjectSelect> {
    const [result] = await this.db
      .update(project)
      .set(data)
      .where(eq(project.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(project).where(eq(project.id, id));
  }

  async findActiveByBranch(
    branchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: ProjectSelect[]; total: number }> {
    return this.findAll(
      and(eq(project.branchId, branchId), eq(project.status, 'active')),
      pagination,
    );
  }
}
