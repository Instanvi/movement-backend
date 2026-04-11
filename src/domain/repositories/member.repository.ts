import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/member.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL } from 'drizzle-orm';

const ROLE_PRIORITY: Record<string, number> = {
  overseer: 0,
  admin: 1,
  pastor: 2,
  member: 3,
};

@Injectable()
export class MemberRepository implements BaseRepository<typeof schema.member> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.member)
      .where(eq(schema.member.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schema.member).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schema.member.$inferInsert) {
    const results = await this.db
      .insert(schema.member)
      .values(data)
      .returning();
    return results[0];
  }

  async update(id: string, data: Partial<typeof schema.member.$inferInsert>) {
    const results = await this.db
      .update(schema.member)
      .set(data)
      .where(eq(schema.member.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.member).where(eq(schema.member.id, id));
  }

  async findByChurch(churchId: string) {
    return this.findAll(eq(schema.member.churchId, churchId));
  }

  async findByFamilyId(familyId: string) {
    return this.findAll(eq(schema.member.familyId, familyId));
  }

  async findByUserInChurch(userId: string, churchId: string) {
    return this.findMembershipForRoleCheck(userId, churchId, undefined);
  }

  /**
   * Resolves membership for authorization: prefers church-wide leadership (overseer, admin)
   * when a branch is specified; otherwise picks the highest-priority role in the church.
   */
  async findMembershipForRoleCheck(
    userId: string,
    churchId: string,
    branchId?: string,
  ) {
    const rows = await this.db
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.userId, userId),
          eq(schema.member.churchId, churchId),
        ),
      );

    if (rows.length === 0) {
      return undefined;
    }

    const isChurchWide = (r: (typeof rows)[0]) =>
      r.role === 'overseer' || r.role === 'admin';

    if (branchId) {
      const leadership = rows.find(isChurchWide);
      if (leadership) {
        return leadership;
      }
      return rows.find((r) => r.branchId === branchId);
    }

    return rows.sort(
      (a, b) => (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99),
    )[0];
  }
}
