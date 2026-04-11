import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiUuidPathParam } from '../../core/swagger/path-params.decorators';
import { ChurchService } from './church.service';
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
  async getChurch(@Param('id') id: string) {
    return this.churchService.getChurch(id);
  }

  @Get(':id/branches')
  @ApiOperation({ summary: 'List branches for a church' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async listBranches(
    @Param('id') id: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.churchService.getBranches(id, { limit, offset });
  }

  @Get(':id/reports')
  @Roles('admin', 'overseer')
  @ApiOperation({ summary: 'Church overview report' })
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
  async getMessagings(
    @Param('id') id: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.churchService.getMessagings(id, branchId);
  }
}
