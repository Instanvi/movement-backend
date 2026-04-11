import { Injectable } from '@nestjs/common';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { CreateBranchDto } from './dto/branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepo: BranchRepository) {}

  async create(churchId: string, data: CreateBranchDto) {
    return await this.branchRepo.create({
      ...data,
      churchId,
    });
  }

  async getById(id: string) {
    return await this.branchRepo.findOne(id);
  }

  async listByChurch(
    churchId: string,
    pagination?: { limit: number; offset: number },
  ) {
    return await this.branchRepo.findByChurch(churchId, pagination);
  }

  async update(id: string, data: Partial<CreateBranchDto>) {
    return await this.branchRepo.update(id, data);
  }

  async delete(id: string) {
    return await this.branchRepo.delete(id);
  }
}
