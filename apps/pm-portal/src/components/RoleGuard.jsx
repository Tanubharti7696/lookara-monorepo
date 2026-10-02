import { Navigate } from 'react-router-dom';
import { useRBAC } from '../hooks/useRBAC';

export function RoleGuard({ children, minRole = 'manager', fallback = '/dashboard' }) {
  const { hasMinRole, role } = useRBAC();

  if (!role) {
    // Role not loaded yet, or no role at all, you might want a loading spinner here
    // But since AuthGuard runs first, we assume shell user is loaded
  }

  if (!hasMinRole(minRole)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
