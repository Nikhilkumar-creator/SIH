import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { UserRole } from '../types/domain';

interface Props {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const { session, profile, loading, loginAsDemoRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
        <p className="text-slate-600 text-sm mb-6">
          This area requires one of the following permissions:{' '}
          <strong className="text-slate-800">{allowedRoles.join(', ')}</strong>. Your current role is{' '}
          <strong className="text-cyan-700 capitalize">{profile.role}</strong>.
        </p>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Switch Role to Access (Demo Environment):
          </p>
          <div className="flex flex-wrap gap-2">
            {allowedRoles.map((role) => (
              <button
                key={role}
                onClick={() => loginAsDemoRole(role)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:border-cyan-500 hover:text-cyan-700 shadow-xs"
              >
                Switch to {role.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <Link
          to="/"
          className="inline-block text-sm text-cyan-600 hover:text-cyan-800 font-medium"
        >
          ← Return to Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
