import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../../domain/repositories/report.repository';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepo: ReportRepository) {}

  async getOverview(churchId: string) {
    return this.reportRepo.getOrganizationOverview(churchId);
  }
}
