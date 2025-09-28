import type { Notam } from '../types/notam';

function cleanText(value?: string | null) {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
}

export function extractNotamSummary(notam: Pick<Notam, 'condition' | 'subject' | 'text'>) {
  if (notam.condition) return cleanText(notam.condition);
  if (notam.subject) return cleanText(notam.subject);
  const match = /E\)([\s\S]*)/i.exec(notam.text ?? '');
  if (match && match[1]) {
    return cleanText(match[1]);
  }
  return cleanText(notam.text ?? '');
}

export function getNotamSummarySnippet(notam: Pick<Notam, 'condition' | 'subject' | 'text'>, maxLength = 200) {
  const summary = extractNotamSummary(notam);
  if (summary.length <= maxLength) return summary;
  return `${summary.slice(0, maxLength).trimEnd()}…`;
}
