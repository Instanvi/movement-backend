import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as schemaExports from '../../core/schema';
import { GroupRepository } from '../../domain/repositories/group.repository';
import { MemberRepository } from '../../domain/repositories/member.repository';
import { CreateGroupDto } from './dto/group.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly memberRepo: MemberRepository,
  ) {}

  async create(churchId: string, dto: CreateGroupDto) {
    const { leaderMemberId, ...groupRow } = dto;
    const group = await this.groupRepo.create({
      ...groupRow,
      churchId,
    });
    if (leaderMemberId) {
      const leader = await this.memberRepo.findOne(leaderMemberId);
      if (!leader || leader.churchId !== churchId) {
        throw new BadRequestException(
          'Group leader must be a member of this church',
        );
      }
      await this.groupRepo.addMember(group.id, leaderMemberId, {
        isLeader: true,
      });
    }
    return group;
  }

  async addMember(groupId: string, memberId: string, isLeader?: boolean) {
    const group = await this.groupRepo.findOne(groupId);
    if (!group) throw new NotFoundException('Group not found');
    return await this.groupRepo.addMember(groupId, memberId, {
      isLeader: isLeader ?? false,
    });
  }

  async removeMember(groupId: string, memberId: string) {
    return await this.groupRepo.removeMember(groupId, memberId);
  }

  async listByChurch(churchId: string) {
    return await this.groupRepo.findAll(
      eq(schemaExports.group.churchId, churchId),
    );
  }

  async getMembers(groupId: string) {
    return await this.groupRepo.getMembers(groupId);
  }
}
