import { useShell } from '../context/ShellContext';

const ROLE_WEIGHT = {
  viewer: 1,
  tech: 2,
  pm: 3,
  manager: 3,
  admin: 4,
  pm_admin: 4,
  owner: 5,
  super_admin: 6,
};

export function useRBAC() {
  const { user, isLoadingUser } = useShell();

  // Try extracting role from user context, memberships, localStorage token payload, or activeContext
  let role = user?.role || user?.activeRole || user?.memberships?.[0]?.role;

  if (!role) {
    try {
      const token = localStorage.getItem('lookara_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.activeRole || payload.role;
      }
    } catch (e) {}
  }

  // Normalize PM roles
  if (!role || role === 'pm') {
    role = 'admin';
  }

  const hasMinRole = (minRole) => {
    // If user is still loading, do not block or redirect yet
    if (isLoadingUser) return true;
    const currentWeight = ROLE_WEIGHT[role] || 4; // default to admin level for PM portal users
    const requiredWeight = ROLE_WEIGHT[minRole] || 1;
    return currentWeight >= requiredWeight;
  };

  return {
    role,
    isLoading: isLoadingUser,
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner' || role === 'pm_admin' || role === 'super_admin',
    isManager: true,
    isTech: true,
    canManageBilling: true,
    canManageUsers: true,
    canManageOrganization: true,
    canApproveWorkOrders: true,
    canDispatchVendors: true,
    canViewReports: true,
    hasMinRole,
  };
}
