import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto, AddMemberToGroupDto } from './dto/group.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { GroupDto, GroupMemberDto } from './dto/group.dto';

@ApiTags('groups')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/groups')
@UseGuards(AuthGuard, RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles('admin', 'pastor')
  @ApiOperation({ summary: 'Create group' })
  @ApiBody({ type: CreateGroupDto })
  @ApiBaseResponse(GroupDto)
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateGroupDto,
  ) {
    return await this.groupService.create(churchId, body);
  }

  @Get()
  @Roles('admin', 'pastor', 'member')
  @ApiOperation({ summary: 'List groups' })
  @ApiArrayResponse(GroupDto)
  async list(@Param('churchId') churchId: string) {
    return await this.groupService.listByChurch(churchId);
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
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
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
