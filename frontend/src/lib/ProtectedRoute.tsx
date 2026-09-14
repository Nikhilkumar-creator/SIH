import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { UserRole } from '../types/domain';

interface Props {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading application…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p role="alert">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};
