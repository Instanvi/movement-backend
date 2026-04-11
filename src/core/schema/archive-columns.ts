import { timestamp } from 'drizzle-orm/pg-core';

/** Nullable = active; set when the row is archived (soft-hide from default listings). */
export function archiveAtColumn() {
  return timestamp('archived_at');
}
