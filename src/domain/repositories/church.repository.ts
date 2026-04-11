import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/church.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, SQL } from 'drizzle-orm';

@Injectable()
export class ChurchRepository implements BaseRepository<typeof schema.church> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.church)
      .where(eq(schema.church.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schema.church).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schema.church.$inferInsert) {
    const results = await this.db
      .insert(schema.church)
      .values(data)
      .returning();
    return results[0];
  }

  async update(id: string, data: Partial<typeof schema.church.$inferInsert>) {
    const results = await this.db
      .update(schema.church)
      .set(data)
      .where(eq(schema.church.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.church).where(eq(schema.church.id, id));
  }

  async findBySlug(slug: string) {
    const results = await this.db
      .select()
      .from(schema.church)
      .where(eq(schema.church.slug, slug))
      .limit(1);
    return results[0];
  }
}
