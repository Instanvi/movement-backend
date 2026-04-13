import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/subscription.dto';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { SubscriptionDto } from './dto/subscription.dto';

@ApiTags('subscriptions')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/subscriptions')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'overseer')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiBaseResponse(SubscriptionDto)
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateSubscriptionDto,
  ) {
    return await this.subscriptionService.create({ ...body, churchId });
  }

  @Get()
  @ApiOperation({ summary: 'List subscriptions' })
  @ApiArrayResponse(SubscriptionDto)
  async list(@Param('churchId') churchId: string) {
    return await this.subscriptionService.getByChurchId(churchId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active subscription' })
  @ApiBaseResponse(SubscriptionDto)
  async getActive(@Param('churchId') churchId: string) {
    return await this.subscriptionService.getActiveByChurchId(churchId);
  }

  @Get(':id')
  @ApiUuidPathParam('id', 'Subscription ID')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiBaseResponse(SubscriptionDto)
  async getById(@Param('id') id: string) {
    return await this.subscriptionService.getById(id);
  }

  @Patch(':id')
  @ApiUuidPathParam('id', 'Subscription ID')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiBaseResponse(SubscriptionDto)
  async update(@Param('id') id: string, @Body() body: UpdateSubscriptionDto) {
    return await this.subscriptionService.update(id, body);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Subscription ID')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiBaseResponse(SubscriptionDto)
  async delete(@Param('id') id: string) {
    return await this.subscriptionService.delete(id);
  }
}
