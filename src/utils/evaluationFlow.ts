import type { EvaluationMode } from '@/types/domain';

export const MODE_LABELS: Record<EvaluationMode, string> = {
  completa: 'Avaliação completa',
  apgar: 'Somente Apgar ampliado',
  capurro_peso: 'Capurro e peso × idade gestacional',
  enfermagem: 'Somente Avaliação de Enfermagem',
};

export const MODE_DESCRIPTIONS: Record<EvaluationMode, string> = {
  completa:
    'Boletim de Apgar ampliado, idade gestacional pelo Capurro e classificação PIG/AIG/GIG em sequência.',
  apgar: 'Registro do Apgar nos minutos 1 e 5 (e 10/15/20 se necessário), com manobras de reanimação.',
  capurro_peso:
    'Capurro (somático ou somático-neurológico), resultado da IG e curva de peso ao nascer (PIG/AIG/GIG).',
  enfermagem:
    'Evolução de enfermagem do RN com exame físico, sinais vitais, intervenções e prescrições.',
};

export function resolveMode(modo?: EvaluationMode): EvaluationMode {
  return modo ?? 'completa';
}

export function getTotalSteps(mode: EvaluationMode): number {
  switch (mode) {
    case 'apgar':
      return 2;
    case 'capurro_peso':
      return 5;
    case 'enfermagem':
      return 2;
    default:
      return 6;
  }
}

/** Primeira tela após escolher o modo no menu. */
export function getEntryPath(_mode: EvaluationMode): string {
  return '/cadastro';
}

export function getCadastroNext(mode: EvaluationMode): string {
  if (mode === 'apgar') return '/apgar';
  if (mode === 'capurro_peso') return '/capurro/metodo';
  if (mode === 'enfermagem') return '/evolucao/enfermagem';
  return '/apgar';
}

export function getApgarBack(_mode: EvaluationMode): string {
  return '/cadastro';
}

export function getApgarNext(mode: EvaluationMode): string {
  if (mode === 'apgar') return '/evolucao/decidir';
  return '/capurro/metodo';
}

export function getCapurroMetodoBack(mode: EvaluationMode): string {
  return mode === 'completa' ? '/apgar' : '/cadastro';
}

export function getCapurroMetodoNext(): string {
  return '/capurro/parametros';
}

export function getCapurroParametrosBack(): string {
  return '/capurro/metodo';
}

export function getCapurroParametrosNext(): string {
  return '/resultado/capurro';
}

export function getResultadoCapurroBack(): string {
  return '/capurro/parametros';
}

export function getResultadoCapurroNext(): string {
  return '/resultado/peso';
}

export function getResultadoPesoBack(_mode: EvaluationMode): string {
  return '/resultado/capurro';
}

export function getResultadoPesoNext(): string {
  return '/evolucao/decidir';
}

export function getRelatorioPath(_mode: EvaluationMode): string {
  return '/relatorio';
}

export function getEvolucaoBack(mode: EvaluationMode): string {
  if (mode === 'enfermagem') return '/cadastro';
  if (mode === 'apgar') return '/apgar';
  return '/resultado/peso';
}

export function getRelatorioBack(mode: EvaluationMode): string {
  if (mode === 'enfermagem') return '/evolucao/enfermagem';
  if (mode === 'apgar') return '/evolucao/decidir';
  return '/evolucao/decidir';
}

export function getRelatorioTitle(mode: EvaluationMode): string {
  switch (mode) {
    case 'enfermagem':
      return 'Relatório — Evolução de Enfermagem';
    case 'apgar':
      return 'Relatório — Apgar ampliado';
    case 'capurro_peso':
      return 'Relatório — Capurro e peso × IG';
    default:
      return 'Relatório — Avaliação completa';
  }
}

export function showsApgarInReport(mode: EvaluationMode): boolean {
  return mode === 'completa' || mode === 'apgar';
}

export function showsCapurroInReport(mode: EvaluationMode): boolean {
  return mode === 'completa' || mode === 'capurro_peso';
}

export function showsGrowthInReport(mode: EvaluationMode): boolean {
  return mode === 'completa' || mode === 'capurro_peso';
}

/** Número da etapa para a barra de progresso em cada rota. */
export function getStepNumber(
  route: 'cadastro' | 'apgar' | 'capurro_metodo' | 'capurro_parametros' | 'resultado_capurro' | 'resultado_peso',
  mode: EvaluationMode,
): number {
  switch (route) {
    case 'cadastro':
      return 1;
    case 'apgar':
      return mode === 'completa' ? 2 : 2;
    case 'capurro_metodo':
      return mode === 'completa' ? 3 : 2;
    case 'capurro_parametros':
      return mode === 'completa' ? 4 : 3;
    case 'resultado_capurro':
      return mode === 'completa' ? 5 : 4;
    case 'resultado_peso':
      return mode === 'completa' ? 6 : 5;
    default:
      return 1;
  }
}
