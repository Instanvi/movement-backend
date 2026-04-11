import { Injectable } from '@nestjs/common';
import { InvitationRepository } from '../../domain/repositories/invitation.repository';
import { SendInvitationDto } from './dto/invitation.dto';

@Injectable()
export class InvitationService {
  constructor(private readonly invitationRepo: InvitationRepository) {}

  async send(churchId: string, inviterId: string, data: SendInvitationDto) {
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

  async list(churchId: string) {
    return await this.invitationRepo.findByChurch(churchId);
  }

  async revoke(id: string) {
    return await this.invitationRepo.delete(id);
  }
}
