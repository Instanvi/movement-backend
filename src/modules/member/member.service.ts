import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { MemberRepository } from '../../domain/repositories/member.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import {
  CreateMemberDto,
  CreatePeopleBulkDto,
  UpdateMemberStatusDto,
  UpdateMemberDto,
} from './dto/member.dto';
import { createPaginationResult } from '../../core/utils/pagination.utils';

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepo: MemberRepository,
    private readonly userRepo: UserRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async createMemberForBranch(branchId: string, data: CreateMemberDto) {
    const churchId = await this.resolveChurchId(branchId);
    return this.createMemberWithUser({ ...data, churchId, branchId });
  }

  async createMemberWithUser(
    data: CreateMemberDto & { churchId: string; branchId?: string },
  ) {
    let user = await this.userRepo.findByEmail(data.email);

    if (!user) {
      user = await this.userRepo.create({
        name: data.name,
        email: data.email,
        emailVerified: false,
      });
    }

    const existingMember = await this.memberRepo.findByUserInChurch(
      user.id,
      data.churchId,
    );
    if (existingMember) {
      throw new ConflictException('User is already a member of this church');
    }

    const isVisitor = data.visitor ?? false;
    return await this.memberRepo.create({
      churchId: data.churchId,
      branchId: data.branchId ?? null,
      userId: user.id,
      role: data.role,
      gender: data.gender ?? 'Other',
      ageGroup: data.ageGroup ?? null,
      isVisitor,
      status: isVisitor ? 'visitor' : 'new',
    });
  }

  async createPeopleBulkForBranch(
    branchId: string,
    dto: CreatePeopleBulkDto,
  ) {
    const churchId = await this.resolveChurchId(branchId);
    const role = dto.defaultRole ?? 'member';
    const created: Awaited<ReturnType<MemberRepository['create']>>[] = [];
    const failed: { name: string; email?: string; reason: string }[] = [];

    for (const person of dto.people) {
      const email =
        person.email?.trim() || `noemail.${randomUUID()}@member.placeholder`;
      try {
        const member = await this.createMemberWithUser({
          name: person.name,
          email,
          churchId,
          branchId,
          role,
          gender: person.gender,
          ageGroup: person.ageGroup,
          visitor: person.visitor,
        });
        created.push(member);
      } catch (e) {
        const reason = e instanceof Error ? e.message : 'Unknown error';
        failed.push({
          name: person.name,
          email: person.email?.trim() || undefined,
          reason,
        });
      }
    }

    return { created, failed, count: created.length };
  }

  async transfer(memberId: string, newBranchId: string) {
    const member = await this.memberRepo.findOne(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return await this.memberRepo.update(memberId, { branchId: newBranchId });
  }

  async delete(id: string) {
    await this.findOne(id);
    return await this.memberRepo.delete(id);
  }

  async findOne(id: string) {
    const member = await this.memberRepo.findOne(id);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async update(id: string, updateDto: UpdateMemberDto) {
    await this.findOne(id);
    return await this.memberRepo.update(id, updateDto);
  }

  async updateStatus(id: string, updateDto: UpdateMemberStatusDto) {
    await this.findOne(id);
    return await this.memberRepo.update(id, { status: updateDto.status });
  }

  async findByBranch(
    branchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    const { items, total } = await this.memberRepo.findByBranch(branchId, pagination);
    return createPaginationResult(items, total, pagination);
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    const { items, total } = await this.memberRepo.findByChurch(
      churchId,
      pagination,
    );
    return createPaginationResult(items, total, pagination);
  }
}
