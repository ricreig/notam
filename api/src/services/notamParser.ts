import { ParsedNotam, NotamStatus } from '../types';

const Q_LINE_REGEX = /Q\)\s*([A-Z]{4})\/([A-Z]{5})\/([A-Z]{1,2})\/([A-Z]{1,4})\/([A-Z]{1,2})\/([0-9]{3})\/([0-9]{3})\/([0-9]{4}[NS][0-9]{5}[EW][0-9]{3})/;
const SECTION_REGEX = /([A-G])\)\s*([^A-G\)]*)(?=\s+[A-G]\)|$)/g;
const NUMBER_REGEX = /\(([A-Z]\d{4}\/\d{2})\s+NOTAM[NC]|NOTAM[NRC]\s*([A-Z]\d{4}\/\d{2})/;
const ICAO_REGEX = /\b([A-Z]{4})\b/;

function decodeCoordinateBlock(block: string) {
  const match = block.match(/(\d{2})(\d{2})([NS])(\d{3})(\d{2})([EW])(\d{3})/);
  if (!match) return null;
  const [, latDeg, latMin, latHem, lonDeg, lonMin, lonHem, radius] = match;
  const lat = Number(latDeg) + Number(latMin) / 60;
  const lon = Number(lonDeg) + Number(lonMin) / 60;
  return {
    lat: latHem === 'S' ? -lat : lat,
    lon: lonHem === 'W' ? -lon : lon,
    radiusNm: Number(radius),
  };
}

function resolveStatus(sectionE: string, startAt: string | null, endAt: string | null): NotamStatus {
  const upperText = sectionE.toUpperCase();
  if (upperText.includes('PERM')) {
    return 'PERMANENT';
  }
  if (upperText.includes('EST') || upperText.includes('ESTIMADO')) {
    return 'UPCOMING';
  }
  if (startAt && endAt) {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (now >= start && now <= end) {
      return 'ACTIVE';
    }
    if (now < start) {
      return 'UPCOMING';
    }
    if (now > end) {
      return 'EXPIRED';
    }
  }
  return 'INFO' as NotamStatus;
}

export function parseNotam(raw: string): ParsedNotam {
  const qLine = raw.match(Q_LINE_REGEX);
  const sections = Array.from(raw.matchAll(SECTION_REGEX));
  const numberMatch = raw.match(NUMBER_REGEX);
  const notamNumber = numberMatch ? (numberMatch[1] ?? numberMatch[2]) : null;

  const entries = new Map<string, string>();
  sections.forEach(([, key, value]) => {
    entries.set(key, value.trim().replace(/\s+/g, ' '));
  });

  const aSection = entries.get('A') ?? '';
  const bSection = entries.get('B') ?? '';
  const cSection = entries.get('C') ?? '';
  const dSection = entries.get('D') ?? '';
  const eSection = entries.get('E') ?? raw.trim();
  const fSection = entries.get('F') ?? '';
  const gSection = entries.get('G') ?? '';

  const startIso = bSection ? formatDateGroup(bSection) : null;
  const endIso = cSection ? formatDateGroup(cSection) : null;
  const coords = qLine ? decodeCoordinateBlock(qLine[8]) : null;

  const parsed: ParsedNotam = {
    icao: (aSection.match(ICAO_REGEX)?.[1] ?? '').trim(),
    number: notamNumber ?? 'UNKNOWN',
    qLine: qLine ? qLine[0].replace('Q) ', '') : null,
    fir: qLine ? qLine[1] : null,
    traffic: qLine ? qLine[2].slice(0, 2) : null,
    purpose: qLine ? qLine[3] : null,
    scope: qLine ? qLine[4] : null,
    lowerLimitFt: qLine ? Number(qLine[6]) * 100 : extractAltitude(fSection),
    upperLimitFt: qLine ? Number(qLine[7]) * 100 : extractAltitude(gSection),
    coords,
    startAt: startIso,
    endAt: endIso,
    schedule: dSection || null,
    subject: extractSubject(eSection),
    condition: extractCondition(eSection),
    modifier: extractModifier(eSection),
    text: eSection,
    references: extractReferences(eSection),
    status: resolveStatus(eSection, startIso, endIso),
    estimated: /EST/.test(bSection) || /EST/.test(cSection) || /EST/.test(eSection),
    permanent: /PERM/.test(eSection.toUpperCase()),
  };

  return parsed;
}

function formatDateGroup(group: string): string | null {
  const clean = group.trim();
  if (!clean) return null;
  if (clean.toUpperCase() === 'PERM' || clean.toUpperCase().includes('PERM')) return null;
  const match = clean.match(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const iso = `20${year}-${month}-${day}T${hour}:${minute}:00Z`;
  return iso;
}

function extractAltitude(section: string): number | null {
  const numeric = section.replace(/[^0-9]/g, '');
  if (!numeric) return null;
  return Number(numeric);
}

function extractSubject(text: string): string | null {
  const subjectMatch = text.match(/^(.*?)\b(UNSERVICEABLE|CLOSED|RESTRICTED|WORK IN PROGRESS|OPERATIVE)\b/i);
  if (subjectMatch) {
    return subjectMatch[1].trim();
  }
  const pieces = text.split('.');
  return pieces.length > 0 ? pieces[0].trim() : null;
}

function extractCondition(text: string): string | null {
  const conditionMatch = text.match(/\b(UNSERVICEABLE|CLOSED|RESTRICTED|LIMITED|AVAILABLE WITH RESTRICTIONS|WORK IN PROGRESS)\b/i);
  return conditionMatch ? conditionMatch[0].toUpperCase() : null;
}

function extractModifier(text: string): string | null {
  const modifierMatch = text.match(/\b(DAILY|EXC|EXCEPT|MON-FRI|SAT-SUN|H24|HOURS|SUNRISE|SUNSET|EST)\b/i);
  return modifierMatch ? modifierMatch[0].toUpperCase() : null;
}

function extractReferences(text: string): string[] {
  const refs: string[] = [];
  const regex = /(NOTAM[A-Z]?\d{4}\/\d{2})/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    refs.push(match[1]);
  }
  return refs;
}
