import { Injectable } from '@nestjs/common';
import { CommunicationRepository } from '../../domain/repositories/communication.repository';
import { CreateAnnouncementDto, CreateFormDto } from './dto/communication.dto';

@Injectable()
export class CommunicationService {
  constructor(private readonly commsRepo: CommunicationRepository) {}

  async createAnnouncement(churchId: string, data: CreateAnnouncementDto) {
    return await this.commsRepo.createAnnouncement({
      ...data,
      churchId,
    });
  }

  async getAnnouncements(churchId: string) {
    return await this.commsRepo.findAnnouncements(churchId);
  }

  async createForm(churchId: string, data: CreateFormDto) {
    return await this.commsRepo.createForm({
      ...data,
      churchId,
    });
  }

  async getForms(churchId: string) {
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
