import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MemberService } from './member.service';
import {
  CreateMemberDto,
  CreatePeopleBulkDto,
  UpdateMemberStatusDto,
  TransferMemberDto,
  UpdateMemberDto,
} from './dto/member.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('members')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/members')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor', 'overseer')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @ApiOperation({ summary: 'Create member' })
  @ApiBody({ type: CreateMemberDto })
  async create(
    @Param('churchId') churchId: string,
    @Body() body: CreateMemberDto,
  ) {
    return await this.memberService.createMemberWithUser({
      ...body,
      churchId,
    });
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create members' })
  @ApiBody({ type: CreatePeopleBulkDto })
  async createBulk(
    @Param('churchId') churchId: string,
    @Body() body: CreatePeopleBulkDto,
  ) {
    return await this.memberService.createPeopleBulk(churchId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List members' })
  async list(@Param('churchId') churchId: string) {
    return await this.memberService.findByChurch(churchId);
  }

  @Patch(':memberId/transfer')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Transfer member to another branch' })
  @ApiBody({ type: TransferMemberDto })
  async transfer(
    @Param('memberId') memberId: string,
    @Body() body: TransferMemberDto,
  ) {
    return await this.memberService.transfer(memberId, body.newBranchId);
  }

  @Put(':memberId/status')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Update member status' })
  @ApiBody({ type: UpdateMemberStatusDto })
  async updateStatus(
    @Param('memberId') memberId: string,
    @Body() body: UpdateMemberStatusDto,
  ) {
    return await this.memberService.updateStatus(memberId, body);
  }

  @Patch(':memberId')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Update member' })
  @ApiBody({ type: UpdateMemberDto })
  async update(
    @Param('memberId') memberId: string,
    @Body() body: UpdateMemberDto,
  ) {
    return await this.memberService.update(memberId, body);
  }

  @Delete(':memberId')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Remove member from church' })
  async delete(@Param('memberId') memberId: string) {
    return await this.memberService.delete(memberId);
  }

  @Get(':memberId')
  @ApiUuidPathParam('memberId', 'Member ID')
  @ApiOperation({ summary: 'Get member by ID' })
  async findOne(@Param('memberId') memberId: string) {
    return await this.memberService.findOne(memberId);
  }
}
