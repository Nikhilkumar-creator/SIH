import React from 'react';
import type { UserRole } from '../types/domain';

interface Props {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<Props> = ({ role, size = 'sm' }) => {
  const styles: Record<UserRole, { bg: string; text: string; border: string; label: string }> = {
    admin: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      label: 'Admin',
    },
    editor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Editor',
    },
    researcher: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      border: 'border-cyan-200',
      label: 'Researcher',
    },
    visitor: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'Visitor',
    },
  };

  const current = styles[role] || styles.visitor;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-2.5 py-1 text-sm font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {current.label}
    </span>
  );
};
