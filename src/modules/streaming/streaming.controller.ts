import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { StreamingService } from './streaming.service';
import {
  CreateStreamPlatformDto,
  UpdateStreamStatusDto,
} from './dto/streaming.dto';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('streaming')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/streaming')
@UseGuards(AuthGuard, RolesGuard)
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Post('platforms')
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Add streaming platform' })
  @ApiBody({ type: CreateStreamPlatformDto })
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateStreamPlatformDto,
  ) {
    return await this.streamingService.create(churchId, body);
  }

  @Get('platforms')
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List streaming platforms' })
  @ApiQuery({ name: 'branchId', required: false, schema: { format: 'uuid' } })
  async list(
    @Param('churchId') churchId: string,
    @Query('branchId') branchId?: string,
  ) {
    return await this.streamingService.list(churchId, branchId);
  }

  @Patch('platforms/:id/status')
  @Roles('admin', 'pastor')
  @ApiUuidPathParam('id', 'Stream platform ID')
  @ApiOperation({ summary: 'Update platform status' })
  @ApiBody({ type: UpdateStreamStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStreamStatusDto,
  ) {
    return await this.streamingService.updateStatus(id, body);
  }

  @Delete('platforms/:id')
  @Roles('admin', 'pastor')
  @ApiUuidPathParam('id', 'Stream platform ID')
  @ApiOperation({ summary: 'Delete streaming platform' })
  async delete(@Param('id') id: string) {
    return await this.streamingService.delete(id);
  }

  @Get('metrics')
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Aggregated viewer metrics' })
  async getMetrics(@Param('churchId') churchId: string) {
    return await this.streamingService.getMetrics(churchId);
  }

  @Post('platforms/:id/metrics')
  @Roles('admin', 'pastor')
  @ApiUuidPathParam('id', 'Stream platform ID')
  @ApiOperation({ summary: 'Append viewer metric sample' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['viewerCount', 'status'],
      properties: {
        viewerCount: { type: 'number' },
        status: { type: 'string', example: 'live' },
      },
    },
  })
  async addMetric(
    @Param('id') id: string,
    @Body() body: { viewerCount: number; status: string },
  ) {
    return await this.streamingService.addMetric(
      id,
      body.viewerCount,
      body.status,
    );
  }
}
