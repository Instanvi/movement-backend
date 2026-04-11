import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/schema/communication.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CommunicationRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  // Announcements
  async createAnnouncement(data: typeof schema.announcement.$inferInsert) {
    const results = await this.db
      .insert(schema.announcement)
      .values(data)
      .returning();
    return results[0];
  }

  async findAnnouncements(churchId: string) {
    return await this.db
      .select()
      .from(schema.announcement)
      .where(eq(schema.announcement.churchId, churchId));
  }

  // Forms
  async createForm(data: typeof schema.form.$inferInsert) {
    const results = await this.db.insert(schema.form).values(data).returning();
    return results[0];
  }

  async findForms(churchId: string) {
    return await this.db
      .select()
      .from(schema.form)
      .where(eq(schema.form.churchId, churchId));
  }

  async getForm(formId: string) {
    const results = await this.db
      .select()
      .from(schema.form)
      .where(eq(schema.form.id, formId))
      .limit(1);
    return results[0];
  }

  // Submissions
  async createFormSubmission(data: typeof schema.formSubmission.$inferInsert) {
    const results = await this.db
      .insert(schema.formSubmission)
      .values(data)
      .returning();
    return results[0];
  }

  async findSubmissionsByForm(formId: string) {
    return await this.db
      .select()
      .from(schema.formSubmission)
      .where(eq(schema.formSubmission.formId, formId));
  }
}
