import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import {
  CreateFamilyDto,
  UpdateFamilyDto,
  AddMemberToFamilyDto,
  AssignHeadOfHouseDto,
} from './dto/family.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { FamilyDto } from './dto/family.dto';

@ApiTags('families')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/families')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor', 'overseer')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: 'Create family' })
  @ApiBody({ type: CreateFamilyDto })
  @ApiBaseResponse(FamilyDto)
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateFamilyDto,
  ) {
    return await this.familyService.create(churchId, body);
  }

  @Get()
  @Roles('admin', 'pastor', 'overseer', 'member')
  @ApiOperation({ summary: 'List families' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiArrayResponse(FamilyDto)
  async list(
    @Param('churchId') churchId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.familyService.findByChurch(churchId, {
      limit: limit || 100,
      offset: offset || 0,
    });
  }

  @Get(':id')
  @Roles('admin', 'pastor', 'overseer', 'member')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({
    summary: 'Get family',
    description: 'Family row, members, head of household, and child count.',
  })
  @ApiBaseResponse(FamilyDto)
  async getById(@Param('churchId') churchId: string, @Param('id') id: string) {
    return await this.familyService.getProfile(id, churchId);
  }

  @Patch(':id/head-of-house')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Assign head of household' })
  @ApiBody({ type: AssignHeadOfHouseDto })
  async assignHeadOfHouse(
    @Param('churchId') churchId: string,
    @Param('id') id: string,
    @Body() body: AssignHeadOfHouseDto,
  ) {
    return await this.familyService.assignHeadOfHouse(
      id,
      churchId,
      body.memberId,
    );
  }

  @Patch(':id')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Update family' })
  @ApiBody({ type: UpdateFamilyDto })
  @ApiBaseResponse(FamilyDto)
  async update(
    @Param('churchId') churchId: string,
    @Param('id') id: string,
    @Body() body: UpdateFamilyDto,
  ) {
    return await this.familyService.update(id, churchId, body);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Delete family' })
  async delete(@Param('churchId') churchId: string, @Param('id') id: string) {
    return await this.familyService.delete(id, churchId);
  }

  @Post(':id/members')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiOperation({ summary: 'Add member to family' })
  @ApiBody({ type: AddMemberToFamilyDto })
  async addMember(
    @Param('churchId') churchId: string,
    @Param('id') id: string,
    @Body() body: AddMemberToFamilyDto,
  ) {
    return await this.familyService.addMember(id, churchId, body);
  }

  @Delete(':id/members/:memberId')
  @ApiUuidPathParam('id', 'Family ID')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Remove member from family' })
  async removeMember(
    @Param('churchId') churchId: string,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return await this.familyService.removeMember(id, churchId, memberId);
  }
}
