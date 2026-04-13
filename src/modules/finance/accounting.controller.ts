import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import {
  CreateFinancialAccountDto,
  CreateTransactionDto,
  FinancialAccountDto,
  TransactionDto,
  AccountingOverviewDto,
} from './dto/finance.dto';
import { AccountingAccountFilter } from '../../domain/repositories/finance.repository';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiBranchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';

@ApiTags('finance-accounting')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/finance/accounting')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class AccountingController {
  constructor(private readonly financeService: FinanceService) {}

  private static parseAccountingFilter(raw?: string): AccountingAccountFilter {
    if (raw === 'asset' || raw === 'liability') {
      return raw;
    }
    return 'all';
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create ledger account' })
  @ApiBody({ type: CreateFinancialAccountDto })
  @ApiBaseResponse(FinancialAccountDto)
  async createAccount(
    @Param('branchId') branchId: string,
    @Body() body: CreateFinancialAccountDto,
  ) {
    return await this.financeService.createAccount(branchId, body);
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'List all ledger accounts',
  })
  @ApiArrayResponse(FinancialAccountDto)
  async listAccounts(@Param('branchId') branchId: string) {
    return await this.financeService.listAccountsByChurch(branchId);
  }

  @Get('overview')
  @ApiOperation({
    summary: 'Accounting overview',
    description: 'Summary cards plus account rows with connected fund name.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['all', 'asset', 'liability'],
    description: 'Tab filter for the account table',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Case-insensitive match on account name',
  })
  @ApiBaseResponse(AccountingOverviewDto)
  async accountingOverview(
    @Param('branchId') branchId: string,
    @Query('filter') filterRaw?: string,
    @Query('search') search?: string,
  ) {
    return await this.financeService.getAccountingOverview(branchId, {
      filter: AccountingController.parseAccountingFilter(filterRaw),
      search,
    });
  }

  @Post('accounts/:accountId/transactions')
  @ApiUuidPathParam('accountId', 'Financial account ID')
  @ApiOperation({ summary: 'Post transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiBaseResponse(TransactionDto)
  async addTransaction(
    @Param('branchId') branchId: string,
    @Param('accountId') accountId: string,
    @Body() body: CreateTransactionDto,
  ) {
    return await this.financeService.addTransaction(branchId, accountId, body);
  }

  @Get('accounts/:accountId/transactions')
  @ApiUuidPathParam('accountId', 'Financial account ID')
  @ApiOperation({ summary: 'List transactions for account' })
  @ApiArrayResponse(TransactionDto)
  async getTransactions(
    @Param('branchId') branchId: string,
    @Param('accountId') accountId: string,
  ) {
    return await this.financeService.getTransactions(branchId, accountId);
  }
}
