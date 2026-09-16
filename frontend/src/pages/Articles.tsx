import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../lib/apiService';
import type { GeneratedContent } from '../types/domain';
import {
  Search,
  Tag,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Articles: React.FC = () => {
  const [articles, setArticles] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    apiService
      .getArticles()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique tags
  const allTags = ['All', ...Array.from(new Set(articles.flatMap((a) => a.tags)))];

  const filteredArticles = articles.filter((article) => {
    const matchesTag = selectedTag === 'All' || article.tags.includes(selectedTag);
    const matchesQuery =
      !searchQuery.trim() ||
      (article.title && article.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      article.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesQuery;
  });

  const getReadingTime = (text: string) => {
    const words = text.split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI-Assisted Science Communication
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Polar Outreach Articles & Stories
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Discover accessible public science articles, executive summaries, and research breakthroughs
            synthesized directly from India's polar expedition reports and deep-ice investigations.
          </p>
        </div>
      </div>

      {/* Search and Tag Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stories by science discipline, keyword, or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Topics:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mb-3"></div>
          <p className="text-xs text-slate-500">Loading published outreach stories…</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <p className="text-2xl">📖</p>
          <h3 className="text-base font-bold text-slate-800">No stories match this filter</h3>
          <p className="text-xs text-slate-500">
            Try choosing a different topic or resetting your search term.
          </p>
          <button
            onClick={() => {
              setSelectedTag('All');
              setSearchQuery('');
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-cyan-400 transition-all duration-200 group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-800">
                    {article.content_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getReadingTime(article.body)}
                  </span>
                </div>

                {/* Title */}
                <Link to={`/articles/${article.id}`}>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-snug mb-3 line-clamp-2">
                    {article.title || 'Polar Research Discovery'}
                  </h2>
                </Link>

                {/* Excerpt */}
                <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed mb-4">
                  {article.body}
                </p>
              </div>

              {/* Tags & Action */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString()
                      : 'Published'}
                  </span>
                  <Link
                    to={`/articles/${article.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 group-hover:text-cyan-800"
                  >
                    Read Story <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
