// src/components/ProtectedRoute.tsx
// Guards any portal section — redirects to /login if not authenticated
// and to correct portal if wrong role tries to access
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated, getUser, getDashboardPath } from '../utils/auth';
import type { UserRole } from '../utils/auth';

interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect them to their correct portal
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}
