import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarRepository } from '../../domain/repositories/calendar.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import {
  CreateRoomDto,
  CreateAppointmentTypeDto,
  CreateEventDto,
} from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    private readonly calendarRepo: CalendarRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  private async resolveChurchId(branchId: string): Promise<string> {
    const branch = await this.branchRepo.findOne(branchId);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch.churchId;
  }

  async createRoom(branchId: string, data: CreateRoomDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.calendarRepo.createRoom({ ...data, churchId });
  }

  async getRooms(branchId: string) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.calendarRepo.findRooms(churchId);
  }

  async createAppointmentType(branchId: string, data: CreateAppointmentTypeDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.calendarRepo.createAppointmentType({ ...data, churchId });
  }

  async getAppointmentTypes(branchId: string) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.calendarRepo.findAppointmentTypes(churchId);
  }

  async createEvent(branchId: string, data: CreateEventDto) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.calendarRepo.createEvent({
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      churchId,
    });
  }

  async getEvents(branchId: string) {
    const churchId = await this.resolveChurchId(branchId);
    return await this.calendarRepo.findEvents(churchId);
  }
}
