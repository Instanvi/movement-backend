import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { group, groupMember } from '../../core/schema/group.schema';
import * as schema from '../../core/schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, sql } from 'drizzle-orm';

type GroupSelect = typeof group.$inferSelect;
type GroupInsert = typeof group.$inferInsert;

@Injectable()
export class GroupRepository implements BaseRepository<typeof group> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(id: string): Promise<GroupSelect | undefined> {
    const results = await this.db
      .select()
      .from(group)
      .where(eq(group.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: GroupSelect[]; total: number }> {
    let query = this.db.select().from(group).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(group)
        .where(where ?? sql`true`),
    ]);

    return { items: items as GroupSelect[], total: total ?? 0 };
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: GroupSelect[]; total: number }> {
    const filters = eq(group.churchId, churchId);
    let query = this.db.select().from(group).where(filters).$dynamic();

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(group)
        .where(filters),
    ]);

    return { items: items as GroupSelect[], total: total ?? 0 };
  }

  async create(data: GroupInsert): Promise<GroupSelect> {
    const [result] = await this.db.insert(group).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<GroupInsert>): Promise<GroupSelect> {
    const [result] = await this.db
      .update(group)
      .set(data)
      .where(eq(group.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(group).where(eq(group.id, id));
  }

  async addMember(
    groupId: string,
    memberId: string,
    opts?: { isLeader?: boolean },
  ) {
    await this.db.insert(groupMember).values({
      groupId,
      memberId,
      isLeader: opts?.isLeader ?? false,
    });
  }

  async removeMember(groupId: string, memberId: string) {
    await this.db
      .delete(groupMember)
      .where(
        and(
          eq(groupMember.groupId, groupId),
          eq(groupMember.memberId, memberId),
        ),
      );
  }

  async getMembers(groupId: string) {
    return await this.db.query.groupMember.findMany({
      where: eq(groupMember.groupId, groupId),
      with: {
        member: true,
      },
    });
  }
}
