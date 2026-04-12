import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiChurchIdParam } from '../../core/swagger/path-params.decorators';
import { CalendarService } from './calendar.service';
import {
  CreateRoomDto,
  CreateAppointmentTypeDto,
  CreateEventDto,
  RoomDto,
  AppointmentTypeDto,
  EventDto,
} from './dto/calendar.dto';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('calendar')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/calendar')
@UseGuards(AuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('rooms')
  @Roles('admin')
  @ApiOperation({ summary: 'Create room' })
  @ApiBody({ type: CreateRoomDto })
  @ApiBaseResponse(RoomDto)
  async createRoom(
    @Param('churchId') churchId: string,
    @Body() body: CreateRoomDto,
  ) {
    return await this.calendarService.createRoom(churchId, body);
  }

  @Get('rooms')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List rooms' })
  @ApiArrayResponse(RoomDto)
  async getRooms(@Param('churchId') churchId: string) {
    return await this.calendarService.getRooms(churchId);
  }

  @Post('event-types')
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create appointment type' })
  @ApiBody({ type: CreateAppointmentTypeDto })
  @ApiBaseResponse(AppointmentTypeDto)
  async createAppointmentType(
    @Param('churchId') churchId: string,
    @Body() body: CreateAppointmentTypeDto,
  ) {
    return await this.calendarService.createAppointmentType(churchId, body);
  }

  @Get('event-types')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List appointment types' })
  @ApiArrayResponse(AppointmentTypeDto)
  async getAppointmentTypes(@Param('churchId') churchId: string) {
    return await this.calendarService.getAppointmentTypes(churchId);
  }

  @Post('events')
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create event' })
  @ApiBody({ type: CreateEventDto })
  @ApiBaseResponse(EventDto)
  async createEvent(
    @Param('churchId') churchId: string,
    @Body() body: CreateEventDto,
  ) {
    return await this.calendarService.createEvent(churchId, body);
  }

  @Get('events')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List events' })
  @ApiArrayResponse(EventDto)
  async getEvents(@Param('churchId') churchId: string) {
    return await this.calendarService.getEvents(churchId);
  }
}
