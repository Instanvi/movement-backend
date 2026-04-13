import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MessagingRepository } from '../../domain/repositories/messaging.repository';
import { MemberRepository } from '../../domain/repositories/member.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { CreateMessagingDto, SendBulkMessagingDto } from './dto/messaging.dto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly messagingRepo: MessagingRepository,
    private readonly memberRepo: MemberRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async create(branchId: string, data: CreateMessagingDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.messagingRepo.create({
      ...data,
      churchId,
      branchId: data.branchId || branchId,
      targetAudience: 'all',
    });
  }

  async sendBulk(branchId: string, data: SendBulkMessagingDto) {
    const churchId = await this.resolveChurchId(branchId);
    const messaging = await this.messagingRepo.create({
      ...data,
      churchId,
      branchId: data.branchId || branchId,
      targetAudience: data.targetAudience,
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
    branchId: string,
    pagination?: { limit?: number; offset?: number },
  ) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.messagingRepo.findByBranchOrChurch(
      churchId,
      branchId,
      pagination,
    );
  }
}
