import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateFundDto, FundDto } from './dto/finance.dto';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';

@ApiTags('finance-funds')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/finance/funds')
@UseGuards(RolesGuard)
@Roles('admin', 'pastor')
export class FundController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create fund' })
  @ApiBody({ type: CreateFundDto })
  @ApiBaseResponse(FundDto)
  async createFund(
    @Param('branchId') branchId: string,
    @Body() body: CreateFundDto,
  ) {
    return await this.financeService.createFund(branchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List funds' })
  @ApiArrayResponse(FundDto)
  async listFunds(@Param('branchId') branchId: string) {
    return await this.financeService.listFundsByChurch(branchId);
  }
}
