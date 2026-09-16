import React, { useEffect, useState } from 'react';
import { apiService } from '../lib/apiService';
import { useAuth } from '../lib/AuthProvider';
import type {
  ContentStatus,
  GeneratedContent,
  ResearchAsset,
  Expedition,
  AuditLog,
} from '../types/domain';
import { OutreachEditor } from '../components/OutreachEditor';
import {
  ShieldCheck,
  Layers,
  Database,
  Compass,
  FileCheck2,
  Activity,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
} from 'lucide-react';

const NEXT_STATUS: Record<ContentStatus, ContentStatus | null> = {
  draft: 'peer_review',
  peer_review: 'admin_approved',
  admin_approved: 'published',
  published: null,
  rejected: null,
};

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'assets' | 'expeditions' | 'audit' | 'health'>('queue');

  // Review Queue State
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [selectedQueueStatus, setSelectedQueueStatus] = useState<ContentStatus | 'all'>('all');
  const [queueLoading, setQueueLoading] = useState(true);

  // Asset Management State
  const [assets, setAssets] = useState<ResearchAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Expeditions State
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // System Health State
  const [health, setHealth] = useState<{
    backendOnline: boolean;
    supabaseOnline: boolean;
    ollamaReachable: boolean;
    activeModel: string;
  }>({
    backendOnline: false,
    supabaseOnline: false,
    ollamaReachable: false,
    activeModel: 'llama3',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadQueue = async () => {
    setQueueLoading(true);
    try {
      const data = await apiService.getContentQueue(selectedQueueStatus);
      setItems(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not load review queue.' });
    } finally {
      setQueueLoading(false);
    }
  };

  const loadAssets = async () => {
    setAssetsLoading(true);
    try {
      const data = await apiService.getAssets({ onlyPublic: false });
      setAssets(data);
    } finally {
      setAssetsLoading(false);
    }
  };

  const loadExpeditions = async () => {
    const data = await apiService.getExpeditions();
    setExpeditions(data);
  };

  const loadAuditLogs = async () => {
    const data = await apiService.getAuditLogs();
    setAuditLogs(data);
  };

  const loadHealth = async () => {
    const data = await apiService.getSystemHealth();
    setHealth(data);
  };

  useEffect(() => {
    loadQueue();
    loadAssets();
    loadExpeditions();
    loadAuditLogs();
    loadHealth();
  }, []);

  useEffect(() => {
    loadQueue();
  }, [selectedQueueStatus]);

  const advanceStatus = async (item: GeneratedContent) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    if (next === 'published' && profile?.role !== 'admin') {
      setMessage({
        type: 'error',
        text: 'Only users with the Admin role are authorized to publish content.',
      });
      return;
    }

    try {
      const success = await apiService.updateContentStatus(item.id, next, profile?.id);
      if (success) {
        setMessage({
          type: 'success',
          text: `Article advanced to ${next.replace('_', ' ').toUpperCase()}`,
        });
        loadQueue();
        loadAuditLogs();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Status transition failed.' });
    }
  };

  const rejectStatus = async (item: GeneratedContent) => {
    try {
      const success = await apiService.updateContentStatus(item.id, 'rejected', profile?.id);
      if (success) {
        setMessage({ type: 'success', text: 'Content draft rejected.' });
        loadQueue();
        loadAuditLogs();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to reject item.' });
    }
  };

  const handleSaveContent = async (id: string, updates: Partial<GeneratedContent>) => {
    try {
      await apiService.updateContent(id, updates);
      setMessage({ type: 'success', text: 'Content edits saved successfully.' });
      loadQueue();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save content edits.' });
    }
  };

  const toggleAssetPublic = async (asset: ResearchAsset) => {
    try {
      await apiService.updateAsset(asset.id, { is_public: !asset.is_public });
      setMessage({
        type: 'success',
        text: `Asset visibility set to ${!asset.is_public ? 'Public' : 'Internal Only'}.`,
      });
      loadAssets();
      loadAuditLogs();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update asset visibility.' });
    }
  };

  const toggleAssetImmutable = async (asset: ResearchAsset) => {
    try {
      await apiService.updateAsset(asset.id, { is_immutable: !asset.is_immutable });
      setMessage({
        type: 'success',
        text: `Asset immutability ${!asset.is_immutable ? 'locked' : 'unlocked'}.`,
      });
      loadAssets();
      loadAuditLogs();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update asset immutability.' });
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this research asset?')) return;
    try {
      await apiService.deleteAsset(id);
      setMessage({ type: 'success', text: 'Asset removed from repository.' });
      loadAssets();
      loadAuditLogs();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete asset.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Operations & Governance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-cyan-600" /> Editorial & Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{profile?.full_name}</strong> (
            <span className="text-cyan-700 font-semibold capitalize">{profile?.role}</span>). Manage the
            editorial workflow, scientific assets, and audit trails.
          </p>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Editorial Queue ({items.filter((i) => i.status !== 'published').length})
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Asset Management ({assets.length})
        </button>

        <button
          onClick={() => setActiveTab('expeditions')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'expeditions'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          Expeditions ({expeditions.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Audit Trail ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'health'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          System Health
        </button>
      </div>

      {/* Tab 1: Editorial Review Queue */}
      {activeTab === 'queue' && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Stage:</span>
              {(['all', 'draft', 'peer_review', 'admin_approved', 'published', 'rejected'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedQueueStatus(st)}
                    className={`px-3 py-1 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                      selectedQueueStatus === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            <button
              onClick={loadQueue}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              title="Refresh Review Queue"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {queueLoading ? (
            <p className="text-xs text-slate-500 py-12 text-center">Loading queue items…</p>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No content items pending review in this stage.
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <OutreachEditor
                  key={item.id}
                  item={item}
                  nextLabel={NEXT_STATUS[item.status] ?? undefined}
                  canPublish={profile?.role === 'admin'}
                  onAdvance={() => advanceStatus(item)}
                  onReject={() => rejectStatus(item)}
                  onSave={(updates) => handleSaveContent(item.id, updates)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Asset Governance */}
      {activeTab === 'assets' && (
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Registered Scientific Assets ({assets.length})
            </h3>
            <button
              onClick={loadAssets}
              className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold"
            >
              Refresh
            </button>
          </div>

          {assetsLoading ? (
            <p className="text-xs text-slate-500 py-12 text-center">Loading assets...</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Visibility</th>
                  <th className="px-5 py-3">Immutability</th>
                  <th className="px-5 py-3">Uploaded</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 max-w-xs truncate font-semibold text-slate-900">
                      {asset.title}
                    </td>
                    <td className="px-5 py-3.5 uppercase font-mono text-[10px]">
                      {asset.asset_type}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleAssetPublic(asset)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                          asset.is_public
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {asset.is_public ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {asset.is_public ? 'Public' : 'Private'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleAssetImmutable(asset)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                          asset.is_immutable
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        title="Click to toggle immutable lock"
                      >
                        {asset.is_immutable ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                        {asset.is_immutable ? 'Immutable' : 'Mutable'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>
      )}

      {/* Tab 3: Expeditions */}
      {activeTab === 'expeditions' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active & Archived Polar Expeditions
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {expeditions.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{exp.title}</h4>
                  <p className="text-slate-500">
                    Region: <strong className="text-cyan-700">{exp.region}</strong> • Dates:{' '}
                    {exp.start_date} {exp.end_date ? `to ${exp.end_date}` : '(Ongoing)'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800">
                  {exp.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'audit' && (
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              System Audit Log ({auditLogs.length})
            </h3>
            <span className="text-[11px] text-slate-400">Captures RLS and AI generation operations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Entity Target</th>
                  <th className="px-5 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-bold text-cyan-800">{log.action}</td>
                    <td className="px-5 py-3 font-sans">{log.actor_name || log.actor_id || 'System'}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {log.entity} / {log.entity_id ? log.entity_id.slice(0, 12) + '…' : 'root'}
                    </td>
                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 5: System Health & AI Engine */}
      {activeTab === 'health' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              FastAPI Ingestion Engine
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  health.backendOnline ? 'bg-emerald-500' : 'bg-cyan-500 animate-pulse'
                }`}
              ></span>
              <span className="text-lg font-bold text-slate-900">
                {health.backendOnline ? 'Online (Port 8000)' : 'Local Resilient Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Handles multipart PDF extraction, structured Ollama inference, and chunk vector embeddings.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Database & RLS Engine
            </span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-lg font-bold text-slate-900">
                {health.supabaseOnline ? 'Live Supabase Cloud' : 'Resilient In-Memory Store'}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforces Row Level Security (RLS) policies on profiles, assets, vectors, and outreach drafts.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Inference Model
            </span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span className="text-lg font-bold text-slate-900 font-mono text-sm">
                {health.activeModel}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Local Ollama model generating summaries, tags, and articles, with nomic-embed-text vectors.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
