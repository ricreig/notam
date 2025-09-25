import { computeScore } from '../src/services/scoring';

describe('computeScore', () => {
  it('awards high severity for runway closure at base airport', () => {
    const result = computeScore({
      element: 'runway',
      subject: 'RWY 05L',
      condition: 'CLOSED',
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      services: ['ATS'],
      baseAirport: true,
      status: 'ACTIVE',
    });

    expect(result.severity).toBeGreaterThan(80);
    expect(result.relevance).toBeGreaterThan(60);
    expect(result.reasons).toEqual(expect.arrayContaining(['Aeródromo base', 'Impacta servicios ATS/COM/NAV/SUR']));
  });

  it('keeps info level low for informational notice', () => {
    const result = computeScore({
      element: 'warnings',
      subject: 'BIRD ACTIVITY',
      condition: 'CAUTION ADVISED',
      startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      services: [],
      baseAirport: false,
      status: 'UPCOMING',
    });

    expect(result.severity).toBeLessThan(70);
    expect(result.relevance).toBeLessThan(60);
  });
});
