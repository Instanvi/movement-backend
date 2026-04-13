import { Injectable } from '@nestjs/common';
import { DonationRepository } from '../../domain/repositories/donation.repository';
import { CreateDonationDto } from './dto/donation.dto';
import { createPaginationResult } from '../../core/utils/pagination.utils';

@Injectable()
export class DonationService {
  constructor(private readonly donationRepo: DonationRepository) {}

  async create(
    churchId: string,
    branchId: string,
    donorId: string,
    data: CreateDonationDto,
  ) {
    return await this.donationRepo.create({
      ...data,
      amount: data.amount.toString(), // Drizzle decimal expects string usually or number depending on config
      churchId,
      branchId,
      donorId,
    });
  }

  async listByBranch(
    branchId: string,
    pagination: { limit: number; offset: number },
  ) {
    const { items, total } = await this.donationRepo.findByBranch(
      branchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }

  async listByChurch(
    churchId: string,
    pagination: { limit: number; offset: number },
  ) {
    const { items, total } = await this.donationRepo.findByOrganization(
      churchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }
}
