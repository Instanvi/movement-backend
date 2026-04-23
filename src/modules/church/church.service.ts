import { Injectable } from '@nestjs/common';
import { ChurchRepository } from '../../domain/repositories/church.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { MessagingRepository } from '../../domain/repositories/messaging.repository';
import { ReportRepository } from '../../domain/repositories/report.repository';
import { createPaginationResult } from '../../core/utils/pagination.utils';

@Injectable()
export class ChurchService {
  constructor(
    private readonly churchRepo: ChurchRepository,
    private readonly branchRepo: BranchRepository,
    private readonly donationRepo: DonationRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly messagingRepo: MessagingRepository,
    private readonly reportRepo: ReportRepository,
  ) {}

  async getChurch(id: string) {
    return this.churchRepo.findOne(id);
  }

  async updateChurch(id: string, data: Partial<{ name: string; logo: string; denomination: string; metadata: string }>) {
    return this.churchRepo.update(id, data);
  }

  async getBranches(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    const { items, total } = await this.branchRepo.findByChurch(
      churchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }

  async getReport(churchId: string) {
    return this.reportRepo.getOrganizationOverview(churchId);
  }

  // Unified messagings for church and branches
  async getMessagings(churchId: string, branchId?: string) {
    return this.messagingRepo.findByBranchOrChurch(churchId, branchId);
  }
}
