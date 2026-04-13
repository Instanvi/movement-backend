import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiUuidPathParam } from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
  ApiPaginatedResponse,
} from '../../core/swagger/responses.decorator';
import { PaginationQueryDto } from '../../core/dto/pagination-query.dto';
import { ChurchService } from './church.service';
import { ChurchDto } from './dto/church.dto';
import { BranchDto } from '../branch/dto/branch.dto';
import { ReportOverviewDto } from '../report/dto/report.dto';
import { MessagingDto } from '../messaging/dto/messaging.dto';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';

@ApiTags('church')
@ApiChurchRouteAuth()
@ApiUuidPathParam('id', 'Church ID')
@Controller('churches')
@UseGuards(AuthGuard, RolesGuard)
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get church by ID' })
  @ApiBaseResponse(ChurchDto)
  async getChurch(@Param('id') id: string) {
    return this.churchService.getChurch(id);
  }

  @Get(':id/branches')
  @ApiOperation({ summary: 'List branches for a church' })
  @ApiPaginatedResponse(BranchDto)
  async listBranches(
    @Param('id') id: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.churchService.getBranches(id, pagination);
  }

  @Get(':id/reports')
  @Roles('admin', 'overseer')
  @ApiOperation({ summary: 'Church overview report' })
  @ApiBaseResponse(ReportOverviewDto)
  async getReport(@Param('id') id: string) {
    return this.churchService.getReport(id);
  }

  @Get(':id/messagings')
  @ApiOperation({ summary: 'List messagings for a church' })
  @ApiQuery({
    name: 'branchId',
    required: false,
    schema: { type: 'string', format: 'uuid' },
    description: 'Filter by branch',
  })
  @ApiArrayResponse(MessagingDto)
  async getMessagings(
    @Param('id') id: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.churchService.getMessagings(id, branchId);
  }
}
