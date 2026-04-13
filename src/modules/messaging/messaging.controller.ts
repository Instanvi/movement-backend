import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { MessagingService } from './messaging.service';
import { CreateMessagingDto, SendBulkMessagingDto, MessagingDto } from './dto/messaging.dto';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';
import { ApiBaseResponse, ApiArrayResponse } from '../../core/swagger/responses.decorator';

@ApiTags('messaging')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/messagings')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Create messaging' })
  @ApiBody({ type: CreateMessagingDto })
  @ApiBaseResponse(MessagingDto)
  async create(
    @Param('branchId') branchId: string,
    @Body() body: CreateMessagingDto,
  ) {
    return await this.messagingService.create(branchId, body);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create bulk messaging' })
  @ApiBody({ type: SendBulkMessagingDto })
  @ApiBaseResponse(MessagingDto)
  async sendBulk(
    @Param('branchId') branchId: string,
    @Body() body: SendBulkMessagingDto,
  ) {
    return await this.messagingService.sendBulk(branchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List messagings' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiArrayResponse(MessagingDto)
  async list(
    @Param('branchId') branchId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return await this.messagingService.list(branchId, { limit, offset });
  }
}
