import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import type { ResearchAsset, PolarRegion, AssetType, Expedition } from '../types/domain';
import { AssetCard } from '../components/AssetCard';
import { AssetDetailModal } from '../components/AssetDetailModal';
import {
  Search,
  Grid,
  List,
  Upload,
  RotateCcw,
  Lock,
} from 'lucide-react';

export const Repository: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [assets, setAssets] = useState<ResearchAsset[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedRegion, setSelectedRegion] = useState<PolarRegion | 'All'>(
    (searchParams.get('region') as PolarRegion) || 'All'
  );
  const [selectedType, setSelectedType] = useState<AssetType | 'All'>(
    (searchParams.get('type') as AssetType) || 'All'
  );
  const [selectedExpedition, setSelectedExpedition] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'size'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal inspection
  const [inspectAsset, setInspectAsset] = useState<ResearchAsset | null>(null);

  useEffect(() => {
    apiService.getExpeditions().then(setExpeditions).catch(() => {});
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAssets({
        query,
        region: selectedRegion,
        assetType: selectedType,
        expeditionId: selectedExpedition,
        onlyPublic: true,
      });

      // Sort
      const sorted = [...data].sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'size') {
          return (b.file_size_bytes || 0) - (a.file_size_bytes || 0);
        }
        return 0;
      });

      setAssets(sorted);
    } catch (err) {
      console.error('Fetch assets error:', err);
      setError('Could not connect to scientific repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [selectedRegion, selectedType, selectedExpedition, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAssets();
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedRegion('All');
    setSelectedType('All');
    setSelectedExpedition('All');
    setSortBy('newest');
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            NCPOR Polar Data Centre
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scientific Data & Asset Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Explore peer-reviewed expedition reports, geophysical datasets, atmospheric time series, and
            polar imagery curated under India’s polar research mandate.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          Ingest New Research Asset
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search research reports, datasets, media"
              placeholder="Search by keywords, parameters, sensor type, expedition..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as PolarRegion | 'All')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium bg-white focus:ring-cyan-500"
              >
                <option value="All">All Regions</option>
                <option value="Antarctic">Antarctica</option>
                <option value="Arctic">Arctic</option>
                <option value="Himalayas">Himalayas</option>
                <option value="Southern Ocean">Southern Ocean</option>
              </select>
            </div>

            {/* Asset Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as AssetType | 'All')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium bg-white focus:ring-cyan-500"
              >
                <option value="All">All Formats</option>
                <option value="report">Reports</option>
                <option value="dataset">Datasets</option>
                <option value="publication">Publications</option>
                <option value="photo">Photos</option>
                <option value="video">Videos</option>
              </select>
            </div>

            {/* Expedition Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Expedition:</span>
              <select
                value={selectedExpedition}
                onChange={(e) => setSelectedExpedition(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium bg-white focus:ring-cyan-500 max-w-[160px] truncate"
              >
                <option value="All">All Expeditions</option>
                {expeditions.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium bg-white focus:ring-cyan-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="size">File Size</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* Asset Display (Grid vs Table) */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mb-3"></div>
          <p className="text-xs text-slate-500">Querying polar repository metadata…</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching assets found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No scientific reports, datasets, or media matched your search parameters. Try clearing your
            keyword or adjusting region/format filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {assets.length} scientific assets</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Asset Title & Format</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Size</th>
                  <th className="px-5 py-3.5">Uploaded</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 max-w-md">
                      <button
                        onClick={() => setInspectAsset(asset)}
                        className="font-bold text-slate-900 hover:text-cyan-600 text-left line-clamp-1 cursor-pointer"
                      >
                        {asset.title}
                      </button>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {asset.description || 'No description available'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded font-semibold uppercase text-[10px] bg-slate-100 text-slate-700">
                        {asset.asset_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {formatBytes(asset.file_size_bytes)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {asset.is_immutable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <Lock className="w-3 h-3" /> Immutable
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Public</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setInspectAsset(asset)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium text-cyan-700 hover:bg-cyan-50"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inspectAsset && (
        <AssetDetailModal asset={inspectAsset} onClose={() => setInspectAsset(null)} />
      )}
    </div>
  );
};
