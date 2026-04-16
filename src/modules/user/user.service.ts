import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_CONNECTION } from '../../core/db.provider';
import * as schema from '../../core/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getUserMemberships(userId: string) {
    return this.db.query.member.findMany({
      where: eq(schema.member.userId, userId),
      with: {
        church: true,
        branch: true,
      },
    });
  }

  async getWorkspaceInfo(userId: string, branchId: string) {
    const mem = await this.db.query.member.findFirst({
      where: and(
        eq(schema.member.userId, userId),
        eq(schema.member.branchId, branchId),
      ),
    });
    if (!mem) {
      throw new NotFoundException(
        'Membership not found for the specified branch',
      );
    }
    return mem;
  }
}
