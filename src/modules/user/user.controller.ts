import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@mguay/nestjs-better-auth';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('me/churches')
  @ApiOperation({
    summary: 'Get all churches and branches the user is a member of',
  })
  async getMyChurches(@Session() session: UserSession) {
    return this.userService.getUserMemberships(session.user.id);
  }

  @Post('workspaces/switch')
  @ApiOperation({
    summary: 'Switch workspace context and get role for the requested branch',
  })
  async switchWorkspace(
    @Body('branchId') branchId: string,
    @Session() session: UserSession,
  ) {
    const mem = await this.userService.getWorkspaceInfo(
      session.user.id,
      branchId,
    );
    return {
      session,
      role: mem.role,
      memberId: mem.id,
      churchId: mem.churchId,
    };
  }
}
