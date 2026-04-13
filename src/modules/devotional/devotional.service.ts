import { Injectable, NotFoundException } from '@nestjs/common';
import { DevotionalRepository } from '../../domain/repositories/devotional.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { CreateDevotionalDto, UpdateDevotionalDto } from './dto/devotional.dto';
import { createPaginationResult } from '../../core/utils/pagination.utils';

@Injectable()
export class DevotionalService {
  constructor(
    private readonly devotionalRepo: DevotionalRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async create(branchId: string, dto: CreateDevotionalDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.devotionalRepo.create({
      ...dto,
      churchId,
    });
  }

  async findOne(id: string) {
    const devotional = await this.devotionalRepo.findOne(id);
    if (!devotional) throw new NotFoundException('Devotional not found');
    return devotional;
  }

  async listByChurch(
    branchId: string,
    pagination: { limit?: number; offset?: number },
  ) {
    const churchId = await this.resolveChurchId(branchId);
    const { items, total } = await this.devotionalRepo.findByChurch(
      churchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }

  async update(id: string, dto: UpdateDevotionalDto) {
    await this.findOne(id);
    return await this.devotionalRepo.update(id, dto);
  }

  async delete(id: string) {
    await this.findOne(id);
    return await this.devotionalRepo.delete(id);
  }
}
