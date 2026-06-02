import type { GrowthResult, PercentileRow, Sexo } from '@/types/domain';
import { getReferenceRows, getReferenceSource } from '@/data/percentile_tables';
import { estimarPercentilAproximado } from './percentileEstimator';

/**
 * Faz interpolação linear entre as semanas inteiras da tabela para obter
 * o valor do percentil na idade gestacional exata em dias.
 */
function interpolarLinha(rows: PercentileRow[], sexo: Sexo, idadeDias: number): PercentileRow | null {
  const subset = rows.filter((r) => r.sex === sexo).sort((a, b) => a.ga_total_days - b.ga_total_days);
  if (subset.length === 0) return null;

  if (idadeDias <= subset[0].ga_total_days) {
    return subset[0];
  }
  if (idadeDias >= subset[subset.length - 1].ga_total_days) {
    return subset[subset.length - 1];
  }

  for (let i = 0; i < subset.length - 1; i++) {
    const a = subset[i];
    const b = subset[i + 1];
    if (idadeDias >= a.ga_total_days && idadeDias <= b.ga_total_days) {
      const ratio = (idadeDias - a.ga_total_days) / (b.ga_total_days - a.ga_total_days);
      const interp = (x: keyof PercentileRow) =>
        Number((Number(a[x]) + ratio * (Number(b[x]) - Number(a[x]))).toFixed(3));
      return {
        sex: sexo,
        ga_weeks: Math.floor(idadeDias / 7),
        ga_days_extra: idadeDias % 7,
        ga_total_days: idadeDias,
        p3_kg: interp('p3_kg'),
        p10_kg: interp('p10_kg'),
        p50_kg: interp('p50_kg'),
        p90_kg: interp('p90_kg'),
        p97_kg: interp('p97_kg'),
        source: a.source,
      };
    }
  }
  return null;
}

export function classificarPesoPorIdadeGestacional({
  pesoGramas,
  sexo,
  idadeDias,
}: {
  pesoGramas: number;
  sexo: Sexo;
  idadeDias: number;
}): GrowthResult {
  if (!pesoGramas || pesoGramas <= 0) {
    return { status: 'erro', message: 'Peso ao nascer inválido.' };
  }

  if (!sexo) {
    return {
      status: 'erro',
      message: 'Sexo do RN é obrigatório para classificação PIG/AIG/GIG.',
    };
  }

  const minDias = 24 * 7;
  const maxDias = 42 * 7 + 6;

  if (idadeDias < minDias || idadeDias > maxDias) {
    return {
      status: 'erro',
      message: `Idade gestacional fora da faixa disponível (24+0 a 42+6). IG estimada: ${Math.floor(
        idadeDias / 7,
      )}+${idadeDias % 7}.`,
      referencia: getReferenceSource(idadeDias),
    };
  }

  const rows = getReferenceRows(idadeDias);
  const ref = interpolarLinha(rows, sexo, idadeDias);

  if (!ref) {
    return {
      status: 'erro',
      message: 'Idade gestacional fora da faixa da curva disponível.',
      referencia: getReferenceSource(idadeDias),
    };
  }

  const pesoKg = pesoGramas / 1000;
  let classificacao: 'PIG' | 'AIG' | 'GIG';
  if (pesoKg < ref.p10_kg) {
    classificacao = 'PIG';
  } else if (pesoKg > ref.p90_kg) {
    classificacao = 'GIG';
  } else {
    classificacao = 'AIG';
  }

  const percentilEstimado = estimarPercentilAproximado(pesoKg, ref);

  return {
    status: 'ok',
    classificacao,
    pesoKg: Number(pesoKg.toFixed(3)),
    p3_kg: ref.p3_kg,
    p10_kg: ref.p10_kg,
    p50_kg: ref.p50_kg,
    p90_kg: ref.p90_kg,
    p97_kg: ref.p97_kg,
    percentilEstimado,
    referencia: ref.source,
  };
}

export { interpolarLinha };
