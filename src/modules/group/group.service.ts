import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { group } from '../../core/schema/group.schema';
import { GroupRepository } from '../../domain/repositories/group.repository';
import { MemberRepository } from '../../domain/repositories/member.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { CreateGroupDto } from './dto/group.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly memberRepo: MemberRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async createForBranch(branchId: string, dto: CreateGroupDto) {
    const churchId = await this.resolveChurchId(branchId);
    const { leaderMemberId, ...groupRow } = dto;
    const createdGroup = await this.groupRepo.create({
      ...groupRow,
      churchId,
      branchId,
    });
    if (leaderMemberId) {
      const leader = await this.memberRepo.findOne(leaderMemberId);
      if (!leader || leader.churchId !== churchId) {
        throw new BadRequestException(
          'Group leader must be a member of this church',
        );
      }
      await this.groupRepo.addMember(createdGroup.id, leaderMemberId, {
        isLeader: true,
      });
    }
    return createdGroup;
  }

  async addMember(groupId: string, memberId: string, isLeader?: boolean) {
    const foundGroup = await this.groupRepo.findOne(groupId);
    if (!foundGroup) throw new NotFoundException('Group not found');
    return await this.groupRepo.addMember(groupId, memberId, {
      isLeader: isLeader ?? false,
    });
  }

  async removeMember(groupId: string, memberId: string) {
    return await this.groupRepo.removeMember(groupId, memberId);
  }

  async listByBranch(branchId: string) {
    return await this.groupRepo.findByChurch(
      (await this.resolveChurchId(branchId)),
    );
  }

  async getMembers(groupId: string) {
    return await this.groupRepo.getMembers(groupId);
  }
}
