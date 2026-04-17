import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';
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
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('calendar')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/calendar')
@UseGuards(RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('rooms')
  @Roles('admin')
  @ApiOperation({ summary: 'Create room' })
  @ApiBody({ type: CreateRoomDto })
  @ApiBaseResponse(RoomDto)
  async createRoom(
    @Param('branchId') branchId: string,
    @Body() body: CreateRoomDto,
  ) {
    return await this.calendarService.createRoom(branchId, body);
  }

  @Get('rooms')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List rooms' })
  @ApiArrayResponse(RoomDto)
  async getRooms(@Param('branchId') branchId: string) {
    return await this.calendarService.getRooms(branchId);
  }

  @Post('event-types')
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create appointment type' })
  @ApiBody({ type: CreateAppointmentTypeDto })
  @ApiBaseResponse(AppointmentTypeDto)
  async createAppointmentType(
    @Param('branchId') branchId: string,
    @Body() body: CreateAppointmentTypeDto,
  ) {
    return await this.calendarService.createAppointmentType(branchId, body);
  }

  @Get('event-types')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List appointment types' })
  @ApiArrayResponse(AppointmentTypeDto)
  async getAppointmentTypes(@Param('branchId') branchId: string) {
    return await this.calendarService.getAppointmentTypes(branchId);
  }

  @Post('events')
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create event' })
  @ApiBody({ type: CreateEventDto })
  @ApiBaseResponse(EventDto)
  async createEvent(
    @Param('branchId') branchId: string,
    @Body() body: CreateEventDto,
  ) {
    return await this.calendarService.createEvent(branchId, body);
  }

  @Get('events')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List events' })
  @ApiArrayResponse(EventDto)
  async getEvents(@Param('branchId') branchId: string) {
    return await this.calendarService.getEvents(branchId);
  }
}
