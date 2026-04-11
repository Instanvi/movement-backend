import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/subscription.dto';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('subscriptions')
@ApiChurchIdParam()
@Controller('churches/:churchId/subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiBody({ type: CreateSubscriptionDto })
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateSubscriptionDto,
  ) {
    return await this.subscriptionService.create({ ...body, churchId });
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions' })
  async list(@Param('churchId') churchId: string) {
    return await this.subscriptionService.getByChurchId(churchId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active subscription' })
  async getActive(@Param('churchId') churchId: string) {
    return await this.subscriptionService.getActiveByChurchId(churchId);
  }

  @Get(':id')
  @ApiUuidPathParam('id', 'Subscription ID')
  @ApiOperation({ summary: 'Get subscription by ID' })
  async getById(@Param('id') id: string) {
    return await this.subscriptionService.getById(id);
  }

  @Patch(':id')
  @ApiUuidPathParam('id', 'Subscription ID')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiBody({ type: UpdateSubscriptionDto })
  async update(@Param('id') id: string, @Body() body: UpdateSubscriptionDto) {
    return await this.subscriptionService.update(id, body);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Subscription ID')
  @ApiOperation({ summary: 'Delete subscription' })
  async delete(@Param('id') id: string) {
    return await this.subscriptionService.delete(id);
  }
}
