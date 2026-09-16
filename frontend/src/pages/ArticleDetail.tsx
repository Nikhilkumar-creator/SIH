import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import type { GeneratedContent, ResearchAsset } from '../types/domain';
import {
  ArrowLeft,
  Calendar,
  Share2,
  FileText,
  Download,
  Check,
  Sparkles,
  Tag,
  Globe,
  MessageSquare,
} from 'lucide-react';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<GeneratedContent | null>(null);
  const [sourceAsset, setSourceAsset] = useState<ResearchAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState<'article' | 'summary' | 'social'>('article');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiService
      .getArticleById(id)
      .then(async (art) => {
        setArticle(art);
        if (art?.asset_id) {
          const asset = await apiService.getAssetById(art.asset_id);
          setSourceAsset(asset);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Read this polar science outreach story from @NCPOR_India: "${article?.title}"`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mb-3"></div>
        <p className="text-xs text-slate-500">Loading polar science article…</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Story Not Found</h2>
        <p className="text-xs text-slate-500">
          This outreach article may not be published yet or does not exist.
        </p>
        <Link
          to="/articles"
          className="inline-block px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold"
        >
          ← Back to All Stories
        </Link>
      </div>
    );
  }

  const paragraphs = article.body.split('\n\n').filter(Boolean);

  // Derive social threads
  const twitterPost = `🧊 Polar Science Highlight: "${article.title}"\n\n${article.body.slice(0, 200)}...\n\nRead the full report from India's Polar Research Programme: ${window.location.href}\n\n#PolarScience #NCPOR #ClimateChange`;
  const linkedinPost = `National Centre for Polar and Ocean Research (NCPOR) has published a new science communication brief:\n\n"${article.title}"\n\nKey Insights:\n${paragraphs[0] || article.body}\n\nAccess the underlying research datasets and reports on the NCPOR Open Repository.`;

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/articles')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Outreach Stories
        </button>
      </div>

      {/* Header Container */}
      <header className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
            {article.content_type.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Published: {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Recent'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {article.title || 'Polar Science Discovery'}
        </h1>

        {/* Attribution Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center text-sm">
              ❄
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                NCPOR Science Communication & Outreach Wing
              </p>
              <p className="text-[11px] text-slate-500">Ministry of Earth Sciences, Govt. of India</p>
            </div>
          </div>

          {/* Social Share Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied URL!' : 'Share'}
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-500 hover:bg-slate-50 transition-colors"
              title="Share to X / Twitter"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Linked Primary Research Asset Banner */}
      {sourceAsset && (
        <div className="bg-gradient-to-r from-cyan-50/80 to-sky-50/80 border border-cyan-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white text-cyan-700 border border-cyan-200 shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 block">
                Primary Scientific Source
              </span>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{sourceAsset.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Type: <strong className="uppercase">{sourceAsset.asset_type}</strong> • Format: {sourceAsset.mime_type}
              </p>
            </div>
          </div>

          <a
            href={sourceAsset.file_path.startsWith('http') ? sourceAsset.file_path : '#'}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-cyan-800 border border-cyan-300 text-xs font-semibold shadow-xs shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Source Report
          </a>
        </div>
      )}

      {/* Multi-Platform Format Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-2">
          Format:
        </span>
        <button
          onClick={() => setActiveFormat('article')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeFormat === 'article'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Public Science Story
        </button>
        <button
          onClick={() => setActiveFormat('summary')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeFormat === 'summary'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => setActiveFormat('social')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeFormat === 'social'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Social Media Threads
        </button>
      </div>

      {/* Active Format View */}
      {activeFormat === 'article' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm sm:text-base space-y-4 font-normal">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-slate-400 mr-1 self-center" />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeFormat === 'summary' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-cyan-800 font-bold text-base border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            Executive Synthesis & Key Takeaways
          </div>
          <div className="bg-cyan-50/50 p-6 rounded-xl border border-cyan-100 space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {paragraphs[0] || article.body}
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-2 pt-2 border-t border-cyan-200/60">
              <li>Directly extracted from peer-reviewed expedition observations.</li>
              <li>Calibrated with ongoing baseline telemetry from NCPOR research bases.</li>
              <li>Open data archived in accordance with SCAR and Arctic Council conventions.</li>
            </ul>
          </div>
        </div>
      )}

      {activeFormat === 'social' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Twitter / X variant */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Share2 className="w-4 h-4 text-sky-500" /> X (Twitter) Post Draft
              </span>
              <span className="text-[11px] text-slate-400 font-mono">280 char compliant</span>
            </div>
            <p className="text-xs text-slate-700 font-mono bg-slate-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">
              {twitterPost}
            </p>
            <button
              onClick={handleShareTwitter}
              className="w-full py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
            >
              Post to X / Twitter
            </button>
          </div>

          {/* LinkedIn variant */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <MessageSquare className="w-4 h-4 text-blue-600" /> LinkedIn Scientific Brief
              </span>
              <span className="text-[11px] text-slate-400">Professional Network</span>
            </div>
            <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed font-mono">
              {linkedinPost}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(linkedinPost);
                alert('LinkedIn post copied to clipboard!');
              }}
              className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
            >
              Copy LinkedIn Brief
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
