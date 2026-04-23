import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL, sql } from 'drizzle-orm';
import { BaseRepository } from './base.repository';
import { DB_CONNECTION } from '../../core/db.provider';
import * as schema from '../../core/schema';
import { member } from '../../core/schema/member.schema';

type MemberSelect = typeof member.$inferSelect;
type MemberInsert = typeof member.$inferInsert;

const ROLE_PRIORITY: Record<string, number> = {
  overseer: 0,
  admin: 1,
  pastor: 2,
  member: 3,
};

@Injectable()
export class MemberRepository implements BaseRepository<typeof member> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findOne(id: string): Promise<any | undefined> {
    const [result] = await this.db
      .select({
        id: member.id,
        churchId: member.churchId,
        branchId: member.branchId,
        userId: member.userId,
        familyId: member.familyId,
        role: member.role,
        familyRole: member.familyRole,
        gender: member.gender,
        maritalStatus: member.maritalStatus,
        birthDate: member.birthDate,
        phoneNumber: member.phoneNumber,
        ageGroup: member.ageGroup,
        isVisitor: member.isVisitor,
        status: member.status,
        createdBy: member.createdBy,
        createdAt: member.createdAt,
        archivedAt: member.archivedAt,
        user: {
          id: schema.user.id,
          name: schema.user.name,
          firstName: schema.user.firstName,
          lastName: schema.user.lastName,
          email: schema.user.email,
          image: schema.user.image,
        },
      })
      .from(member)
      .leftJoin(schema.user, eq(member.userId, schema.user.id))
      .where(eq(member.id, id))
      .limit(1);
    return result;
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: any[]; total: number }> {
    const itemsQuery = this.db
      .select({
        id: member.id,
        churchId: member.churchId,
        branchId: member.branchId,
        userId: member.userId,
        familyId: member.familyId,
        role: member.role,
        familyRole: member.familyRole,
        gender: member.gender,
        maritalStatus: member.maritalStatus,
        birthDate: member.birthDate,
        phoneNumber: member.phoneNumber,
        ageGroup: member.ageGroup,
        isVisitor: member.isVisitor,
        status: member.status,
        createdBy: member.createdBy,
        createdAt: member.createdAt,
        archivedAt: member.archivedAt,
        user: {
          id: schema.user.id,
          name: schema.user.name,
          firstName: schema.user.firstName,
          lastName: schema.user.lastName,
          email: schema.user.email,
          image: schema.user.image,
        },
      })
      .from(member)
      .leftJoin(schema.user, eq(member.userId, schema.user.id))
      .$dynamic();
    
    if (where) itemsQuery.where(where);
    if (pagination) {
      if (pagination.limit) itemsQuery.limit(pagination.limit);
      if (pagination.offset) itemsQuery.offset(pagination.offset);
    }
    const items = await itemsQuery;

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(member)
      .where(where ?? sql`true`);

    return { items, total: countResult?.count ?? 0 };
  }

  async create(data: MemberInsert): Promise<MemberSelect> {
    const [result] = await this.db.insert(member).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<MemberInsert>): Promise<MemberSelect> {
    const [result] = await this.db
      .update(member)
      .set(data)
      .where(eq(member.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    // Soft delete: set archivedAt timestamp instead of permanently deleting
    await this.db
      .update(member)
      .set({ archivedAt: new Date() })
      .where(eq(member.id, id));
  }

  async restore(id: string): Promise<MemberSelect> {
    // Restore archived member by setting archivedAt to null
    const [result] = await this.db
      .update(member)
      .set({ archivedAt: null })
      .where(eq(member.id, id))
      .returning();
    return result;
  }

  async permanentlyDelete(id: string): Promise<void> {
    // Hard delete: permanently remove from database (use with caution)
    await this.db.delete(member).where(eq(member.id, id));
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: any[]; total: number }> {
    return this.findAll(eq(member.churchId, churchId), pagination);
  }

  async findByBranch(
    branchId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: any[]; total: number }> {
    return this.findAll(eq(member.branchId, branchId), pagination);
  }

  async findByFamilyId(
    familyId: string,
  ): Promise<{ items: any[]; total: number }> {
    return this.findAll(eq(member.familyId, familyId));
  }

  async findByUserInChurch(
    userId: string,
    churchId: string,
  ): Promise<MemberSelect | undefined> {
    return this.findMembershipForRoleCheck(userId, churchId, undefined);
  }

  async findMembershipForRoleCheck(
    userId: string,
    churchId: string,
    branchId?: string,
  ): Promise<MemberSelect | undefined> {
    const rows = await this.db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.churchId, churchId)));

    if (rows.length === 0) return undefined;

    const isLeadership = (r: MemberSelect) =>
      r.role === 'overseer' || r.role === 'admin';

    if (branchId) {
      const leader = rows.find(isLeadership);
      if (leader) return leader;
      return rows.find((r) => r.branchId === branchId);
    }

    return rows.sort(
      (a, b) => (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99),
    )[0];
  }
}
