import type { ApgarItemKey, ApgarMinuteRecord, ApgarMinuteResult, ApgarScore } from '@/types/domain';

const APGAR_ITEMS: ApgarItemKey[] = [
  'frequencia_cardiaca',
  'respiracao',
  'tonus_muscular',
  'irritabilidade_reflexa',
  'cor',
];

export function calcularApgarMinuto(registro: ApgarMinuteRecord): ApgarMinuteResult {
  for (const item of APGAR_ITEMS) {
    const valor = registro.pontuacoes[item];
    if (valor === undefined || valor === null) {
      throw new Error(`Sinal obrigatório ausente: ${item}`);
    }
    if (![0, 1, 2].includes(Number(valor))) {
      throw new Error(`Pontuação inválida para: ${item}`);
    }
  }

  const total = APGAR_ITEMS.reduce(
    (soma, item) => soma + (Number(registro.pontuacoes[item]) as ApgarScore),
    0,
  );

  return {
    minuto: registro.minuto,
    total,
    interpretacao:
      total < 7
        ? 'Apgar < 7: manter documentação seriada conforme protocolo SBP 2022.'
        : 'Apgar ≥ 7.',
    intervencoes: registro.intervencoes ?? [],
  };
}

export function precisaRegistrarApgarAte20(apgar5min: number): boolean {
  return apgar5min < 7;
}

export function isApgarMinutoCompleto(registro?: ApgarMinuteRecord): boolean {
  if (!registro) return false;
  return APGAR_ITEMS.every(
    (item) =>
      registro.pontuacoes[item] !== undefined && registro.pontuacoes[item] !== null,
  );
}

export const APGAR_ITEM_KEYS = APGAR_ITEMS;
