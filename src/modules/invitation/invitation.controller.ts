import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import { SendInvitationDto, InvitationDto } from './dto/invitation.dto';
import {
  ApiBaseResponse,
  ApiArrayResponse,
} from '../../core/swagger/responses.decorator';
import { AuthGuard } from '@mguay/nestjs-better-auth';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiBranchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';
import {
  ActiveUser,
  ActiveUserEntity,
} from '../../core/decorators/active-user.decorator';

@ApiTags('invitations')
@ApiChurchRouteAuth()
@ApiBranchIdParam()
@Controller('branches/:branchId/invitations')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @ApiOperation({ summary: 'Send invitation' })
  @ApiBody({ type: SendInvitationDto })
  @ApiBaseResponse(InvitationDto)
  async send(
    @ActiveUser() user: ActiveUserEntity,
    @Param('branchId') branchId: string,
    @Body() body: SendInvitationDto,
  ) {
    return await this.invitationService.send(branchId, user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'List invitations' })
  @ApiArrayResponse(InvitationDto)
  async list(@Param('branchId') branchId: string) {
    return await this.invitationService.list(branchId);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Invitation ID')
  @ApiOperation({ summary: 'Revoke invitation' })
  @ApiBaseResponse(InvitationDto)
  async revoke(@Param('id') id: string) {
    return await this.invitationService.revoke(id);
  }
}
