import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as schemaExports from '../../core/schema';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, SQL } from 'drizzle-orm';

@Injectable()
export class StreamingRepository implements BaseRepository<
  typeof schemaExports.streamPlatform
> {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<typeof schemaExports>,
  ) {}

  async findOne(id: string) {
    const results = await this.db
      .select()
      .from(schemaExports.streamPlatform)
      .where(eq(schemaExports.streamPlatform.id, id))
      .limit(1);
    return results[0];
  }

  async findOneByStreamKey(streamKey: string) {
    const results = await this.db
      .select()
      .from(schemaExports.streamPlatform)
      .where(eq(schemaExports.streamPlatform.streamKey, streamKey))
      .limit(1);
    return results[0];
  }

  async findAll(where?: SQL, pagination?: { limit: number; offset: number }) {
    let query = this.db.select().from(schemaExports.streamPlatform).$dynamic();
    if (where) query = query.where(where);
    if (pagination)
      query = query.limit(pagination.limit).offset(pagination.offset);
    return await query;
  }

  async create(data: typeof schemaExports.streamPlatform.$inferInsert) {
    const results = await this.db
      .insert(schemaExports.streamPlatform)
      .values(data)
      .returning();
    return results[0];
  }

  async update(
    id: string,
    data: Partial<typeof schemaExports.streamPlatform.$inferInsert>,
  ) {
    const results = await this.db
      .update(schemaExports.streamPlatform)
      .set(data)
      .where(eq(schemaExports.streamPlatform.id, id))
      .returning();
    return results[0];
  }

  async delete(id: string) {
    await this.db
      .delete(schemaExports.streamPlatform)
      .where(eq(schemaExports.streamPlatform.id, id));
  }

  async updateStatus(id: string, status: string) {
    const updateData: Partial<
      typeof schemaExports.streamPlatform.$inferInsert
    > = { status };
    if (status === 'live') updateData.lastStartedAt = new Date();
    if (status === 'offline') updateData.lastStoppedAt = new Date();

    await this.db
      .update(schemaExports.streamPlatform)
      .set(updateData)
      .where(eq(schemaExports.streamPlatform.id, id));
  }

  async findByChurch(
    churchId: string,
    branchId?: string,
    pagination?: { limit: number; offset: number },
  ) {
    let where = eq(schemaExports.streamPlatform.churchId, churchId);
    if (branchId) {
      where = and(
        where,
        eq(schemaExports.streamPlatform.branchId, branchId),
      ) as SQL;
    }
    return this.findAll(where, pagination);
  }

  async addMetric(data: typeof schemaExports.streamMetric.$inferInsert) {
    const results = await this.db
      .insert(schemaExports.streamMetric)
      .values(data)
      .returning();
    return results[0];
  }

  async getMetrics(churchId: string, limit: number = 50) {
    return await this.db
      .select()
      .from(schemaExports.streamMetric)
      .innerJoin(
        schemaExports.streamPlatform,
        eq(
          schemaExports.streamMetric.platformId,
          schemaExports.streamPlatform.id,
        ),
      )
      .where(eq(schemaExports.streamPlatform.churchId, churchId))
      .orderBy(schemaExports.streamMetric.capturedAt)
      .limit(limit);
  }
}
