// packages/auth/src/types.ts

export type AccountStatus = 'active' | 'invited' | 'limited' | 'suspended' | 'disabled';

export type OrganizationRole =
  | 'owner'
  | 'admin'
  | 'ops_manager'
  | 'coordinator'
  | 'viewer';

export type PortalType = 'pm' | 'vendor' | 'owner' | 'admin' | 'trust' | 'public';

export interface OrganizationMembership {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrganizationRole;
  status: AccountStatus;
}

export interface UserContext {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  accountStatus: AccountStatus;
  
  // Organization memberships (PM team)
  memberships: OrganizationMembership[];
  
  // Scoped roles
  isOwner: boolean;
  ownerId?: string;
  
  isVendor: boolean;
  vendorId?: string;
  vendorRole?: string;
  
  isAdmin: boolean;
  adminRole?: string;
  
  // Available workspaces / portals
  allowedPortals: PortalType[];
  
  // Active context for current request
  activeContext?: {
    portal: PortalType;
    organizationId?: string;
    role?: string;
    propertyIds?: string[];
  };
}

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  fullName: string;
  activePortal: PortalType;
  activeOrganizationId?: string;
  activeRole?: string;
  isOwner?: boolean;
  isVendor?: boolean;
  isAdmin?: boolean;
  allowedPortals: PortalType[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}
