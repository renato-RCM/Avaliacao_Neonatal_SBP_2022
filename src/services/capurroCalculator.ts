import type {
  CapurroConfig,
  CapurroItemKey,
  CapurroMethod,
  CapurroResult,
} from '@/types/domain';

export function calcularCapurro({
  metodo,
  respostas,
  config,
}: {
  metodo: CapurroMethod;
  respostas: Partial<Record<CapurroItemKey, number>>;
  config: CapurroConfig;
}): CapurroResult {
  const metodoConfig = config.methods[metodo];
  if (!metodoConfig) {
    throw new Error('Método inválido');
  }

  const itensObrigatorios = metodoConfig.items;

  for (const item of itensObrigatorios) {
    const valor = respostas[item];
    if (valor === undefined || valor === null) {
      throw new Error(`Parâmetro obrigatório ausente: ${item}`);
    }
  }

  const somaPontos = itensObrigatorios.reduce((total, item) => {
    return total + Number(respostas[item]);
  }, 0);

  const idadeDias = somaPontos + metodoConfig.constant_days;
  const semanasCompletas = Math.floor(idadeDias / 7);
  const diasRestantes = idadeDias % 7;
  const semanasDecimal = Number((idadeDias / 7).toFixed(1));

  return {
    metodo,
    somaPontos,
    idadeGestacionalDias: idadeDias,
    idadeGestacionalSemanasDecimal: semanasDecimal,
    idadeGestacionalSemanasCompletas: semanasCompletas,
    idadeGestacionalDiasRestantes: diasRestantes,
    idadeGestacionalLabel: `${semanasCompletas}+${diasRestantes}`,
    classificacaoTermo: classificarIdadeGestacional(idadeDias),
  };
}

export function classificarIdadeGestacional(
  idadeDias: number,
): 'Pré-termo' | 'A termo' | 'Pós-termo' {
  if (idadeDias < 37 * 7) {
    return 'Pré-termo';
  }
  if (idadeDias < 42 * 7) {
    return 'A termo';
  }
  return 'Pós-termo';
}

/**
 * Indica se o método é Capurro Somático-Neurológico, que usa parâmetros adicionais.
 */
export function isMetodoNeurologico(metodo: CapurroMethod): boolean {
  return metodo === 'capurro_somatoneurologico';
}
