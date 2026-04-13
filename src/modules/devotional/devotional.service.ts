import { Injectable, NotFoundException } from '@nestjs/common';
import { DevotionalRepository } from '../../domain/repositories/devotional.repository';
import { CreateDevotionalDto, UpdateDevotionalDto } from './dto/devotional.dto';
import { createPaginationResult } from '../../core/utils/pagination.utils';

@Injectable()
export class DevotionalService {
  constructor(private readonly devotionalRepo: DevotionalRepository) {}

  async create(churchId: string, dto: CreateDevotionalDto) {
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
    churchId: string,
    pagination: { limit?: number; offset?: number },
  ) {
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
