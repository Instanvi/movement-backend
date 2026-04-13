import { Injectable, NotFoundException } from '@nestjs/common';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { CreateDonationDto } from './dto/donation.dto';
import { createPaginationResult } from '../../core/utils/pagination.utils';

@Injectable()
export class DonationService {
  constructor(
    private readonly donationRepo: DonationRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  async create(branchId: string, donorId: string, data: CreateDonationDto) {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');

    return await this.donationRepo.create({
      ...data,
      amount: data.amount.toString(),
      churchId: branch.churchId,
      branchId,
      donorId,
    });
  }

  async listByBranch(
    branchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    const { items, total } = await this.donationRepo.findByBranch(
      branchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }

  async listByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    const { items, total } = await this.donationRepo.findByOrganization(
      churchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }
}
