import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto, AddMemberToGroupDto, GroupDto, GroupMemberDto } from './dto/group.dto';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import { ApiBranchIdParam, ApiUuidPathParam } from '../../core/swagger/path-params.decorators';
import { ApiBaseResponse, ApiArrayResponse } from '../../core/swagger/responses.decorator';

@ApiTags('groups')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/groups')
@UseGuards(RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create group' })
  @ApiBody({ type: CreateGroupDto })
  @ApiBaseResponse(GroupDto)
  async create(@Param('branchId') branchId: string, @Body() body: CreateGroupDto) {
    return await this.groupService.createForBranch(branchId, body);
  }

  @Get()
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List groups' })
  @ApiArrayResponse(GroupDto)
  async list(@Param('branchId') branchId: string) {
    return await this.groupService.listByBranch(branchId);
  }

  @Post(':id/members')
  @Roles('admin', 'pastor')
  @ApiUuidPathParam('id', 'Group ID')
  @ApiOperation({ summary: 'Add member to group' })
  @ApiBody({ type: AddMemberToGroupDto })
  @ApiBaseResponse(GroupMemberDto)
  async addMember(@Param('id') id: string, @Body() body: AddMemberToGroupDto) {
    return await this.groupService.addMember(id, body.memberId, body.isLeader);
  }

  @Delete(':id/members/:memberId')
  @Roles('admin', 'pastor')
  @ApiUuidPathParam('id', 'Group ID')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Remove member from group' })
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return await this.groupService.removeMember(id, memberId);
  }

  @Get(':id/members')
  @Roles('admin', 'pastor', 'member')
  @ApiUuidPathParam('id', 'Group ID')
  @ApiOperation({ summary: 'List group members' })
  @ApiArrayResponse(GroupMemberDto)
  async getMembers(@Param('id') id: string) {
    return await this.groupService.getMembers(id);
  }
}
