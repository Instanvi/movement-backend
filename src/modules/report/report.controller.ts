import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { ReportOverviewDto } from './dto/report.dto';
import { ApiBaseResponse } from '../../core/swagger/responses.decorator';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';

@ApiTags('reports')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/reports')
@UseGuards(RolesGuard)
@Roles('admin', 'overseer')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Organization overview' })
  @ApiBaseResponse(ReportOverviewDto)
  async getOverview(@Param('branchId') branchId: string) {
    return this.reportService.getOverview(branchId);
  }
}
