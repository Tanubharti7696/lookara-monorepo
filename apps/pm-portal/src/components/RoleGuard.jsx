import { Navigate } from 'react-router-dom';
import { useRBAC } from '../hooks/useRBAC';

export function RoleGuard({ children, minRole = 'manager', fallback = '/dashboard' }) {
  const { hasMinRole, isLoading } = useRBAC();

  if (isLoading) {
    return null; // wait until user session is resolved
  }

  if (!hasMinRole(minRole)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
