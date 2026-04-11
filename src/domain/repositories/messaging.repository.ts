import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schema from '../../core/schema/messaging.schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL } from 'drizzle-orm';

@Injectable()
export class MessagingRepository implements BaseRepository<
  typeof schema.messaging
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schema.messaging)
      .where(eq(schema.messaging.id, id))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schema.messaging).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schema.messaging.$inferInsert) {
    const results = await this.db
      .insert(schema.messaging)
      .values(data)
      .returning();
    return results[0];
  }

  async update(
    id: string,
    data: Partial<typeof schema.messaging.$inferInsert>,
  ) {
    const results = await this.db
      .update(schema.messaging)
      .set(data)
      .where(eq(schema.messaging.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db.delete(schema.messaging).where(eq(schema.messaging.id, id));
  }

  async findByBranchOrChurch(
    churchId: string,
    branchId?: string,
    pagination?: { limit: number; offset: number },
  ) {
    if (branchId) {
      return this.findAll(
        and(
          eq(schema.messaging.churchId, churchId),
          eq(schema.messaging.branchId, branchId),
        ),
        pagination,
      );
    }
    return this.findAll(eq(schema.messaging.churchId, churchId), pagination);
  }
}
