import { classifyQLine, parseQLine } from '../src/services/qClassifier';

describe('qClassifier', () => {
  const sample = 'Q) MMFR/QMRLC/IV/NBO/A/000/999/1645N09945W005';

  it('parses q-line segments correctly', () => {
    const parsed = parseQLine(sample);
    expect(parsed).not.toBeNull();
    expect(parsed?.subjectCode).toBe('MR');
    expect(parsed?.stateCode).toBe('LC');
    expect(parsed?.scope?.code).toBe('A');
    expect(parsed?.traffic.map((item) => item.code)).toEqual(['I', 'V']);
    expect(parsed?.lowerLimit.valueFt).toBe(0);
    expect(parsed?.upperLimit.valueFt).toBe(99900);
    expect(parsed?.coordinates).toEqual(
      expect.objectContaining({ lat: expect.any(Number), lon: expect.any(Number) }),
    );
  });

  it('classifies category and element from q-line', () => {
    const classification = classifyQLine(sample);
    expect(classification).not.toBeNull();
    expect(classification?.categoryId).toBe('AGA-M');
    expect(classification?.elementId).toBe('AGA-M-MR');
    expect(classification?.stateDescription).toMatch(/Cerrado/i);
  });

  it('returns null when q-line is missing', () => {
    expect(classifyQLine(null)).toBeNull();
    expect(parseQLine('')).toBeNull();
  });
});
