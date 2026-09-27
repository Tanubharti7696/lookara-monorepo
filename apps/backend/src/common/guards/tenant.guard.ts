// apps/backend/src/common/guards/tenant.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      throw new ForbiddenException('User context required for tenant validation');
    }

    // Platform Super Admin bypasses single-tenant restrictions with full audit logging
    if (user.isAdmin) {
      const explicitOrg = request.headers['x-organization-id'] as string;
      if (explicitOrg) {
        request.organizationId = explicitOrg;
      }
      return true;
    }

    // Requested organization from header, query, or active JWT context
    const requestedOrgId =
      (request.headers['x-organization-id'] as string) ||
      (request.query?.organizationId as string) ||
      user.activeOrganizationId;

    if (!requestedOrgId) {
      // If user has no active org and endpoint is not org-specific, continue
      return true;
    }

    // Verify user actually belongs to this organization
    const hasOrgAccess = user.activeOrganizationId === requestedOrgId;

    if (!hasOrgAccess && !user.isAdmin) {
      throw new ForbiddenException('Access to requested organization denied');
    }

    request.organizationId = requestedOrgId;
    return true;
  }
}
