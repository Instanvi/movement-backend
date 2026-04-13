import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import {
  CreateStewardshipPledgeDto,
  CreatePledgeCampaignDto,
  UpdatePledgeCampaignDto,
  PledgeCampaignDto,
  StewardshipPledgeDto,
  PledgeCampaignOverviewDto,
} from './dto/finance.dto';
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

@ApiTags('finance-pledges')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/finance/pledges')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class PledgeController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('campaigns')
  @ApiOperation({ summary: 'Create pledge campaign' })
  @ApiBody({ type: CreatePledgeCampaignDto })
  @ApiBaseResponse(PledgeCampaignDto)
  async createPledgeCampaign(
    @Param('branchId') branchId: string,
    @Body() body: CreatePledgeCampaignDto,
  ) {
    return await this.financeService.createPledgeCampaign(branchId, body);
  }

  @Get('campaigns')
  @ApiOperation({
    summary: 'Pledge campaigns dashboard',
    description: 'Overview of all pledge campaigns.',
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
  @ApiBaseResponse(PledgeCampaignOverviewDto)
  async pledgeCampaignsOverview(
    @Param('branchId') branchId: string,
    @Query('filter') filter?: string,
    @Query('search') search?: string,
  ) {
    return await this.financeService.getPledgeCampaignOverview(branchId, {
      filter,
      search,
    });
  }

  @Patch('campaigns/:campaignId')
  @ApiUuidPathParam('campaignId', 'Pledge campaign ID')
  @ApiOperation({ summary: 'Update or archive pledge campaign' })
  @ApiBody({ type: UpdatePledgeCampaignDto })
  @ApiBaseResponse(PledgeCampaignDto)
  async updatePledgeCampaign(
    @Param('branchId') branchId: string,
    @Param('campaignId') campaignId: string,
    @Body() body: UpdatePledgeCampaignDto,
  ) {
    return await this.financeService.updatePledgeCampaign(
      branchId,
      campaignId,
      body,
    );
  }

  @Get('campaigns/:campaignId/pledges')
  @ApiUuidPathParam('campaignId', 'Pledge campaign ID')
  @ApiOperation({ summary: 'List pledges in a campaign' })
  @ApiArrayResponse(StewardshipPledgeDto)
  async listPledgesForCampaign(
    @Param('branchId') branchId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.financeService.listPledgesForCampaign(
      branchId,
      campaignId,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create member pledge' })
  @ApiBody({ type: CreateStewardshipPledgeDto })
  @ApiBaseResponse(StewardshipPledgeDto)
  async createPledge(
    @Param('branchId') branchId: string,
    @Body() body: CreateStewardshipPledgeDto,
  ) {
    return await this.financeService.createPledge(branchId, body);
  }
}
