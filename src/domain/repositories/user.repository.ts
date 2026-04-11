import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/user.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, SQL } from 'drizzle-orm';

@Injectable()
export class UserRepository implements BaseRepository<typeof schema.user> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, id))
      .limit(1);
    return results[0];
  }

  async findByEmail(email: string) {
    const results = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schema.user).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schema.user.$inferInsert) {
    const results = await this.db.insert(schema.user).values(data).returning();
    return results[0];
  }

  async update(id: string, data: Partial<typeof schema.user.$inferInsert>) {
    const results = await this.db
      .update(schema.user)
      .set(data)
      .where(eq(schema.user.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.user).where(eq(schema.user.id, id));
  }
}
