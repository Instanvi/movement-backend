import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { user } from '../../core/schema/user.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, SQL, sql } from 'drizzle-orm';

type UserSelect = typeof user.$inferSelect;
type UserInsert = typeof user.$inferInsert;

@Injectable()
export class UserRepository implements BaseRepository<typeof user> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string): Promise<UserSelect | undefined> {
    const [result] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    return result;
  }

  async findByEmail(email: string): Promise<UserSelect | undefined> {
    const [result] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    return result;
  }

  async findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: UserSelect[]; total: number }> {
    let query = this.db.select().from(user).$dynamic();
    if (where) query = query.where(where);

    if (pagination) {
      if (pagination.limit != null) query = query.limit(pagination.limit);
      if (pagination.offset != null) query = query.offset(pagination.offset);
    }

    const [items, [{ total }]] = await Promise.all([
      query,
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(user)
        .where(where ?? sql`true`),
    ]);

    return { items: items as UserSelect[], total: total ?? 0 };
  }

  async create(data: UserInsert): Promise<UserSelect> {
    const [result] = await this.db.insert(user).values(data).returning();
    return result;
  }

  async update(id: string, data: Partial<UserInsert>): Promise<UserSelect> {
    const [result] = await this.db
      .update(user)
      .set(data)
      .where(eq(user.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(user).where(eq(user.id, id));
  }
}
