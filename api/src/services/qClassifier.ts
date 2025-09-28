import {
  getSubjectDefinition,
  qScopeMap,
  qTrafficMap,
  qPurposeMap,
  qServiceLimitSuffixMap,
  qStateMap,
} from '../catalogs/qCatalog';

const COORDINATE_REGEX = /(\d{2})(\d{2})([NS])(\d{3})(\d{2})([EW])(\d{3})/;

interface CoordinateInfo {
  lat: number;
  lon: number;
  radiusNm?: number | null;
}

interface AltitudeInfo {
  raw: string | null;
  valueFt: number | null;
  suffix?: string | null;
  suffixMeaning?: string | null;
}

export interface ParsedQLine {
  fir: string | null;
  rawCode: string | null;
  subjectCode: string | null;
  stateCode: string | null;
  qualifierCode: string | null;
  scope: { code: string; label: string | null } | null;
  traffic: { code: string; label: string | null }[];
  purpose: { code: string; label: string | null }[];
  lowerLimit: AltitudeInfo;
  upperLimit: AltitudeInfo;
  coordinates: CoordinateInfo | null;
}

export interface QClassificationResult {
  categoryId: string | null;
  elementId: string | null;
  subjectCode: string | null;
  subjectLabel: string | null;
  stateCode: string | null;
  stateDescription: string | null;
  scope: { code: string; label: string | null } | null;
  traffic: { code: string; label: string | null }[];
  purpose: { code: string; label: string | null }[];
  lowerLimitFt: number | null;
  upperLimitFt: number | null;
  coordinates: CoordinateInfo | null;
}

function decodeCoordinate(block: string | null | undefined): CoordinateInfo | null {
  if (!block) return null;
  const match = block.match(COORDINATE_REGEX);
  if (!match) return null;
  const [, latDeg, latMin, latHem, lonDeg, lonMin, lonHem, radius] = match;
  const lat = Number(latDeg) + Number(latMin) / 60;
  const lon = Number(lonDeg) + Number(lonMin) / 60;
  return {
    lat: latHem === 'S' ? -lat : lat,
    lon: lonHem === 'W' ? -lon : lon,
    radiusNm: radius ? Number(radius) : null,
  };
}

function parseAltitude(raw: string | null | undefined): AltitudeInfo {
  if (!raw) {
    return { raw: null, valueFt: null };
  }
  const cleaned = raw.trim().toUpperCase();
  if (!cleaned) {
    return { raw: null, valueFt: null };
  }
  if (cleaned === 'SFC') {
    return { raw: cleaned, valueFt: 0 };
  }
  const match = cleaned.match(/^(\d{3})([A-Z])?$/);
  if (!match) {
    return { raw: cleaned, valueFt: null };
  }
  const [, value, suffix] = match;
  const numeric = Number(value) * 100;
  const suffixMeaning = suffix ? qServiceLimitSuffixMap[suffix] ?? null : null;
  return {
    raw: cleaned,
    valueFt: Number.isFinite(numeric) ? numeric : null,
    suffix: suffix ?? undefined,
    suffixMeaning: suffixMeaning ?? undefined,
  };
}

function splitCodes(value: string | null | undefined, dictionary: Record<string, string>) {
  if (!value) return [] as { code: string; label: string | null }[];
  const unique = Array.from(new Set(value.split('').map((char) => char.trim()).filter(Boolean)));
  return unique.map((code) => ({ code, label: dictionary[code] ?? null }));
}

export function parseQLine(qLine: string | null | undefined): ParsedQLine | null {
  if (!qLine) return null;
  const trimmed = qLine.trim();
  if (!trimmed) return null;
  const withoutPrefix = trimmed.startsWith('Q)') ? trimmed.slice(2).trim() : trimmed;
  const parts = withoutPrefix.split('/').map((part) => part.trim());
  if (parts.length < 2) return null;

  const fir = parts[0] || null;
  const rawCode = parts[1] || null;
  if (!rawCode) return null;
  const normalizedCode = rawCode.startsWith('Q') ? rawCode.slice(1) : rawCode;
  const subjectCode = normalizedCode.slice(0, 2) || null;
  const stateCode = normalizedCode.length >= 4 ? normalizedCode.slice(2, 4) : null;
  const qualifierCode = normalizedCode.length > 4 ? normalizedCode.slice(4) : null;

  const trafficRaw = parts[2] || '';
  const purposeRaw = parts[3] || '';
  const scopeRaw = parts[4] || '';

  const lowerLimit = parseAltitude(parts[5] || null);
  const upperLimit = parseAltitude(parts[6] || null);
  const coordinates = decodeCoordinate(parts[7] || null);

  const scopeCode = scopeRaw ? scopeRaw[0] : undefined;
  const scope = scopeCode
    ? { code: scopeCode, label: qScopeMap[scopeCode] ?? null }
    : null;

  return {
    fir,
    rawCode,
    subjectCode,
    stateCode,
    qualifierCode,
    scope,
    traffic: splitCodes(trafficRaw, qTrafficMap),
    purpose: splitCodes(purposeRaw, qPurposeMap),
    lowerLimit,
    upperLimit,
    coordinates,
  };
}

export function classifyQLine(qLine: string | null | undefined): QClassificationResult | null {
  const parsed = parseQLine(qLine);
  if (!parsed) return null;

  const subject = parsed.subjectCode ? getSubjectDefinition(parsed.subjectCode) : undefined;
  const elementId = subject ? `${subject.categoryId}-${subject.code}` : null;
  const stateDescription = parsed.stateCode ? qStateMap.get(parsed.stateCode) ?? null : null;

  return {
    categoryId: subject?.categoryId ?? null,
    elementId,
    subjectCode: parsed.subjectCode,
    subjectLabel: subject?.label ?? null,
    stateCode: parsed.stateCode,
    stateDescription,
    scope: parsed.scope,
    traffic: parsed.traffic,
    purpose: parsed.purpose,
    lowerLimitFt: parsed.lowerLimit.valueFt,
    upperLimitFt: parsed.upperLimit.valueFt,
    coordinates: parsed.coordinates,
  };
}
