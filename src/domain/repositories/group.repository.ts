import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schemaExports from '../../core/schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL } from 'drizzle-orm';

@Injectable()
export class GroupRepository implements BaseRepository<
  typeof schemaExports.group
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schemaExports>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schemaExports.group)
      .where(eq(schemaExports.group.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schemaExports.group).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schemaExports.group.$inferInsert) {
    const results = await this.db
      .insert(schemaExports.group)
      .values(data)
      .returning();
    return results[0];
  }

  async update(
    id: string,
    data: Partial<typeof schemaExports.group.$inferInsert>,
  ) {
    const results = await this.db
      .update(schemaExports.group)
      .set(data)
      .where(eq(schemaExports.group.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db
      .delete(schemaExports.group)
      .where(eq(schemaExports.group.id, id));
  }

  async addMember(
    groupId: string,
    memberId: string,
    opts?: { isLeader?: boolean },
  ) {
    await this.db.insert(schemaExports.groupMember).values({
      groupId,
      memberId,
      isLeader: opts?.isLeader ?? false,
    });
  }

  async removeMember(groupId: string, memberId: string) {
    await this.db
      .delete(schemaExports.groupMember)
      .where(
        and(
          eq(schemaExports.groupMember.groupId, groupId),
          eq(schemaExports.groupMember.memberId, memberId),
        ),
      );
  }

  async getMembers(groupId: string) {
    return await this.db.query.groupMember.findMany({
      where: eq(schemaExports.groupMember.groupId, groupId),
      with: {
        member: true,
      },
    });
  }
}
