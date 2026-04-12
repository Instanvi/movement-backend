import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
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
import type { AuthenticatedRequest } from '../../core/types/authenticated-request';
import { ApiChurchRouteAuth } from '../../core/swagger/auth-swagger.decorators';
import {
  ApiChurchIdParam,
  ApiUuidPathParam,
} from '../../core/swagger/path-params.decorators';

@ApiTags('invitations')
@ApiChurchRouteAuth()
@ApiChurchIdParam()
@Controller('churches/:churchId/invitations')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'pastor')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @ApiOperation({ summary: 'Send invitation' })
  @ApiBody({ type: SendInvitationDto })
  @ApiBaseResponse(InvitationDto)
  async send(
    @Request() req: AuthenticatedRequest,
    @Param('churchId') churchId: string,
    @Body() body: SendInvitationDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user');
    }
    return await this.invitationService.send(churchId, userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List invitations' })
  @ApiArrayResponse(InvitationDto)
  async list(@Param('churchId') churchId: string) {
    return await this.invitationService.list(churchId);
  }

  @Delete(':id')
  @ApiUuidPathParam('id', 'Invitation ID')
  @ApiOperation({ summary: 'Revoke invitation' })
  @ApiBaseResponse(InvitationDto)
  async revoke(@Param('id') id: string) {
    return await this.invitationService.revoke(id);
  }
}
