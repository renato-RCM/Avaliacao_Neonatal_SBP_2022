import type { PercentileRow } from '@/types/domain';

/**
 * Estima o percentil aproximado por interpolação linear entre os percentis
 * conhecidos (P3, P10, P50, P90, P97). Conforme spec §8 da SBP 2022.
 */
export function estimarPercentilAproximado(pesoKg: number, ref: PercentileRow): string {
  const pontos: { p: number; valor: number }[] = [
    { p: 3, valor: ref.p3_kg },
    { p: 10, valor: ref.p10_kg },
    { p: 50, valor: ref.p50_kg },
    { p: 90, valor: ref.p90_kg },
    { p: 97, valor: ref.p97_kg },
  ];

  if (pesoKg < ref.p3_kg) return '<P3';
  if (pesoKg > ref.p97_kg) return '>P97';

  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i];
    const b = pontos[i + 1];
    if (pesoKg >= a.valor && pesoKg <= b.valor) {
      const denom = b.valor - a.valor;
      const ratio = denom === 0 ? 0 : (pesoKg - a.valor) / denom;
      const percentil = a.p + ratio * (b.p - a.p);
      return `P${Math.round(percentil)}`;
    }
  }

  return 'Percentil não estimado';
}
