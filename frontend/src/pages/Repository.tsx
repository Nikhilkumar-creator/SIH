import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ResearchAsset } from '../types/domain';
import { AssetCard } from '../components/AssetCard';

export const Repository: React.FC = () => {
  const [assets, setAssets] = useState<ResearchAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async (query: string) => {
    setLoading(true);
    setError(null);
    let request = supabase
      .from('research_assets')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (query.trim()) {
      request = request.textSearch('fts_vector', query, { type: 'websearch', config: 'english' });
    }

    const { data, error: err } = await request;
    if (err) {
      setError('Search failed — please try again.');
    } else {
      setAssets((data ?? []) as ResearchAsset[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets('');
  }, []);

  return (
    <section>
      <h2>NCPOR Scientific Repository</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchAssets(searchQuery);
        }}
        style={{ display: 'flex', gap: 8, marginBottom: 20 }}
      >
        <input
          type="text"
          aria-label="Search research reports, datasets, media"
          placeholder="Search research reports, datasets, media…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
      {loading ? (
        <p>Loading datasets…</p>
      ) : assets.length === 0 ? (
        <p>No public assets match that search yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </section>
  );
};
