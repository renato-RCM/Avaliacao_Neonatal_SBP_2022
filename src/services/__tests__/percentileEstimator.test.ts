import { describe, it, expect } from 'vitest';
import { estimarPercentilAproximado } from '../percentileEstimator';

const ref = {
  sex: 'M' as const,
  ga_weeks: 40,
  ga_days_extra: 0,
  ga_total_days: 280,
  p3_kg: 2.991,
  p10_kg: 3.272,
  p50_kg: 3.982,
  p90_kg: 4.692,
  p97_kg: 4.973,
  source: 'INTERGROWTH-21st Newborn Size Standards',
};

describe('estimarPercentilAproximado', () => {
  it('retorna <P3 quando peso muito baixo', () => {
    expect(estimarPercentilAproximado(2.5, ref)).toBe('<P3');
  });

  it('retorna >P97 quando peso muito alto', () => {
    expect(estimarPercentilAproximado(5.5, ref)).toBe('>P97');
  });

  it('retorna ~P50 quando peso é exatamente P50', () => {
    expect(estimarPercentilAproximado(3.982, ref)).toBe('P50');
  });

  it('interpola corretamente entre P10 e P50', () => {
    const meio = (ref.p10_kg + ref.p50_kg) / 2;
    const r = estimarPercentilAproximado(meio, ref);
    expect(r).toMatch(/P30/);
  });

  it('retorna P10 exato', () => {
    expect(estimarPercentilAproximado(3.272, ref)).toBe('P10');
  });

  it('retorna P90 exato', () => {
    expect(estimarPercentilAproximado(4.692, ref)).toBe('P90');
  });
});
