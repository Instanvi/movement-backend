import { ApiProperty } from '@nestjs/swagger';

export class DonationSummaryDto {
  @ApiProperty({ example: 12500 })
  total: number;

  @ApiProperty({ example: 42 })
  count: number;
}

export class BranchPerformanceDto {
  @ApiProperty({ example: 'branch-uuid' })
  branchId: string | null;

  @ApiProperty({ example: 'Headquarters' })
  branchName: string;

  @ApiProperty({ example: 7800 })
  total: number;
}

export class ProjectOverviewDto {
  @ApiProperty({ example: 3 })
  activeCount: number;

  @ApiProperty({ example: 250000 })
  totalTarget: number | null;

  @ApiProperty({ example: 94000 })
  totalRaised: number | null;
}

export class ReportOverviewDto {
  @ApiProperty({ type: DonationSummaryDto })
  totalDonations: DonationSummaryDto;

  @ApiProperty({ type: [BranchPerformanceDto] })
  branchPerformance: BranchPerformanceDto[];

  @ApiProperty({ type: ProjectOverviewDto })
  projects: ProjectOverviewDto;
}
