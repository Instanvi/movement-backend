import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportRepository } from '../../domain/repositories/report.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  async getOverview(branchId: string) {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return this.reportRepo.getOrganizationOverview(branch.churchId);
  }
}
