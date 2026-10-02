import { useShell } from '../context/ShellContext';

const ROLE_WEIGHT = {
  viewer: 1,
  tech: 2,
  manager: 3,
  admin: 4,
  owner: 5,
};

export function useRBAC() {
  const { user } = useShell();
  
  // Extract role from the active organization membership or fallback to viewer
  const role = user?.memberships?.[0]?.role || 'viewer';

  const hasMinRole = (minRole) => {
    const currentWeight = ROLE_WEIGHT[role] || 0;
    const requiredWeight = ROLE_WEIGHT[minRole] || Infinity;
    return currentWeight >= requiredWeight;
  };

  return {
    role,
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner',
    isManager: role === 'manager' || role === 'admin' || role === 'owner',
    isTech: role === 'tech' || role === 'manager' || role === 'admin' || role === 'owner',
    
    // Feature specific checks
    canManageBilling: hasMinRole('admin'),
    canManageUsers: hasMinRole('admin'),
    canManageOrganization: hasMinRole('admin'),
    canApproveWorkOrders: hasMinRole('manager'),
    canDispatchVendors: hasMinRole('manager'),
    canViewReports: hasMinRole('manager'),
    
    hasMinRole,
  };
}
