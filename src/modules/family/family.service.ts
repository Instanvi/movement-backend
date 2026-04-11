import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FamilyRepository } from '../../domain/repositories/family.repository';
import { MemberRepository } from '../../domain/repositories/member.repository';
import {
  CreateFamilyDto,
  UpdateFamilyDto,
  AddMemberToFamilyDto,
  FamilyMemberRole,
} from './dto/family.dto';

@Injectable()
export class FamilyService {
  constructor(
    private readonly familyRepo: FamilyRepository,
    private readonly memberRepo: MemberRepository,
  ) {}

  async create(churchId: string, dto: CreateFamilyDto) {
    const { members = [], headOfHouseId, name, branchId } = dto;
    const hohRows = members.filter((m) => m.familyRole === 'Head of House');
    if (hohRows.length > 1) {
      throw new BadRequestException(
        'At most one member may have family role Head of House',
      );
    }
    if (
      headOfHouseId &&
      hohRows.length === 1 &&
      hohRows[0].memberId !== headOfHouseId
    ) {
      throw new BadRequestException(
        'headOfHouseId must match the member with role Head of House when both are sent',
      );
    }

    const fam = await this.familyRepo.create({
      name,
      branchId,
      churchId,
    });

    for (const row of members) {
      await this.linkMemberToFamily(
        fam.id,
        churchId,
        row.memberId,
        row.familyRole,
      );
    }

    const explicitHead = headOfHouseId ?? hohRows[0]?.memberId;
    if (explicitHead) {
      const headMember = await this.memberRepo.findOne(explicitHead);
      if (!headMember || headMember.churchId !== churchId) {
        throw new BadRequestException(
          'Head of household must be a member of this church',
        );
      }
      if (headMember.familyId !== fam.id) {
        await this.linkMemberToFamily(
          fam.id,
          churchId,
          explicitHead,
          'Head of House',
        );
      }
      await this.assignHeadOfHouse(fam.id, churchId, explicitHead);
    }

    return this.getProfile(fam.id, churchId);
  }

  async findByChurch(
    churchId: string,
    pagination?: { limit: number; offset: number },
  ) {
    return await this.familyRepo.findByChurch(churchId, pagination);
  }

  async findOne(id: string, churchId: string) {
    const fam = await this.familyRepo.findOne(id);
    if (!fam || fam.churchId !== churchId) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return fam;
  }

  async getProfile(familyId: string, churchId: string) {
    const fam = await this.findOne(familyId, churchId);
    const members = await this.memberRepo.findByFamilyId(familyId);
    const childrenCount = members.filter(
      (m) => m.familyRole === 'Child',
    ).length;
    const headOfHouse = fam.headOfHouseId
      ? (members.find((m) => m.id === fam.headOfHouseId) ?? null)
      : null;
    return {
      ...fam,
      members,
      stats: {
        memberCount: members.length,
        childrenCount,
      },
      headOfHouse,
    };
  }

  async update(id: string, churchId: string, dto: UpdateFamilyDto) {
    await this.findOne(id, churchId);
    if (Object.keys(dto).length > 0) {
      await this.familyRepo.update(id, dto);
    }
    return this.getProfile(id, churchId);
  }

  async delete(id: string, churchId: string) {
    await this.findOne(id, churchId);
    await this.familyRepo.delete(id);
  }

  async addMember(
    familyId: string,
    churchId: string,
    dto: AddMemberToFamilyDto,
  ) {
    await this.findOne(familyId, churchId);
    await this.linkMemberToFamily(
      familyId,
      churchId,
      dto.memberId,
      dto.familyRole,
    );
    if (dto.familyRole === 'Head of House') {
      return this.assignHeadOfHouse(familyId, churchId, dto.memberId);
    }
    return this.getProfile(familyId, churchId);
  }

  async assignHeadOfHouse(
    familyId: string,
    churchId: string,
    memberId: string,
  ) {
    const fam = await this.findOne(familyId, churchId);
    const member = await this.memberRepo.findOne(memberId);
    if (!member || member.churchId !== churchId) {
      throw new BadRequestException('Member not found in this church');
    }
    if (member.familyId !== familyId) {
      throw new BadRequestException(
        'Head of household must already belong to this family',
      );
    }

    const previousHeadId = fam.headOfHouseId;
    await this.familyRepo.update(familyId, { headOfHouseId: memberId });
    await this.memberRepo.update(memberId, { familyRole: 'Head of House' });

    if (previousHeadId && previousHeadId !== memberId) {
      const prev = await this.memberRepo.findOne(previousHeadId);
      if (prev?.familyId === familyId && prev.familyRole === 'Head of House') {
        await this.memberRepo.update(previousHeadId, { familyRole: 'Spouse' });
      }
    }

    return this.getProfile(familyId, churchId);
  }

  async removeMember(familyId: string, churchId: string, memberId: string) {
    const fam = await this.findOne(familyId, churchId);
    const member = await this.memberRepo.findOne(memberId);
    if (!member || member.familyId !== familyId) {
      throw new NotFoundException(
        `Member with ID ${memberId} NOT found in this family`,
      );
    }
    await this.memberRepo.update(memberId, {
      familyId: null,
      familyRole: 'Other',
    });
    if (fam.headOfHouseId === memberId) {
      await this.familyRepo.update(familyId, { headOfHouseId: null });
    }
    return { removed: memberId };
  }

  private async linkMemberToFamily(
    familyId: string,
    churchId: string,
    memberId: string,
    familyRole: FamilyMemberRole,
  ) {
    const member = await this.memberRepo.findOne(memberId);
    if (!member || member.churchId !== churchId) {
      throw new BadRequestException(
        `Member ${memberId} is not part of this church`,
      );
    }
    if (member.familyId && member.familyId !== familyId) {
      throw new ConflictException(
        'Member already belongs to another family; remove them there first',
      );
    }
    await this.memberRepo.update(memberId, { familyId, familyRole });
  }
}
