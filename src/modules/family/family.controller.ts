import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import {
  CreateFamilyDto,
  UpdateFamilyDto,
  AddMemberToFamilyDto,
  AssignHeadOfHouseDto,
  FamilyDto,
} from './dto/family.dto';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam, ApiUuidPathParam } from '../../core/swagger/path-params.decorators';
import { ApiBaseResponse, ApiArrayResponse } from '../../core/swagger/responses.decorator';

@ApiTags('families')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/families')
@UseGuards(RolesGuard)
@Roles('admin', 'pastor', 'overseer')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: 'Create family' })
  @ApiBody({ type: CreateFamilyDto })
  @ApiBaseResponse(FamilyDto)
  async create(@Param('branchId') branchId: string, @Body() body: CreateFamilyDto) {
    return await this.familyService.createForBranch(branchId, body);
  }

  @Get()
  @Roles('admin', 'pastor', 'overseer', 'member')
  @ApiOperation({ summary: 'List families' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiArrayResponse(FamilyDto)
  async list(
    @Param('branchId') branchId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.familyService.findByBranch(branchId, {
      limit: limit || 100,
      offset: offset || 0,
    });
  }

  @Get(':id')
  @Roles('admin', 'pastor', 'overseer', 'member')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Get family' })
  @ApiBaseResponse(FamilyDto)
  async getById(@Param('branchId') branchId: string, @Param('id') id: string) {
    return await this.familyService.getProfileForBranch(id, branchId);
  }

  @Patch(':id/head-of-house')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Assign head of household' })
  @ApiBody({ type: AssignHeadOfHouseDto })
  async assignHeadOfHouse(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() body: AssignHeadOfHouseDto,
  ) {
    return await this.familyService.assignHeadOfHouseForBranch(id, branchId, body.memberId);
  }

  @Patch(':id')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Update family' })
  @ApiBody({ type: UpdateFamilyDto })
  @ApiBaseResponse(FamilyDto)
  async update(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() body: UpdateFamilyDto,
  ) {
    return await this.familyService.updateForBranch(id, branchId, body);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Delete family' })
  async delete(@Param('branchId') branchId: string, @Param('id') id: string) {
    return await this.familyService.deleteForBranch(id, branchId);
  }

  @Post(':id/members')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Add member to family' })
  @ApiBody({ type: AddMemberToFamilyDto })
  async addMember(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Body() body: AddMemberToFamilyDto,
  ) {
    return await this.familyService.addMemberForBranch(id, branchId, body);
  }

  @Delete(':id/members/:memberId')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Remove member from family' })
  async removeMember(
    @Param('branchId') branchId: string,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return await this.familyService.removeMemberForBranch(id, branchId, memberId);
  }
}
