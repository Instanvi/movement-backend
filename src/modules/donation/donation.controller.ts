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
import { DonationService } from './donation.service';
import { CreateDonationDto, DonationDto } from './dto/donation.dto';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam } from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiPaginatedResponse,
} from '../../core/swagger/responses.decorator';
import { PaginationQueryDto } from '../../core/dto/pagination-query.dto';

@ApiTags('donation')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/donations')
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
    @Param('branchId') branchId: string,
    @Query('donorId') donorId: string,
    @Body() body: CreateDonationDto,
  ) {
    return await this.donationService.create(branchId, donorId, body);
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
}
