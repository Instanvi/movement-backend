import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateMessagingDto, SendBulkMessagingDto } from './dto/messaging.dto';
import { ApiChurchIdParam } from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { MessagingDto } from './dto/messaging.dto';

@ApiTags('messaging')
@ApiChurchIdParam()
@Controller('churches/:churchId/messagings')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Create messaging' })
  @ApiBody({ type: CreateMessagingDto })
  @ApiBaseResponse(MessagingDto)
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateMessagingDto,
  ) {
    return await this.messagingService.create(churchId, body);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create bulk messaging' })
  @ApiBody({ type: SendBulkMessagingDto })
  @ApiBaseResponse(MessagingDto)
  async sendBulk(
    @Param('churchId') churchId: string,
    @Body() body: SendBulkMessagingDto,
  ) {
    return await this.messagingService.sendBulk(churchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List messagings' })
  @ApiQuery({ name: 'branchId', required: false, schema: { format: 'uuid' } })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiArrayResponse(MessagingDto)
  async list(
    @Param('churchId') churchId: string,
    @Query('branchId') branchId?: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return await this.messagingService.list(churchId, branchId, {
      limit,
      offset,
    });
  }
}
