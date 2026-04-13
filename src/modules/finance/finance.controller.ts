import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';
import { ApiBaseResponse } from '../../core/swagger/responses.decorator';
import { StatsDto } from './dto/finance.dto';

@ApiTags('finance')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/finance')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Financial summary' })
  @ApiBaseResponse(StatsDto)
  async getStats(
    @Param('branchId') branchId: string,
  ) {
    return await this.financeService.getStats(branchId);
  }
}
