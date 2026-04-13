import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunicationRepository } from '../../domain/repositories/communication.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { CreateAnnouncementDto, CreateFormDto } from './dto/communication.dto';

@Injectable()
export class CommunicationService {
  constructor(
    private readonly commsRepo: CommunicationRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async createAnnouncement(branchId: string, data: CreateAnnouncementDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.commsRepo.createAnnouncement({ ...data, churchId });
  }

  async getAnnouncements(branchId: string) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.commsRepo.findAnnouncements(churchId);
  }

  async createForm(branchId: string, data: CreateFormDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.commsRepo.createForm({ ...data, churchId });
  }

  async getForms(branchId: string) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.commsRepo.findForms(churchId);
  }

  async submitForm(formId: string, memberId: string, responseData: any) {
    return await this.commsRepo.createFormSubmission({
      formId,
      memberId,
      data: responseData,
    });
  }

  async getResponses(formId: string) {
    return await this.commsRepo.findSubmissionsByForm(formId);
  }
}
