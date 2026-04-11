import { Injectable } from '@nestjs/common';
import { ChurchSettingRepository } from '../../domain/repositories/church-setting.repository';
import {
  UpdateChurchSettingDto,
  CreateCustomFieldDto,
} from './dto/church-setting.dto';

@Injectable()
export class ChurchSettingService {
  constructor(private readonly settingRepo: ChurchSettingRepository) {}

  async getSetting(churchId: string) {
    return await this.settingRepo.getSetting(churchId);
  }

  async updateSetting(churchId: string, data: UpdateChurchSettingDto) {
    return await this.settingRepo.updateSetting(churchId, data);
  }

  async getCustomFields(churchId: string) {
    return await this.settingRepo.findCustomFields(churchId);
  }

  async createCustomField(churchId: string, data: CreateCustomFieldDto) {
    return await this.settingRepo.createCustomField({
      ...data,
      churchId,
    });
  }
}
