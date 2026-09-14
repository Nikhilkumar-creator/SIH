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

  if (loading) return <p>Loading…</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    return <p role="alert">You don't have permission to view this page.</p>;
  }
  return <>{children}</>;
};
