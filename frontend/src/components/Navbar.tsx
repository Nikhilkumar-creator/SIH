import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthProvider';
import { RoleBadge } from './RoleBadge';
import type { UserRole } from '../types/domain';
import {
  Compass,
  Database,
  BookOpen,
  Upload,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  LogIn,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { session, profile, signOut, loginAsDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Home', path: '/', icon: Sparkles },
    { label: 'Repository', path: '/repository', icon: Database },
    { label: 'Outreach Stories', path: '/articles', icon: BookOpen },
    { label: 'Expeditions', path: '/expeditions', icon: Compass },
  ];

  if (session && (profile?.role === 'researcher' || profile?.role === 'editor' || profile?.role === 'admin')) {
    navLinks.push({ label: 'Ingest Asset', path: '/upload', icon: Upload });
  }

  if (session && (profile?.role === 'editor' || profile?.role === 'admin')) {
    navLinks.push({ label: 'Admin Console', path: '/admin', icon: ShieldCheck });
  }

  const handleRoleSwitch = (role: UserRole) => {
    loginAsDemoRole(role);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
              ❄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-cyan-300">NCPOR</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  MoES India
                </span>
              </div>
              <p className="text-xs text-slate-400 -mt-0.5 hidden sm:block">Polar Science Outreach Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar / User / Demo Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 hover:border-cyan-600 text-xs text-slate-300 transition-colors cursor-pointer"
                title="Switch user role for testing"
              >
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold text-cyan-300 capitalize">
                  {profile?.role || 'Visitor'}
                </span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-700 text-xs text-slate-400 font-medium">
                    Demo Role Simulator
                  </div>
                  {(['admin', 'editor', 'researcher', 'visitor'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 cursor-pointer ${
                        profile?.role === r ? 'text-cyan-300 font-semibold bg-slate-700/50' : 'text-slate-300'
                      }`}
                    >
                      <span className="capitalize">{r}</span>
                      <RoleBadge role={r} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {session ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                    {profile?.full_name || session.user.email}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {profile?.department || 'National Polar Team'}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-cyan-950 text-cyan-300'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <p className="text-xs text-slate-400 font-medium">Switch Role:</p>
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'editor', 'researcher', 'visitor'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    handleRoleSwitch(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1.5 text-xs rounded border text-center capitalize ${
                    profile?.role === r
                      ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300 font-semibold'
                      : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {session ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded bg-rose-950 text-rose-300 border border-rose-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out ({profile?.full_name || 'User'})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-3 py-2 text-xs font-semibold rounded bg-cyan-600 text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
