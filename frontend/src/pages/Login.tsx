import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ maxWidth: 380, margin: '40px auto', padding: 24, border: '1px solid #e2e8f0', borderRadius: 8, background: '#ffffff' }}>
      <h2 style={{ marginBottom: 20 }}>Sign in</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 15 }}>
          <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 20 }}>
          <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        {error && <p role="alert" style={{ color: '#dc2626', fontSize: 14, marginBottom: 15 }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </section>
  );
};
