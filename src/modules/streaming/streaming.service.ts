import { Injectable, NotFoundException } from '@nestjs/common';
import { StreamingRepository } from '../../domain/repositories/streaming.repository';
import {
  CreateStreamPlatformDto,
  UpdateStreamStatusDto,
} from './dto/streaming.dto';
import { createPaginationResult } from '../../core/utils/pagination.utils';

@Injectable()
export class StreamingService {
  constructor(private readonly streamingRepo: StreamingRepository) {}

  async create(churchId: string, dto: CreateStreamPlatformDto) {
    return await this.streamingRepo.create({
      ...dto,
      churchId,
      status: 'offline',
    });
  }

  async getPlatform(id: string) {
    const platform = await this.streamingRepo.findOne(id);
    if (!platform) throw new NotFoundException('Platform not found');
    return platform;
  }

  async updateStatus(id: string, dto: UpdateStreamStatusDto) {
    await this.getPlatform(id);
    return await this.streamingRepo.updateStatus(id, dto.status);
  }

  async list(
    churchId: string,
    branchId: string | undefined,
    pagination: { limit: number; offset: number },
  ) {
    const { items, total } = await this.streamingRepo.findByChurch(
      churchId,
      branchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }

  async delete(id: string) {
    return await this.streamingRepo.delete(id);
  }

  async addMetric(platformId: string, viewerCount: number, status: string) {
    return await this.streamingRepo.addMetric({
      platformId,
      viewerCount,
      platformStatus: status,
    });
  }

  async getMetrics(churchId: string) {
    return await this.streamingRepo.getMetrics(churchId);
  }
}
