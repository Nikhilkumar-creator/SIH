import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthProvider';
import type { UserRole } from '../types/domain';
import { RoleBadge } from '../components/RoleBadge';
import { Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('researcher');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loginAsDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          return;
        }
      } else {
        // Resilient/demo mode sign-in
        loginAsDemoRole('researcher');
      }
      navigate('/repository');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, department, role },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        setSuccess('Account registered! Please check your email inbox to confirm your account.');
      } else {
        loginAsDemoRole(role);
        navigate('/repository');
      }
    } catch (err: any) {
      setError(err?.message || 'Sign up failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoRole: UserRole) => {
    loginAsDemoRole(demoRole);
    if (demoRole === 'admin' || demoRole === 'editor') {
      navigate('/admin');
    } else {
      navigate('/repository');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950 text-cyan-300 font-extrabold flex items-center justify-center text-2xl mx-auto shadow-md">
          ❄
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          NCPOR Polar Science Portal
        </h1>
        <p className="text-xs text-slate-500">
          Sign in to access your researcher portfolio, ingest expedition data, or review publications.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              tab === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              tab === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 mb-5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
            {success}
          </div>
        )}

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Official Email Address</label>
              <input
                type="email"
                required
                placeholder="scientist@ncpor.res.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? 'Authenticating…' : 'Sign in to Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name & Title</label>
              <input
                type="text"
                required
                placeholder="Dr. Rajesh Patel"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department / Institute</label>
              <input
                type="text"
                placeholder="Cryospheric Sciences & Glaciology"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Requested Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="researcher">Researcher (Asset Ingestion & Drafts)</option>
                <option value="editor">Editor (Editorial Review Queue)</option>
                <option value="visitor">Public Visitor / Student</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="researcher@ncpor.res.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? 'Creating Account…' : 'Register Account'}
            </button>
          </form>
        )}
      </div>

      {/* 1-Click Demo Testing Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>1-Click Evaluator Role Testing</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Test role-based permissions immediately without configuring SMTP or checking emails:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleQuickLogin('admin')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 text-left hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">Admin</span>
              <RoleBadge role="admin" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500">Publish, audit & manage</p>
          </button>

          <button
            onClick={() => handleQuickLogin('editor')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-left hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">Editor</span>
              <RoleBadge role="editor" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500">Review & approve drafts</p>
          </button>

          <button
            onClick={() => handleQuickLogin('researcher')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-400 text-left hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">Researcher</span>
              <RoleBadge role="researcher" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500">Upload & AI ingestion</p>
          </button>

          <button
            onClick={() => handleQuickLogin('visitor')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 text-left hover:shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">Visitor</span>
              <RoleBadge role="visitor" size="sm" />
            </div>
            <p className="text-[11px] text-slate-500">Explore open repository</p>
          </button>
        </div>
      </div>
    </div>
  );
};
