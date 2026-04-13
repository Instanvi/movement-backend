import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import {
  CreateFormDto,
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
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ActiveUser } from '../../core/decorators/active-user.decorator';
import {
  ApiBranchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('forms')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/forms')
@UseGuards(AuthGuard, RolesGuard)
export class FormController {
  constructor(private readonly commsService: CommunicationService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create form' })
  @ApiBody({ type: CreateFormDto })
  @ApiBaseResponse(FormDto)
  async createForm(
    @Param('branchId') branchId: string,
    @Body() body: CreateFormDto,
  ) {
    return await this.commsService.createForm(branchId, body);
  }

  @Get()
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List forms' })
  @ApiArrayResponse(FormDto)
  async getForms(@Param('branchId') branchId: string) {
    return await this.commsService.getForms(branchId);
  }

  @Post(':formId/submit')
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
    @ActiveUser('id') userId: string,
    @Param('formId') formId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return await this.commsService.submitForm(formId, userId, body);
  }

  @Get(':formId/responses')
  @Roles('admin', 'pastor')
  @ApiUuidPathParam('formId', 'Form ID')
  @ApiOperation({ summary: 'List form responses' })
  @ApiArrayResponse(FormSubmissionDto)
  async getResponses(@Param('formId') formId: string) {
    return await this.commsService.getResponses(formId);
  }
}
