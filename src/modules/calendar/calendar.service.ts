import { Injectable } from '@nestjs/common';
import { CalendarRepository } from '../../domain/repositories/calendar.repository';
import {
  CreateRoomDto,
  CreateAppointmentTypeDto,
  CreateEventDto,
} from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly calendarRepo: CalendarRepository) {}

  async createRoom(churchId: string, data: CreateRoomDto) {
    return await this.calendarRepo.createRoom({
      ...data,
      churchId,
    });
  }

  async getRooms(churchId: string) {
    return await this.calendarRepo.findRooms(churchId);
  }

  async createAppointmentType(
    churchId: string,
    data: CreateAppointmentTypeDto,
  ) {
    return await this.calendarRepo.createAppointmentType({
      ...data,
      churchId,
    });
  }

  async getAppointmentTypes(churchId: string) {
    return await this.calendarRepo.findAppointmentTypes(churchId);
  }

  async createEvent(churchId: string, data: CreateEventDto) {
    return await this.calendarRepo.createEvent({
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      churchId,
    });
  }

  async getEvents(churchId: string) {
    return await this.calendarRepo.findEvents(churchId);
  }
}
