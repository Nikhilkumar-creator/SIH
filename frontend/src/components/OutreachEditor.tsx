import React, { useState } from 'react';
import type { GeneratedContent, ContentStatus } from '../types/domain';
import {
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  Tag,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface Props {
  item: GeneratedContent;
  nextLabel?: ContentStatus;
  canPublish?: boolean;
  onAdvance: () => void;
  onReject: () => void;
  onSave?: (updatedItem: Partial<GeneratedContent>) => void;
}

export const OutreachEditor: React.FC<Props> = ({
  item,
  nextLabel,
  canPublish = true,
  onAdvance,
  onReject,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title || '');
  const [body, setBody] = useState(item.body);
  const [tagsInput, setTagsInput] = useState(item.tags.join(', '));

  const handleSave = () => {
    const updatedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (onSave) {
      onSave({
        title,
        body,
        tags: updatedTags,
      });
    }
    setIsEditing(false);
  };

  const stages: ContentStatus[] = ['draft', 'peer_review', 'admin_approved', 'published'];
  const currentStageIndex = stages.indexOf(item.status);

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'peer_review':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'admin_approved':
        return 'bg-sky-50 text-sky-700 border-sky-300';
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-300';
    }
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 mb-4">
      {/* Header & Pipeline Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
              {item.content_type.replace('_', ' ')}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${getStatusColor(
                item.status
              )}`}
            >
              {item.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
            </span>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article / Summary Title"
              className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:border-cyan-500"
            />
          ) : (
            <h3 className="text-base font-bold text-slate-900">{title || item.content_type}</h3>
          )}
        </div>

        {/* Workflow Progression Stepper */}
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 text-xs">
          {stages.map((stage, idx) => {
            const isDone = currentStageIndex >= idx;
            const isCurrent = item.status === stage;
            return (
              <React.Fragment key={stage}>
                <span
                  className={`px-2 py-1 rounded font-medium capitalize text-[11px] ${
                    isCurrent
                      ? 'bg-cyan-600 text-white font-bold'
                      : isDone
                      ? 'text-cyan-800 bg-cyan-100'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.replace('_', ' ')}
                </span>
                {idx < stages.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Body content */}
      <div className="mb-4">
        {isEditing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full p-3 text-sm text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono leading-relaxed"
          />
        ) : (
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-100">
            {body}
          </p>
        )}
      </div>

      {/* Tags section */}
      <div className="mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Comma separated tags e.g. Glaciology, Antarctica, GPR"
              className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:border-cyan-500"
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {item.tags.length > 0 ? (
              item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-medium"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No tags assigned</span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Edits
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Content
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.status !== 'rejected' && (
            <button
              onClick={onReject}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject Draft
            </button>
          )}

          {nextLabel && (
            <button
              onClick={onAdvance}
              disabled={nextLabel === 'published' && !canPublish}
              className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                nextLabel === 'published'
                  ? canPublish
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
              title={
                nextLabel === 'published' && !canPublish
                  ? 'Admin privileges required to officially publish outreach articles'
                  : `Advance to ${nextLabel.replace('_', ' ')}`
              }
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Advance to {nextLabel.replace('_', ' ').toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
