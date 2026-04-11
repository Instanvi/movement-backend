import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/schema/church_setting.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ChurchSettingRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  async getSetting(churchId: string) {
    const results = await this.db
      .select()
      .from(schema.churchSetting)
      .where(eq(schema.churchSetting.churchId, churchId))
      .limit(1);
    return results[0];
  }

  async updateSetting(
    churchId: string,
    data: Partial<typeof schema.churchSetting.$inferInsert>,
  ) {
    const results = await this.db
      .update(schema.churchSetting)
      .set(data)
      .where(eq(schema.churchSetting.churchId, churchId))
      .returning();
    return results[0];
  }

  // Custom Fields
  async createCustomField(data: typeof schema.customField.$inferInsert) {
    const results = await this.db
      .insert(schema.customField)
      .values(data)
      .returning();
    return results[0];
  }

  async findCustomFields(churchId: string) {
    return await this.db
      .select()
      .from(schema.customField)
      .where(eq(schema.customField.churchId, churchId));
  }
}
