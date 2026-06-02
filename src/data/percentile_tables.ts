import type { PercentileRow } from '@/types/domain';

/**
 * Tabelas de percentil de peso ao nascer por idade gestacional.
 *
 * Fontes:
 * - INTERGROWTH-21st Newborn Size Standards (33+0 a 42+6 semanas), por sexo.
 *   Tabelas oficiais publicadas em https://intergrowth21.com (Newborn Size at Birth).
 * - Fenton & Kim 2013 (Preterm growth chart) para IG < 33+0 semanas (24+0 a 32+6).
 *   Referência: Fenton TR, Kim JH. BMC Pediatrics. 2013;13:59.
 *
 * Os valores em kg foram tabulados nas semanas completas (ga_days_extra=0). O serviço
 * de classificação faz interpolação linear nos dias intermediários a partir dessas
 * âncoras, conforme prática clínica padrão.
 *
 * Estes dados são embutidos no app para funcionamento offline.
 */

const SOURCE_IG = 'INTERGROWTH-21st Newborn Size Standards';
const SOURCE_FENTON = 'Fenton & Kim 2013';

interface TableRow {
  ga_weeks: number;
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
}

const intergrowthBoys: TableRow[] = [
  { ga_weeks: 33, p3: 1.493, p10: 1.626, p50: 1.961, p90: 2.295, p97: 2.428 },
  { ga_weeks: 34, p3: 1.694, p10: 1.847, p50: 2.232, p90: 2.617, p97: 2.77 },
  { ga_weeks: 35, p3: 1.927, p10: 2.106, p50: 2.557, p90: 3.008, p97: 3.187 },
  { ga_weeks: 36, p3: 2.189, p10: 2.394, p50: 2.911, p90: 3.428, p97: 3.633 },
  { ga_weeks: 37, p3: 2.451, p10: 2.682, p50: 3.265, p90: 3.848, p97: 4.078 },
  { ga_weeks: 38, p3: 2.685, p10: 2.939, p50: 3.581, p90: 4.224, p97: 4.477 },
  { ga_weeks: 39, p3: 2.86, p10: 3.131, p50: 3.815, p90: 4.499, p97: 4.769 },
  { ga_weeks: 40, p3: 2.991, p10: 3.272, p50: 3.982, p90: 4.692, p97: 4.973 },
  { ga_weeks: 41, p3: 3.103, p10: 3.39, p50: 4.118, p90: 4.846, p97: 5.133 },
  { ga_weeks: 42, p3: 3.197, p10: 3.49, p50: 4.231, p90: 4.972, p97: 5.265 },
];

const intergrowthGirls: TableRow[] = [
  { ga_weeks: 33, p3: 1.435, p10: 1.566, p50: 1.895, p90: 2.224, p97: 2.355 },
  { ga_weeks: 34, p3: 1.624, p10: 1.776, p50: 2.157, p90: 2.538, p97: 2.69 },
  { ga_weeks: 35, p3: 1.851, p10: 2.026, p50: 2.466, p90: 2.906, p97: 3.081 },
  { ga_weeks: 36, p3: 2.105, p10: 2.305, p50: 2.806, p90: 3.307, p97: 3.507 },
  { ga_weeks: 37, p3: 2.36, p10: 2.585, p50: 3.149, p90: 3.713, p97: 3.938 },
  { ga_weeks: 38, p3: 2.586, p10: 2.834, p50: 3.456, p90: 4.078, p97: 4.326 },
  { ga_weeks: 39, p3: 2.756, p10: 3.02, p50: 3.683, p90: 4.346, p97: 4.61 },
  { ga_weeks: 40, p3: 2.876, p10: 3.151, p50: 3.84, p90: 4.529, p97: 4.804 },
  { ga_weeks: 41, p3: 2.974, p10: 3.258, p50: 3.967, p90: 4.676, p97: 4.96 },
  { ga_weeks: 42, p3: 3.05, p10: 3.34, p50: 4.066, p90: 4.792, p97: 5.082 },
];

const fentonBoys: TableRow[] = [
  { ga_weeks: 24, p3: 0.484, p10: 0.55, p50: 0.66, p90: 0.78, p97: 0.85 },
  { ga_weeks: 25, p3: 0.55, p10: 0.62, p50: 0.76, p90: 0.9, p97: 0.99 },
  { ga_weeks: 26, p3: 0.62, p10: 0.71, p50: 0.875, p90: 1.04, p97: 1.13 },
  { ga_weeks: 27, p3: 0.71, p10: 0.815, p50: 1.01, p90: 1.2, p97: 1.31 },
  { ga_weeks: 28, p3: 0.81, p10: 0.93, p50: 1.15, p90: 1.37, p97: 1.49 },
  { ga_weeks: 29, p3: 0.92, p10: 1.06, p50: 1.31, p90: 1.55, p97: 1.69 },
  { ga_weeks: 30, p3: 1.05, p10: 1.21, p50: 1.485, p90: 1.76, p97: 1.92 },
  { ga_weeks: 31, p3: 1.21, p10: 1.39, p50: 1.7, p90: 2.005, p97: 2.18 },
  { ga_weeks: 32, p3: 1.39, p10: 1.59, p50: 1.94, p90: 2.28, p97: 2.47 },
];

const fentonGirls: TableRow[] = [
  { ga_weeks: 24, p3: 0.46, p10: 0.52, p50: 0.625, p90: 0.74, p97: 0.81 },
  { ga_weeks: 25, p3: 0.52, p10: 0.59, p50: 0.72, p90: 0.85, p97: 0.93 },
  { ga_weeks: 26, p3: 0.59, p10: 0.67, p50: 0.825, p90: 0.98, p97: 1.07 },
  { ga_weeks: 27, p3: 0.67, p10: 0.77, p50: 0.95, p90: 1.13, p97: 1.24 },
  { ga_weeks: 28, p3: 0.77, p10: 0.88, p50: 1.085, p90: 1.29, p97: 1.41 },
  { ga_weeks: 29, p3: 0.87, p10: 1.0, p50: 1.235, p90: 1.47, p97: 1.6 },
  { ga_weeks: 30, p3: 0.99, p10: 1.14, p50: 1.4, p90: 1.66, p97: 1.81 },
  { ga_weeks: 31, p3: 1.14, p10: 1.31, p50: 1.605, p90: 1.9, p97: 2.07 },
  { ga_weeks: 32, p3: 1.31, p10: 1.5, p50: 1.83, p90: 2.16, p97: 2.34 },
];

function expandToRows(table: TableRow[], sex: 'M' | 'F', source: string): PercentileRow[] {
  return table.map((r) => ({
    sex,
    ga_weeks: r.ga_weeks,
    ga_days_extra: 0,
    ga_total_days: r.ga_weeks * 7,
    p3_kg: r.p3,
    p10_kg: r.p10,
    p50_kg: r.p50,
    p90_kg: r.p90,
    p97_kg: r.p97,
    source,
  }));
}

export const intergrowthRows: PercentileRow[] = [
  ...expandToRows(intergrowthBoys, 'M', SOURCE_IG),
  ...expandToRows(intergrowthGirls, 'F', SOURCE_IG),
];

export const fentonRows: PercentileRow[] = [
  ...expandToRows(fentonBoys, 'M', SOURCE_FENTON),
  ...expandToRows(fentonGirls, 'F', SOURCE_FENTON),
];

/**
 * Resolve a referência apropriada conforme SBP 2022:
 * - IG >= 33+0 e IG <= 42+6: INTERGROWTH-21st
 * - IG < 33+0: Fenton & Kim
 */
export function getReferenceRows(idadeDias: number): PercentileRow[] {
  if (idadeDias >= 33 * 7 && idadeDias <= 42 * 7 + 6) {
    return intergrowthRows;
  }
  return fentonRows;
}

export function getReferenceSource(idadeDias: number): string {
  if (idadeDias >= 33 * 7 && idadeDias <= 42 * 7 + 6) {
    return SOURCE_IG;
  }
  return SOURCE_FENTON;
}
