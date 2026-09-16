import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import { useAuth } from '../lib/AuthProvider';
import type { Expedition, AssetType, DocumentProcessingResult } from '../types/domain';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  RefreshCw,
  Share2,
} from 'lucide-react';

export const UploadPage: React.FC = () => {
  const { session, profile } = useAuth();

  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('report');
  const [expeditionId, setExpeditionId] = useState<string>('');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  // Ingestion & AI Generation State
  const [processing, setProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [aiResult, setAiResult] = useState<DocumentProcessingResult | null>(null);
  const [createdAssetId, setCreatedAssetId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getExpeditions().then((data) => {
      setExpeditions(data);
      if (data.length > 0) setExpeditionId(data[0].id);
    });
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (!title) {
        setTitle(dropped.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleSubmitMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setError(null);
    setStep(2);
    handleExecuteIngestion();
  };

  const handleExecuteIngestion = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      setProcessingStage('Storing asset and metadata in scientific repository...');
      const newAsset = await apiService.createAsset({
        title,
        description,
        asset_type: assetType,
        file_path: `uploads/${Date.now()}_${file.name}`,
        file_size_bytes: file.size,
        mime_type: file.type || 'application/octet-stream',
        expedition_id: expeditionId || null,
        uploaded_by: profile?.id,
        is_public: isPublic,
        is_immutable: false,
      });
      setCreatedAssetId(newAsset.id);

      // If document is PDF or Report, trigger AI Ingestion
      if (file.name.toLowerCase().endsWith('.pdf') || assetType === 'report' || assetType === 'publication') {
        setProcessingStage('Extracting scientific text & equations...');
        await new Promise((r) => setTimeout(r, 600));

        setProcessingStage('Running local Llama-3 text generation & structured summary...');
        await new Promise((r) => setTimeout(r, 800));

        setProcessingStage('Computing vector embeddings for semantic search...');
        const result = await apiService.processDocumentWithAI(
          file,
          newAsset.id,
          title,
          session?.access_token
        );
        setAiResult(result);
      }

      setStep(3);
    } catch (err: any) {
      console.error('Ingestion failure:', err);
      setError(err?.message || 'Document processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5 text-cyan-600" />
          NCPOR AI Processing Studio
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Research Document Ingestion & Outreach Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload scientific expedition reports, datasets, and field media. For PDF documents, our local AI
          engine automatically extracts structured abstracts, key tags, and public outreach stories.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-center gap-4 text-xs font-semibold">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            step >= 1 ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[11px]">
            1
          </span>
          Metadata & File
        </div>
        <div className="w-6 h-0.5 bg-slate-200"></div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            step >= 2 ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[11px]">
            2
          </span>
          AI Processing
        </div>
        <div className="w-6 h-0.5 bg-slate-200"></div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            step === 3 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
            3
          </span>
          Review & Outreach
        </div>
      </div>

      {/* Step 1: Form & File Selection */}
      {step === 1 && (
        <form
          onSubmit={handleSubmitMetadata}
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6"
        >
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* File Dropzone */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Select Research Document / Asset File *
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/60 cursor-pointer"
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.csv,.nc,.txt,.jpg,.jpeg,.png,.mp4"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto text-xl shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Custom format'}
                    </p>
                    <span className="inline-block mt-2 text-xs font-semibold text-cyan-600 hover:underline">
                      Click or drop to replace file
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Drag & drop your research file here, or{' '}
                      <span className="text-cyan-600 underline">browse your device</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports PDF reports (AI enabled), CSV datasets, NetCDF, photos, and expedition video (up to 50MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Metadata inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Asset Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subglacial Bedrock Topography & Ice Sheet Velocity in Queen Maud Land"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Asset Classification *
              </label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="report">Scientific Report (PDF)</option>
                <option value="publication">Peer-Reviewed Publication</option>
                <option value="dataset">Numerical Dataset (CSV / NetCDF)</option>
                <option value="photo">Field / Satellite Photography</option>
                <option value="video">Field Survey Video</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Expedition Association
              </label>
              <select
                value={expeditionId}
                onChange={(e) => setExpeditionId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="">-- Unassigned / General Programme --</option>
                {expeditions.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.title} ({exp.region})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Scientific Abstract / Context
              </label>
              <textarea
                rows={3}
                placeholder="Provide a concise summary of the research methodology, observations, or instrumentation used..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Open Science Visibility</span>
                <span className="text-xs text-slate-500">
                  Allow public researchers worldwide to download and cite this asset.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {processing ? 'Processing Document...' : 'Upload & Generate AI Outreach'}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Live Processing View */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-200 border-t-cyan-600 animate-spin"></div>
            <Sparkles className="w-6 h-6 text-cyan-600 absolute inset-0 m-auto animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">AI Outreach Engine at Work</h3>
            <p className="text-xs text-cyan-700 font-mono animate-pulse">{processingStage}</p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> PDF parsed and extracted
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Text chunking and semantic windowing
            </div>
            <div className="flex items-center gap-2 text-cyan-700 font-semibold animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Ollama Llama-3 generating public story
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Result & Outreach Review */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Asset Ingested & AI Outreach Drafts Created!
                </h3>
                <p className="text-xs text-slate-500">
                  Asset ID: <span className="font-mono text-slate-700">{createdAssetId}</span> • Drafts queued
                  for editorial approval.
                </p>
              </div>
            </div>

            <Link
              to="/repository"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              View in Repository →
            </Link>
          </div>

          {aiResult && (
            <div className="space-y-6">
              {/* Generated Summary */}
              <div className="p-5 rounded-xl bg-cyan-50/60 border border-cyan-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Executive Synthesis
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{aiResult.summary}</p>
              </div>

              {/* Tags */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Suggested Scientific Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.suggested_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Generated Outreach Article Draft */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Public Science Article Draft
                </span>
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                  {aiResult.generated_article}
                </div>
              </div>

              {/* Social Snippets */}
              {aiResult.social_x && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" /> Social Media Snippet (X / Twitter)
                  </span>
                  <div className="p-4 rounded-xl bg-slate-900 text-cyan-300 text-xs font-mono">
                    {aiResult.social_x}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                setStep(1);
                setFile(null);
                setTitle('');
                setDescription('');
                setAiResult(null);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              + Ingest Another Document
            </button>

            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs"
              >
                Go to Editorial Queue →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
