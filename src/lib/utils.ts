import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Convert an ALL-CAPS string to Title Case for legibility; leave already-cased
 * titles untouched. (Fixes shouty legacy lesson titles like "HOW INFRASTRUCTURE
 * EVOLVED" → "How Infrastructure Evolved" without harming proper-case titles.)
 */
export function tidyTitle(s: string): string {
  if (!s) return s;
  const letters = s.replace(/[^A-Za-z]/g, '');
  if (!letters || letters !== letters.toUpperCase()) return s; // not all-caps → leave as-is
  const small = new Set(['a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'for', 'or', 'vs', 'via', 'with', 'at', 'by', '&']);
  let wordIndex = 0;
  return s
    .toLowerCase()
    .split(/(\s+)/)
    .map((tok) => {
      if (tok === '' || /^\s+$/.test(tok)) return tok;
      const first = wordIndex === 0;
      wordIndex += 1;
      if (!first && small.has(tok)) return tok;
      return tok.charAt(0).toUpperCase() + tok.slice(1);
    })
    .join('');
}

/**
 * Parse a human duration like "5 min", "1h 30m", "90 mins" to minutes.
 * Returns 0 when it can't be parsed (e.g. null / "N/A").
 */
export function parseDurationMinutes(d?: string | null): number {
  if (!d) return 0;
  const s = d.toLowerCase();
  let mins = 0;
  const h = s.match(/(\d+)\s*h/);
  const m = s.match(/(\d+)\s*m/);
  if (h) mins += parseInt(h[1], 10) * 60;
  if (m) mins += parseInt(m[1], 10);
  if (!h && !m) {
    const n = s.match(/(\d+)/);
    if (n) mins += parseInt(n[1], 10); // bare number → assume minutes
  }
  return mins;
}

/** Format a minute count as "45 min" or "2h 30m". */
export function formatMinutes(total: number): string {
  if (total <= 0) return '';
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function generateCertificateId(): string {
  const prefix = 'LMS';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}
