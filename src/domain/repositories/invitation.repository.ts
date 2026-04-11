import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/schema/invitation.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class InvitationRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async create(data: typeof schema.invitation.$inferInsert) {
    const results = await this.db
      .insert(schema.invitation)
      .values(data)
      .returning();
    return results[0];
  }

  async findByChurch(churchId: string) {
    return await this.db
      .select()
      .from(schema.invitation)
      .where(eq(schema.invitation.churchId, churchId));
  }

  async delete(id: string) {
    await this.db.delete(schema.invitation).where(eq(schema.invitation.id, id));
  }
}
