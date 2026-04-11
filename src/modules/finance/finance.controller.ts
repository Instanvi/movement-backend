import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import {
  CreateFinancialAccountDto,
  CreateTransactionDto,
  CreateFundDto,
  CreateStewardshipPledgeDto,
  CreatePledgeCampaignDto,
  UpdatePledgeCampaignDto,
} from './dto/finance.dto';
import { AccountingAccountFilter } from '../../domain/repositories/finance.repository';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('finance')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/finance')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  private static parseAccountingFilter(
    raw?: string,
  ): AccountingAccountFilter {
    if (raw === 'asset' || raw === 'liability') {
      return raw;
    }
    return 'all';
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create ledger account' })
  @ApiBody({ type: CreateFinancialAccountDto })
  async createAccount(
    @Param('churchId') churchId: string,
    @Body() body: CreateFinancialAccountDto,
  ) {
    return await this.financeService.createAccount(churchId, body);
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'List all ledger accounts',
    description:
      'Raw list (all account types). For the Gracely Accounting grid and KPIs, prefer GET …/finance/accounting.',
  })
  async listAccounts(@Param('churchId') churchId: string) {
    return await this.financeService.listAccountsByChurch(churchId);
  }

  @Get('accounting')
  @ApiOperation({
    summary: 'Accounting overview',
    description:
      'Summary cards (total balance = assets − liabilities, asset/liability counts, categories, payees) plus account rows with connected fund name. Matches Gracely /accounting.',
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
  async accountingOverview(
    @Param('churchId') churchId: string,
    @Query('filter') filterRaw?: string,
    @Query('search') search?: string,
  ) {
    return await this.financeService.getAccountingOverview(churchId, {
      filter: FinanceController.parseAccountingFilter(filterRaw),
      search,
    });
  }

  @Post('accounts/:accountId/transactions')
  @ApiUuidPathParam('accountId', 'Financial account ID')
  @ApiOperation({ summary: 'Post transaction' })
  @ApiBody({ type: CreateTransactionDto })
  async addTransaction(
    @Param('churchId') churchId: string,
    @Param('accountId') accountId: string,
    @Body() body: CreateTransactionDto,
  ) {
    return await this.financeService.addTransaction(
      churchId,
      accountId,
      body,
    );
  }

  @Get('accounts/:accountId/transactions')
  @ApiUuidPathParam('accountId', 'Financial account ID')
  @ApiOperation({ summary: 'List transactions for account' })
  async getTransactions(
    @Param('churchId') churchId: string,
    @Param('accountId') accountId: string,
  ) {
    return await this.financeService.getTransactions(churchId, accountId);
  }

  @Post('funds')
  @ApiOperation({ summary: 'Create fund' })
  @ApiBody({ type: CreateFundDto })
  async createFund(
    @Param('churchId') churchId: string,
    @Body() body: CreateFundDto,
  ) {
    return await this.financeService.createFund(churchId, body);
  }

  @Get('funds')
  @ApiOperation({ summary: 'List funds' })
  async listFunds(@Param('churchId') churchId: string) {
    return await this.financeService.listFundsByChurch(churchId);
  }

  @Post('pledge-campaigns')
  @ApiOperation({ summary: 'Create pledge campaign' })
  @ApiBody({ type: CreatePledgeCampaignDto })
  async createPledgeCampaign(
    @Param('churchId') churchId: string,
    @Body() body: CreatePledgeCampaignDto,
  ) {
    return await this.financeService.createPledgeCampaign(churchId, body);
  }

  @Get('pledge-campaigns')
  @Get('pledge-accounts')
  @ApiOperation({
    summary: 'Pledge campaigns dashboard',
    description:
      'Church-wide totals plus one row per campaign (fund name, sums, remaining, progress %). Matches Gracely Pledges / pledge-accounts UI.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['all', 'in_progress', 'completed'],
    description: 'Tab filter: all, in progress, or completed campaigns',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Case-insensitive partial match on campaign name',
  })
  async pledgeCampaignsOverview(
    @Param('churchId') churchId: string,
    @Query('filter') filter?: string,
    @Query('search') search?: string,
  ) {
    return await this.financeService.getPledgeCampaignOverview(churchId, {
      filter,
      search,
    });
  }

  @Patch('pledge-campaigns/:campaignId')
  @ApiUuidPathParam('campaignId', 'Pledge campaign ID')
  @ApiOperation({ summary: 'Update or archive pledge campaign' })
  @ApiBody({ type: UpdatePledgeCampaignDto })
  async updatePledgeCampaign(
    @Param('churchId') churchId: string,
    @Param('campaignId') campaignId: string,
    @Body() body: UpdatePledgeCampaignDto,
  ) {
    return await this.financeService.updatePledgeCampaign(
      churchId,
      campaignId,
      body,
    );
  }

  @Get('pledge-campaigns/:campaignId/pledges')
  @ApiUuidPathParam('campaignId', 'Pledge campaign ID')
  @ApiOperation({ summary: 'List pledges in a campaign' })
  async listPledgesForCampaign(
    @Param('churchId') churchId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.financeService.listPledgesForCampaign(
      churchId,
      campaignId,
    );
  }

  @Post('pledges')
  @ApiOperation({ summary: 'Create member pledge' })
  @ApiBody({ type: CreateStewardshipPledgeDto })
  async createPledge(
    @Param('churchId') churchId: string,
    @Body() body: CreateStewardshipPledgeDto,
  ) {
    return await this.financeService.createPledge(churchId, body);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Financial summary' })
  @ApiQuery({ name: 'branchId', required: false, schema: { format: 'uuid' } })
  async getStats(
    @Param('churchId') churchId: string,
    @Query('branchId') branchId?: string,
  ) {
    return await this.financeService.getStats(churchId, branchId);
  }
}
