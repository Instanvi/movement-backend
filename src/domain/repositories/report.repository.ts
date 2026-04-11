import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/schema';
import { eq, sql, and } from 'drizzle-orm';

type DB = NodePgDatabase<typeof schema>;

@Injectable()
export class ReportRepository {
  constructor(@Inject(DB_CONNECTION) private readonly db: DB) {}

  async getOrganizationOverview(churchId: string) {
    const totalDonations = await this.db
      .select({
        total: sql<number>`sum(${schema.donation.amount})`.mapWith(Number),
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(schema.donation)
      .where(eq(schema.donation.churchId, churchId));

    const branchPerformance = await this.db
      .select({
        branchId: schema.donation.branchId,
        branchName: schema.branch.name,
        total: sql<number>`sum(${schema.donation.amount})`.mapWith(Number),
      })
      .from(schema.donation)
      .innerJoin(schema.branch, eq(schema.donation.branchId, schema.branch.id))
      .where(eq(schema.donation.churchId, churchId))
      .groupBy(schema.donation.branchId, schema.branch.name);

    const projectsStats = await this.db
      .select({
        activeCount: sql<number>`count(*)`.mapWith(Number),
        totalTarget: sql<number>`sum(${schema.project.targetAmount})`.mapWith(
          Number,
        ),
        totalRaised: sql<number>`sum(${schema.project.currentAmount})`.mapWith(
          Number,
        ),
      })
      .from(schema.project)
      .where(
        and(
          eq(schema.project.churchId, churchId),
          eq(schema.project.status, 'active'),
        ),
      );

    return {
      totalDonations: totalDonations[0],
      branchPerformance,
      projects: projectsStats[0],
    };
  }
}
