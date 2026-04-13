import { Injectable, NotFoundException } from '@nestjs/common';
import { InvitationRepository } from '../../domain/repositories/invitation.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { SendInvitationDto } from './dto/invitation.dto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepo: InvitationRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async send(branchId: string, inviterId: string, data: SendInvitationDto) {
    const churchId = await this.resolveChurchId(branchId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    return await this.invitationRepo.create({
      ...data,
      churchId,
      inviterId,
      status: 'pending',
      expiresAt,
    });
  }

  async list(branchId: string) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.invitationRepo.findByChurch(churchId);
  }

  async revoke(id: string) {
    return await this.invitationRepo.delete(id);
  }
}
