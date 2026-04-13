import { SQL } from 'drizzle-orm';
import { AnyPgTable } from 'drizzle-orm/pg-core';

export interface BaseRepository<T extends AnyPgTable> {
  findOne(id: string): Promise<T['$inferSelect'] | undefined>;
  findAll(
    where?: SQL,
    pagination?: { limit?: number; offset?: number },
  ): Promise<{ items: T['$inferSelect'][]; total: number }>;
  create(data: T['$inferInsert']): Promise<T['$inferSelect']>;
  update(
    id: string,
    data: Partial<T['$inferInsert']>,
  ): Promise<T['$inferSelect']>;
  delete(id: string): Promise<void>;
}
