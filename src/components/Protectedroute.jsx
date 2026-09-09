import { Navigate, Outlet } from 'react-router-dom';

// Use as a layout route: <Route element={<ProtectedRoute roles={["admin"]} />}>
export default function ProtectedRoute({ roles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}