import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { ReportOverviewDto } from './dto/report.dto';
import { ApiBaseResponse } from '../../core/swagger/responses.decorator';
import { ApiChurchIdParam } from '../../core/swagger/path-params.decorators';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';

@ApiTags('reports')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/reports')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'overseer')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Organization overview' })
  @ApiBaseResponse(ReportOverviewDto)
  async getOverview(@Param('churchId') churchId: string) {
    return this.reportService.getOverview(churchId);
  }
}
