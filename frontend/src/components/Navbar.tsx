import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';
import { checkBackendHealth } from '../lib/api';
import { IngestModal } from './IngestModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { session, profile, signOut } = useAuth();
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendStatus(res.status === 'ok' || res.status === 'degraded' ? 'online' : 'offline');
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className="glass-panel"
        style={{
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Logo Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              }}
            >
              🧊
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.1 }}>
                NCPOR ICEBOUND
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-ice)', letterSpacing: '0.08em', fontWeight: 600 }}>
                POLAR OUTREACH ENGINE
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to="/"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: isActive('/') ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              }}
            >
              Home
            </Link>
            <Link
              to="/repository"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/repository') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: isActive('/repository') ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              }}
            >
              Repository
            </Link>

            <Link
              to="/admin"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/admin') ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: isActive('/admin') ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              }}
            >
              Editorial Workflow
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Quick Ingest Button */}
            <button className="btn-primary" onClick={() => setIsIngestOpen(true)} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              ⚡ Ingest PDF
            </button>

            {/* Backend Status Ping */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 20,
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-light)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
              title="FastAPI Ollama Engine Health"
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor:
                    backendStatus === 'online'
                      ? '#10b981'
                      : backendStatus === 'offline'
                      ? '#f43f5e'
                      : '#f59e0b',
                  boxShadow:
                    backendStatus === 'online'
                      ? '0 0 8px #10b981'
                      : 'none',
                }}
              />
              Backend: {backendStatus}
            </div>

            {/* Auth Profile / Sign in */}
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-cyan">
                  {profile?.role ?? 'User'}
                </span>
                <button className="btn-secondary" onClick={signOut} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Ingest Modal Component */}
      <IngestModal isOpen={isIngestOpen} onClose={() => setIsIngestOpen(false)} />
    </>
  );
};
