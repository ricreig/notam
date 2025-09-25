import fs from 'fs';
import path from 'path';
import { parseNotam } from '../src/services/notamParser';

describe('parseNotam', () => {
  it('parses runway closure NOTAM', () => {
    const raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'mmex_rwy_closure.txt'), 'utf8');
    const parsed = parseNotam(raw);

    expect(parsed.icao).toBe('MMMX');
    expect(parsed.number).toBe('A1234/24');
    expect(parsed.qLine).toContain('MMFR');
    expect(parsed.condition).toBe('CLOSED');
    expect(parsed.subject).toMatch(/RWY 05L/);
    expect(parsed.startAt).toBe('2024-09-01T06:00:00Z');
    expect(parsed.endAt).toBe('2024-09-01T12:00:00Z');
    expect(parsed.coords).toEqual({ lat: 19.05, lon: -99.06666666666666, radiusNm: 5 });
  });

  it('parses lighting outage with EST', () => {
    const raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'mmto_lighting.txt'), 'utf8');
    const parsed = parseNotam(raw);

    expect(parsed.estimated).toBe(true);
    expect(parsed.condition).toBe('UNSERVICEABLE');
    expect(parsed.modifier).toBe('EST');
    expect(parsed.schedule).toBe('0100-1100');
    expect(parsed.status === 'UPCOMING' || parsed.status === 'ACTIVE' || parsed.status === 'EXPIRED').toBeTruthy();
  });
});
