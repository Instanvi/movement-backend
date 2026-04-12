import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { ReportOverviewDto } from './dto/report.dto';
import { ApiBaseResponse } from '../../core/swagger/responses.decorator';
import { ApiChurchIdParam } from '../../core/swagger/path-params.decorators';

@ApiTags('reports')
@ApiChurchIdParam()
@Controller('churches/:churchId/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Organization overview' })
  @ApiBaseResponse(ReportOverviewDto)
  async getOverview(@Param('churchId') churchId: string) {
    return this.reportService.getOverview(churchId);
  }
}
