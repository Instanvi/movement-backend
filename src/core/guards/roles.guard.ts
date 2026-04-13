import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { MemberRepository } from '../../domain/repositories/member.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import type { AuthenticatedRequest } from '../types/authenticated-request';

/**
 * Extracts branchId from route params, query, or body.
 */
function extractBranchId(request: AuthenticatedRequest): string | undefined {
  const p = request.params as Record<string, string | undefined>;
  const q = request.query as Record<string, string | string[] | undefined>;
  const fromParam = p['branchId'];
  const rawQ = q['branchId'];
  const fromQuery =
    typeof rawQ === 'string' ? rawQ : Array.isArray(rawQ) ? rawQ[0] : undefined;
  const body = request.body as { branchId?: string } | undefined;
  const fromBody =
    body && typeof body.branchId === 'string' ? body.branchId : undefined;
  return fromParam ?? fromQuery ?? fromBody;
}

/**
 * Extracts churchId from route params or query (for church-scoped routes like settings/subscriptions).
 */
function extractChurchId(request: AuthenticatedRequest): string | undefined {
  const p = request.params as Record<string, string | undefined>;
  const q = request.query as Record<string, string | string[] | undefined>;
  const raw = p['churchId'] ?? p['id'] ?? q['churchId'];
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private memberRepo: MemberRepository,
    private branchRepo: BranchRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user ?? undefined;

    if (!user) {
      throw new UnauthorizedException('User not authenticated via Better Auth');
    }

    // Determine churchId: either directly from route (church-scoped) or derived from branchId
    let churchId = extractChurchId(request);
    const branchId = extractBranchId(request);

    if (!churchId && branchId) {
      const branch = await this.branchRepo.findOne(branchId);
      if (!branch) {
        throw new ForbiddenException('Branch not found');
      }
      churchId = branch.churchId;
    }

    if (!churchId || typeof churchId !== 'string') {
      throw new ForbiddenException('Church context missing for role check');
    }

    const member = await this.memberRepo.findMembershipForRoleCheck(
      user.id,
      churchId,
      branchId,
    );

    if (!member) {
      throw new ForbiddenException(
        'User is not a member of this church for the requested branch context',
      );
    }

    const hasRole = requiredRoles.includes(member.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(' or ')}. Your role: ${member.role}`,
      );
    }

    request.member = member;

    return true;
  }
}
