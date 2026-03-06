import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Shows a loading screen while checking stored token.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * AdminRoute — only allows ROLE_ADMIN users.
 * Regular users are redirected to /dashboard with an error.
 */
export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (user.role !== 'ROLE_ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/* ── Full-page loader ── */
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--black)',
      gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(30,111,255,0.2)',
        borderTopColor: '#1E6FFF',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
      <p style={{ color: '#7A8BAA', fontSize: 14 }}>Loading FitTrack…</p>
    </div>
  );
}