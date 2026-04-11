import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { ReportOverviewDto } from './dto/report.dto';
import { ApiChurchIdParam } from '../../core/swagger/path-params.decorators';

@ApiTags('reports')
@ApiChurchIdParam()
@Controller('churches/:churchId/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Organization overview' })
  @ApiOkResponse({ type: ReportOverviewDto })
  async getOverview(@Param('churchId') churchId: string) {
    return this.reportService.getOverview(churchId);
  }
}
