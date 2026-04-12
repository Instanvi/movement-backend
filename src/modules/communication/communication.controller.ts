import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { CreateAnnouncementDto, CreateFormDto } from './dto/communication.dto';
import {
  AnnouncementDto,
  FormDto,
  FormSubmissionDto,
} from './dto/communication.dto';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../core/types/authenticated-request';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('communication')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/communications')
@UseGuards(AuthGuard, RolesGuard)
export class CommunicationController {
  constructor(private readonly commsService: CommunicationService) {}

  @Post('announcements')
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create announcement' })
  @ApiBody({ type: CreateAnnouncementDto })
  @ApiBaseResponse(AnnouncementDto)
  async createAnnouncement(
    @Param('churchId') churchId: string,
    @Body() body: CreateAnnouncementDto,
  ) {
    return await this.commsService.createAnnouncement(churchId, body);
  }

  @Get('announcements')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List announcements' })
  @ApiArrayResponse(AnnouncementDto)
  async getAnnouncements(@Param('churchId') churchId: string) {
    return await this.commsService.getAnnouncements(churchId);
  }

  @Post('forms')
  @Roles('admin')
  @ApiOperation({ summary: 'Create form' })
  @ApiBody({ type: CreateFormDto })
  @ApiBaseResponse(FormDto)
  async createForm(
    @Param('churchId') churchId: string,
    @Body() body: CreateFormDto,
  ) {
    return await this.commsService.createForm(churchId, body);
  }

  @Get('forms')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List forms' })
  @ApiArrayResponse(FormDto)
  async getForms(@Param('churchId') churchId: string) {
    return await this.commsService.getForms(churchId);
  }

  @Post('forms/:formId/submit')
  @Roles('member')
  @ApiUuidPathParam('formId', 'Form ID')
  @ApiOperation({ summary: 'Submit form' })
  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
      description: 'Field id → value map',
    },
  })
  @ApiBaseResponse(FormSubmissionDto)
  async submitForm(
    @Request() req: AuthenticatedRequest,
    @Param('formId') formId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    return await this.commsService.submitForm(formId, userId, body);
  }

  @Get('forms/:formId/responses')
  @Roles('admin', 'pastor')
  @ApiUuidPathParam('formId', 'Form ID')
  @ApiOperation({ summary: 'List form responses' })
  @ApiArrayResponse(FormSubmissionDto)
  async getResponses(@Param('formId') formId: string) {
    return await this.commsService.getResponses(formId);
  }
}
