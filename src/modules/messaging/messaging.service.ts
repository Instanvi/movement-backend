import { Injectable, Logger } from '@nestjs/common';
import { MessagingRepository } from '../../domain/repositories/messaging.repository';
import { MemberRepository } from '../../domain/repositories/member.repository';
import { CreateMessagingDto, SendBulkMessagingDto } from './dto/messaging.dto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly messagingRepo: MessagingRepository,
    private readonly memberRepo: MemberRepository,
  ) {}

  async create(churchId: string, data: CreateMessagingDto) {
    return await this.messagingRepo.create({
      ...data,
      churchId,
      branchId: data.branchId || null,
      targetAudience: 'all',
    });
  }

  async sendBulk(churchId: string, data: SendBulkMessagingDto) {
    const messaging = await this.messagingRepo.create({
      ...data,
      churchId,
      branchId: data.branchId || null,
      targetAudience: data.targetAudience, // 'old_members' | 'new_members' | 'all'
    });

    const targetStatus =
      data.targetAudience === 'new_members'
        ? 'new'
        : data.targetAudience === 'old_members'
          ? 'old'
          : 'active';

    this.logger.log(
      `[BULK SEND] audience=${data.targetAudience} statusFilter=${targetStatus} id=${messaging.id}`,
    );

    return messaging;
  }

  async list(
    churchId: string,
    branchId?: string,
    pagination?: { limit: number; offset: number },
  ) {
    return await this.messagingRepo.findByBranchOrChurch(
      churchId,
      branchId,
      pagination,
    );
  }
}
