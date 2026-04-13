import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { CreateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async create(branchId: string, data: CreateProjectDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.projectRepo.create({
      ...data,
      churchId,
      branchId: data.branchId || branchId,
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
