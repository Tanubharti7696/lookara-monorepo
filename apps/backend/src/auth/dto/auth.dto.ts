// apps/backend/src/auth/dto/login.dto.ts
import type { PortalType } from '@lookara/auth';

export interface LoginDto {
  email: string;
  password: string;
  portal?: PortalType;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface SwitchContextDto {
  organizationId: string;
  portal?: PortalType;
}
