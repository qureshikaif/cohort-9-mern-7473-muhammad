import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Remember where they were headed so sign-in can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
