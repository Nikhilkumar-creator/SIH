import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthProvider';
import type { ContentStatus, GeneratedContent } from '../types/domain';
import { OutreachEditor } from '../components/OutreachEditor';

const NEXT_STATUS: Record<ContentStatus, ContentStatus | null> = {
  draft: 'peer_review',
  peer_review: 'admin_approved',
  admin_approved: 'published',
  published: null,
  rejected: null,
};

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('generated_content')
        .select('*')
        .neq('status', 'published')
        .order('created_at', { ascending: true });
      if (err) setError('Could not load the review queue.');
      else setItems((data ?? []) as GeneratedContent[]);
    } catch (err) {
      console.error('Load dashboard error:', err);
      setError('Database connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (item: GeneratedContent) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    if (next === 'published' && profile?.role !== 'admin') {
      setError('Only an admin can publish content.');
      return;
    }
    try {
      const { error: err } = await supabase
        .from('generated_content')
        .update({
          status: next,
          reviewed_by: profile?.id,
          published_at: next === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', item.id);
      if (err) setError(err.message);
      else load();
    } catch (err: any) {
      setError(err?.message || 'Failed to update item status.');
    }
  };

  const reject = async (item: GeneratedContent) => {
    try {
      const { error: err } = await supabase
        .from('generated_content')
        .update({ status: 'rejected', reviewed_by: profile?.id })
        .eq('id', item.id);
      if (err) setError(err.message);
      else load();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject item.');
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading review queue…</p>;

  return (
    <section>
      <h2 style={{ marginBottom: 16 }}>Editorial Review Queue</h2>
      {error && <p role="alert" style={{ color: '#dc2626', marginBottom: 15 }}>{error}</p>}
      {items.length === 0 ? (
        <p style={{ color: '#64748b', marginTop: 10 }}>Nothing waiting on review.</p>
      ) : (
        items.map((item) => (
          <OutreachEditor
            key={item.id}
            item={item}
            nextLabel={NEXT_STATUS[item.status] ?? undefined}
            onAdvance={() => advance(item)}
            onReject={() => reject(item)}
          />
        ))
      )}
    </section>
  );
};
