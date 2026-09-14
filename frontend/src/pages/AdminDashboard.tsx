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
    const { data, error: err } = await supabase
      .from('generated_content')
      .select('*')
      .neq('status', 'published')
      .order('created_at', { ascending: true });
    if (err) setError('Could not load the review queue.');
    else setItems((data ?? []) as GeneratedContent[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (item: GeneratedContent) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    // Admin-approval -> published is the only transition admins gate;
    // editors can move draft -> peer_review themselves.
    if (next === 'published' && profile?.role !== 'admin') {
      setError('Only an admin can publish.');
      return;
    }
    const { error: err } = await supabase
      .from('generated_content')
      .update({ status: next, reviewed_by: profile?.id, published_at: next === 'published' ? new Date().toISOString() : null })
      .eq('id', item.id);
    if (err) setError(err.message);
    else load();
  };

  const reject = async (item: GeneratedContent) => {
    const { error: err } = await supabase
      .from('generated_content')
      .update({ status: 'rejected', reviewed_by: profile?.id })
      .eq('id', item.id);
    if (err) setError(err.message);
    else load();
  };

  if (loading) return <p>Loading review queue…</p>;

  return (
    <section>
      <h2>Editorial Review Queue</h2>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
      {items.length === 0 ? (
        <p>Nothing waiting on review.</p>
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
