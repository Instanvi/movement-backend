import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DonationService } from './donation.service';
import { CreateDonationDto } from './dto/donation.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiBranchIdParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
  ApiPaginatedResponse,
} from '../../core/swagger/responses.decorator';
import { DonationDto } from './dto/donation.dto';
import { PaginationQueryDto } from '../../core/dto/pagination-query.dto';

@ApiTags('donation')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@ApiBranchIdParam()
@Controller('churches/:churchId/branches/:branchId/donations')
@UseGuards(AuthGuard, RolesGuard)
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post()
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Record donation' })
  @ApiQuery({
    name: 'donorId',
    description: 'Donor identifier',
    required: true,
  })
  @ApiBody({ type: CreateDonationDto })
  @ApiBaseResponse(DonationDto)
  async create(
    @Param('churchId') churchId: string,
    @Param('branchId') branchId: string,
    @Query('donorId') donorId: string,
    @Body() body: CreateDonationDto,
  ) {
    return await this.donationService.create(churchId, branchId, donorId, body);
  }

  @Get()
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'List donations for branch' })
  @ApiPaginatedResponse(DonationDto)
  async list(
    @Param('branchId') branchId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return await this.donationService.listByBranch(branchId, pagination);
  }

  @Get('church-wide')
  @Roles('admin', 'overseer')
  @ApiOperation({ summary: 'List donations for church (all branches)' })
  @ApiPaginatedResponse(DonationDto)
  async listChurchWide(
    @Param('churchId') churchId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return await this.donationService.listByChurch(churchId, pagination);
  }
}
