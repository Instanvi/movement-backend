import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import {
  CreateAnnouncementDto,
  AnnouncementDto,
} from './dto/communication.dto';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';

@ApiTags('announcements')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/announcements')
@UseGuards(AuthGuard, RolesGuard)
export class AnnouncementController {
  constructor(private readonly commsService: CommunicationService) {}

  @Post()
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create announcement' })
  @ApiBody({ type: CreateAnnouncementDto })
  @ApiBaseResponse(AnnouncementDto)
  async createAnnouncement(
    @Param('branchId') branchId: string,
    @Body() body: CreateAnnouncementDto,
  ) {
    return await this.commsService.createAnnouncement(branchId, body);
  }

  @Get()
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List announcements' })
  @ApiArrayResponse(AnnouncementDto)
  async getAnnouncements(@Param('branchId') branchId: string) {
    return await this.commsService.getAnnouncements(branchId);
  }
}
