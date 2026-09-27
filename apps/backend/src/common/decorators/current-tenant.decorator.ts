// apps/backend/src/common/decorators/current-tenant.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.organizationId || request.headers['x-organization-id'];

    return tenantId;
  },
);
