/**
 * Design tokens for Lineage AI.
 * Single source of truth for spacing, typography, and semantic colors.
 * Use these in Tailwind classes via the semantic names below.
 */

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const typography = {
  // Font families
  fontDisplay: '"Clash Display", "Inter", system-ui, sans-serif',
  fontBody: '"Inter", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", "Fira Code", monospace',

  // Scale
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px

  // Weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const colors = {
  // Brand
  'brand-primary': '#4f46e5',       // indigo-600
  'brand-primary-hover': '#4338ca', // indigo-700
  'brand-primary-light': '#eef2ff', // indigo-50
  'brand-primary-text': '#3730a3',  // indigo-800

  // Status
  'status-success': '#059669',      // emerald-600
  'status-success-bg': '#d1fae5',   // emerald-100
  'status-warning': '#d97706',      // amber-600
  'status-warning-bg': '#fef3c7',   // amber-100
  'status-danger': '#dc2626',       // red-600
  'status-danger-bg': '#fee2e2',    // red-100
  'status-info': '#2563eb',         // blue-600
  'status-info-bg': '#dbeafe',      // blue-100

  // Neutral
  'surface': '#ffffff',
  'surface-secondary': '#f9fafb',
  'surface-tertiary': '#f3f4f6',
  'border': '#e5e7eb',
  'border-strong': '#d1d5db',
  'text-primary': '#111827',
  'text-secondary': '#6b7280',
  'text-tertiary': '#9ca3af',

  // Dark mode equivalents (applied via dark: prefix)
  'dark-surface': '#0f172a',
  'dark-surface-secondary': '#1e293b',
  'dark-surface-tertiary': '#334155',
  'dark-border': '#334155',
  'dark-text-primary': '#f1f5f9',
  'dark-text-secondary': '#94a3b8',
} as const;

// Tailwind class helpers for consistent usage
export const tw = {
  card: 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700',
  cardHover: 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-sm transition-all',
  input: 'w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  btnPrimary: 'bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
  btnSecondary: 'border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-medium hover:border-gray-400 dark:hover:border-slate-500 transition-colors',
  label: 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5',
  pageTitle: 'text-2xl font-bold text-gray-900 dark:text-slate-100',
  sectionTitle: 'font-semibold text-gray-900 dark:text-slate-100',
  mutedText: 'text-gray-500 dark:text-slate-400',
  badge: (color: 'green' | 'red' | 'amber' | 'blue' | 'gray') => {
    const map = {
      green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      gray: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
    };
    return `text-xs px-2 py-0.5 rounded-full font-medium ${map[color]}`;
  },
} as const;
