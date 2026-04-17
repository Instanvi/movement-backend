import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { ApiBearerSession } from 'src/core/swagger/auth-swagger.decorators';

@ApiTags('users')
@ApiBearerSession()
@Controller('users')
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

  @Get('public')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Public users route (no session)',
    description:
      'Demonstrates `@AllowAnonymous()` with the global AuthGuard from `@thallesp/nestjs-better-auth`.',
  })
  publicRoute() {
    return { message: 'This route is public' };
  }

  @Get('optional')
  @OptionalAuth()
  @ApiOperation({
    summary: 'Optional auth (session may be absent)',
    description:
      'Demonstrates `@OptionalAuth()`; `session` is null when the client sends no credentials.',
  })
  optionalRoute(@Session() session: UserSession | null) {
    return { authenticated: !!session, session };
  }
}
