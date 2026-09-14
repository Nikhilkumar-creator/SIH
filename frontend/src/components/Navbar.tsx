import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';

export const Navbar: React.FC = () => {
  const { session, profile, signOut } = useAuth();

  return (
    <nav style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid #eee' }}>
      <Link to="/">Home</Link>
      <Link to="/repository">Repository</Link>
      {session && profile && ['editor', 'admin'].includes(profile.role) && (
        <Link to="/admin">Editorial Dashboard</Link>
      )}
      <span style={{ flex: 1 }} />
      {session ? (
        <button onClick={signOut}>Sign out</button>
      ) : (
        <Link to="/login">Sign in</Link>
      )}
    </nav>
  );
};
