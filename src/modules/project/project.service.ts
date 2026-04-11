import { Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { CreateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async create(churchId: string, data: CreateProjectDto) {
    return await this.projectRepo.create({
      ...data,
      churchId,
      branchId: data.branchId,
      targetAmount: data.targetAmount.toString(),
      currentAmount: '0',
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: 'active',
    });
  }

  async listActive(
    branchId: string,
    pagination?: { limit: number; offset: number },
  ) {
    return await this.projectRepo.findActiveByBranch(branchId, pagination);
  }
}
