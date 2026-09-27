// src/components/RoleRouter.tsx
// Smart redirect: if logged in → go to correct portal, else → login page
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser, getDashboardPath } from '../utils/auth';

export default function RoleRouter() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}
