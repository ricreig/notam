import { addMinutes, differenceInHours, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { SeverityBreakdown } from '../types';

export interface ScoringInput {
  category?: string | null;
  element?: string | null;
  subject?: string | null;
  condition?: string | null;
  modifier?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  services?: string[];
  baseAirport?: boolean;
  status?: string;
}

const CONDITION_BASE: Record<string, number> = {
  UNSERVICEABLE: 80,
  RESTRICTED: 60,
  CAUTION: 40,
  INFO: 20,
  CLOSED: 85,
};

const ELEMENT_BASE: Record<string, number> = {
  'AGA-M-MR': 20,
  'AGA-M-MG': 15,
  'AGA-M-MT': 14,
  'AGA-M-MS': 12,
  'AGA-M-MD': 10,
  'AGA-F-FC': 18,
  'AGA-F-FD': 16,
  'AGA-F-FF': 14,
  'AGA-F-FI': 14,
  'AGA-F-FM': 12,
  'AGA-F-FP': 10,
  'AGA-F-FS': 12,
  'ATM-S-ST': 18,
  'ATM-S-SP': 16,
  'ATM-S-SC': 14,
  'ATM-S-SE': 12,
  'ATM-S-SO': 12,
  'ATM-S-SB': 10,
  'ATM-P-OE': 12,
  'CNS-I-IS': 18,
  'CNS-I-IT': 20,
  'CNS-I-II': 12,
  'CNS-G-GA': 12,
  'CNS-G-GW': 16,
  'CNS-N-NS': 10,
  'ATM-A-AF': 10,
  'ATM-A-AC': 10,
  'ATM-A-AN': 12,
  'ATM-A-AL': 12,
  'ATM-A-AO': 8,
  'W-W-WU': 12,
  'W-W-WP': 10,
  'W-W-WW': 18,
};

const KEYWORD_BONUS: Record<string, number> = {
  RWY: 25,
  ILS: 20,
  RVR: 15,
  LGT: 10,
  TWY: 10,
  APRON: 8,
  TAXIWAY: 12,
  CLOSURE: 15,
  CLOSED: 15,
  PARTIALLY: 10,
  SERVICE: 8,
};

export function computeScore(input: ScoringInput): SeverityBreakdown {
  const reasons: string[] = [];
  let severity = 20;
  let relevance = 10;

  if (input.status === 'PERMANENT') {
    severity += 15;
    reasons.push('Declarado permanente');
  }

  if (input.element) {
    severity += ELEMENT_BASE[input.element] ?? 0;
    relevance += 8;
  }

  if (input.condition) {
    const key = input.condition.toUpperCase();
    severity += CONDITION_BASE[key] ?? 0;
    relevance += 5;
  }

  const textTokens = [input.subject, input.condition, input.modifier]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  Object.entries(KEYWORD_BONUS).forEach(([keyword, bonus]) => {
    if (textTokens.includes(keyword)) {
      severity += bonus;
      relevance += Math.round(bonus / 2);
      reasons.push(`Palabra clave ${keyword}`);
    }
  });

  if (input.services && input.services.some((service) => ['ATS', 'COM', 'NAV', 'SUR'].includes(service))) {
    severity += 15;
    relevance += 10;
    reasons.push('Impacta servicios ATS/COM/NAV/SUR');
  }

  if (input.baseAirport) {
    severity += 10;
    relevance += 15;
    reasons.push('Aeródromo base');
  }

  const now = new Date();
  if (input.startAt && input.endAt) {
    const start = new Date(input.startAt);
    const end = new Date(input.endAt);
    const windowStart = now;
    const windowEnd = addMinutes(now, 60 * 24);

    if (isWithinInterval(now, { start, end })) {
      severity += 20;
      relevance += 20;
      reasons.push('Vigente actualmente');
    } else if (
      isAfter(start, now) &&
      isBefore(start, windowEnd)
    ) {
      severity += 10;
      relevance += 18;
      reasons.push('Inicia dentro de 24 horas');
    }

    const durationHours = Math.max(1, differenceInHours(end, start));
    if (durationHours > 24) {
      relevance += 5;
      reasons.push('Duración superior a 24 horas');
    }
  }

  if (input.condition?.toUpperCase().includes('CLOSED') || input.condition?.toUpperCase().includes('CLOSE')) {
    severity += 20;
    relevance += 12;
    reasons.push('Cierre total/parcial');
  }

  severity = Math.min(100, severity);
  relevance = Math.min(100, relevance);

  return { severity, relevance, reasons };
}
