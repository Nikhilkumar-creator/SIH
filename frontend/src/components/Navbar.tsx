import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';

export const Navbar: React.FC = () => {
  const { session, profile, signOut } = useAuth();

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
      <Link to="/" style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>NCPOR Portal</Link>
      <Link to="/repository">Repository</Link>
      {session && (
        <Link to="/admin">Editorial Dashboard</Link>
      )}
      <span style={{ flex: 1 }} />
      {session ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: '#64748b' }}>
            {profile?.full_name || session.user.email}
          </span>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <Link to="/login">Sign in</Link>
      )}
    </nav>
  );
};
