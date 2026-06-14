import type {
  ApgarMinuteResult,
  CapurroResult,
  EvolucaoEnfermagemData,
  GrowthResult,
  RNData,
} from '@/types/domain';
import { calcularIdadeHorasVida } from '@/utils/dateTime';

// ---------------------------------------------------------------------------
// Helpers de texto
// ---------------------------------------------------------------------------

function plural(n: number, singular: string, pluralForm: string): string {
  return n === 1 ? singular : pluralForm;
}

/**
 * Gera o texto completo da evolução de enfermagem a partir dos dados do RN +
 * classificações já calculadas + formulário preenchido.
 */
export function gerarTextoEvolucao(params: {
  rn: RNData;
  capurro?: CapurroResult | null;
  growth?: GrowthResult | null;
  apgar1min?: ApgarMinuteResult | null;
  apgar5min?: ApgarMinuteResult | null;
  evolucao: EvolucaoEnfermagemData;
}): string {
  const { rn, capurro, growth, apgar1min, apgar5min, evolucao } = params;

  const linhas: string[] = [];

  // ── Título ──
  linhas.push('## Evolução de Enfermagem do RN ##');
  linhas.push('');

  // ── Horas de vida ──
  const horasVida = calcularIdadeHorasVida(rn.dataHoraNascimento);
  if (horasVida !== null) {
    const h = Math.round(horasVida);
    linhas.push(`# ${h} ${plural(h, 'hora', 'horas')} de vida`);
  }

  // ── Via de nascimento ──
  if (evolucao.viaNascimento) {
    const viaLabel: Record<string, string> = {
      vaginal: 'parto vaginal',
      cesarea: 'cesárea',
      forceps: 'fórceps',
    };
    linhas.push(`# Via de nascimento - ${viaLabel[evolucao.viaNascimento] ?? evolucao.viaNascimento}`);
  }

  // ── Apgar ──
  if (apgar1min || apgar5min) {
    const a1 = apgar1min ? String(apgar1min.total) : '—';
    const a5 = apgar5min ? String(apgar5min.total) : '—';
    linhas.push(`# Apgar - ${a1}/${a5} (SIC com os pais)`);
  }

  // ── Tipagem sanguínea ──
  if (evolucao.tipoSanguineoMae) {
    linhas.push(`# Tipagem sanguínea materna: ${evolucao.tipoSanguineoMae}`);
  }
  if (evolucao.tipoSanguineoRN) {
    linhas.push(`# Tipagem Sanguínea do RN: ${evolucao.tipoSanguineoRN}`);
  } else if (evolucao.tipoSanguineoMae) {
    // Se não preencheu RN mas preencheu materna, indica "Solicitada"
    linhas.push(`# Tipagem Sanguínea do RN: Solicitada`);
  }

  // ── Testes rápidos ──
  if (evolucao.testesRapidosMaternos) {
    linhas.push(`# Testes rápidos maternos na admissão (HIV e Sífilis): ${evolucao.testesRapidosMaternos}`);
  }

  // ── Capurro ──
  if (capurro) {
    linhas.push(`# Capurro: ${capurro.idadeGestacionalLabel}`);
  }

  // ── Classificação RNT + PIG/AIG/GIG ──
  if (capurro && growth && growth.status === 'ok') {
    const termo = capurro.classificacaoTermo === 'A termo' ? 'RNT' : capurro.classificacaoTermo;
    linhas.push(`# ${termo} ${growth.classificacao}`);
  } else if (capurro) {
    const termo = capurro.classificacaoTermo === 'A termo' ? 'RNT' : capurro.classificacaoTermo;
    linhas.push(`# ${termo}`);
  }

  linhas.push('');

  // ── Amamentação e eliminações ──
  const amamentacaoLines: string[] = [];
  if (evolucao.amamentacaoDificuldade !== undefined) {
    if (evolucao.amamentacaoDificuldade) {
      amamentacaoLines.push('Puérpera relata dificuldades com amamentação.');
    } else {
      amamentacaoLines.push('Puérpera nega dificuldades com amamentação.');
    }
  }
  if (evolucao.amamentacaoObservacao) {
    amamentacaoLines.push(evolucao.amamentacaoObservacao);
  }

  // Eliminações
  const elimParts: string[] = [];
  if (evolucao.eliminacoesVesicais !== undefined) {
    elimParts.push(evolucao.eliminacoesVesicais ? 'vesicais presentes' : 'vesicais ausentes');
  }
  if (evolucao.eliminacoesIntestinais !== undefined) {
    elimParts.push(evolucao.eliminacoesIntestinais ? 'intestinais presentes' : 'intestinais ausentes');
  }
  if (elimParts.length > 0) {
    amamentacaoLines.push(`Eliminações (${elimParts.join(' e ')}) no pós-parto imediato.`);
  }
  if (evolucao.eliminacoesObservacao) {
    amamentacaoLines.push(evolucao.eliminacoesObservacao);
  }

  if (amamentacaoLines.length > 0) {
    linhas.push(amamentacaoLines.join(' '));
    linhas.push('');
  }

  // ── Vínculo ──
  if (evolucao.vinculoBinomio) {
    linhas.push(evolucao.vinculoBinomio);
    linhas.push('');
  }

  // ── Exame físico ──
  const sistemas = gerarExameFisicoTextos(evolucao);
  const temSistemas = sistemas.length > 0;

  if (temSistemas) {
    linhas.push('#Ao exame físico:');

    // Estado geral + sinais vitais
    const estadoParts: string[] = [];
    estadoParts.push('RN ativo, reativo, normocorado');
    if (evolucao.frequenciaCardiaca) {
      estadoParts.push(`normocárdico (${evolucao.frequenciaCardiaca}bpm)`);
    }
    estadoParts.push('anictérico, hidratado');
    if (evolucao.frequenciaRespiratoria) {
      estadoParts.push(`eupneico (${evolucao.frequenciaRespiratoria} irpm)`);
    }
    estadoParts.push('acianótico');
    if (evolucao.temperatura) {
      estadoParts.push(`normotérmico (${evolucao.temperatura}ºC)`);
    }

    linhas.push(estadoParts.join(', ') + '.');

    for (const s of sistemas) {
      linhas.push(s);
    }
  }

  // ── Reflexos neurológicos ──
  if (evolucao.reflexosNeurologicosNormal && !evolucao.reflexosNeurologicosDescricao) {
    linhas.push('');
    linhas.push(
      'Reflexos neurológicos de acordo com idade (Reflexos de Moro, marcha, tônico-cervical, fuga da asfixia, Babinski, preensão palmar e plantar, busca, pega e sucção - de acordo com idade).',
    );
  } else if (evolucao.reflexosNeurologicosDescricao) {
    linhas.push('');
    linhas.push(evolucao.reflexosNeurologicosDescricao);
  }

  // ── Intervenções de enfermagem ──
  if (evolucao.intervencoes) {
    linhas.push('.');
    linhas.push('Intervenções de enfermagem:');
    for (const linha of evolucao.intervencoes.split('\n').map((l) => l.trim()).filter(Boolean)) {
      linhas.push(`- ${linha}`);
    }
  }

  // ── Prescrição de enfermagem ──
  if (evolucao.prescricao) {
    linhas.push('.');
    linhas.push('Prescrição de enfermagem:');
    for (const linha of evolucao.prescricao.split('\n').map((l) => l.trim()).filter(Boolean)) {
      linhas.push(`- ${linha}`);
    }
  }

  return linhas.join('\n');
}

// ---------------------------------------------------------------------------
// Geração dos textos de exame físico por sistema
// ---------------------------------------------------------------------------

interface SistemaEntry {
  key: keyof EvolucaoEnfermagemData;
  titulo: string;
  normalText: string;
}

const SISTEMAS: SistemaEntry[] = [
  {
    key: 'cranio',
    titulo: 'Cabeça',
    normalText:
      'crânio normocefálico, simétrico, e com couro cabelo íntegro.',
  },
  {
    key: 'fontanelas',
    titulo: 'Fontanelas',
    normalText:
      'bregmática e lambdóide normotensas, medindo 3x2 e 1x1 polpas digitais respectivamente.',
  },
  {
    key: 'facies',
    titulo: 'Fácies',
    normalText: 'simétricas e sem alterações.',
  },
  {
    key: 'olhos',
    titulo: 'Olhos',
    normalText:
      'apresentando conjuntiva corada e integra, esclera branca, globo ocular com mobilidade adequada, pupilas isocóricas e fotorreagentes.',
  },
  {
    key: 'nariz',
    titulo: 'Nariz',
    normalText:
      'com implantação centralizada na facie, narinas simétricas, mucosa íntegra e corada, sem desvio de septo aparente.',
  },
  {
    key: 'boca',
    titulo: 'Boca',
    normalText:
      'com implantação centralizada na facie, mucosa e gengiva integra e corada. Lábios e palatos íntegros.',
  },
  {
    key: 'orelhas',
    titulo: 'Orelhas',
    normalText:
      'adequada implantação, sem presença de secreção e com pavilhão auricular apresentando curvatura parcial na borda.',
  },
  {
    key: 'pescoco',
    titulo: 'Pescoço',
    normalText:
      'mobilidade preservada e linfonodos impalpáveis (retro auriculares e cervicais).',
  },
  {
    key: 'torax',
    titulo: 'Tórax',
    normalText: 'simétrico e expansível.',
  },
  {
    key: 'claviculas',
    titulo: 'Clavículas',
    normalText: 'íntegras e sem crepitações.',
  },
  {
    key: 'mamas',
    titulo: 'Mamas',
    normalText:
      'inserção mamilar simétrica e presença de glândula mamaria medindo entre 5-10mm.',
  },
  {
    key: 'acv',
    titulo: 'ACV',
    normalText:
      'Ritmo cardíaco regular com bulhas normofonéticas em 2 tempos.',
  },
  {
    key: 'ar',
    titulo: 'AR',
    normalText:
      'murmúrios vesiculares fisiológicos sem ruídos adventícios. Não há sinais de desconforto respiratório.',
  },
  {
    key: 'abdome',
    titulo: 'Abdome',
    normalText:
      'globoso, RHA presentes, timpânico a percussão e sem visceromegalias aparentes.',
  },
  {
    key: 'cotoUmbilical',
    titulo: 'Coto umbilical',
    normalText: 'limpo e sem sinais flogísticos.',
  },
  {
    key: 'quadril',
    titulo: 'Quadril',
    normalText: 'manobras de Ortolany e Barlow negativas.',
  },
  {
    key: 'genitalia',
    titulo: 'Genitália',
    normalText:
      'típica masculina, não visualizo meato urinário devido a presença de fimose fisiológica e testículos palpáveis bilateralmente em bolsa escrotal.',
  },
  {
    key: 'anus',
    titulo: 'Ânus',
    normalText: 'aparentemente pérvio.',
  },
  {
    key: 'extremidades',
    titulo: 'Extremidades',
    normalText:
      'MMSS e MMII simétricos e apresentando adequada mobilidade dos membros.',
  },
  {
    key: 'perfusao',
    titulo: 'Perfusão',
    normalText: 'Periférica < 2seg.',
  },
  {
    key: 'pulsos',
    titulo: 'Pulsos',
    normalText:
      'palpáveis (radial, femoral e pediosa) e sem edemas.',
  },
];

function gerarExameFisicoTextos(evolucao: EvolucaoEnfermagemData): string[] {
  const result: string[] = [];

  for (const sistema of SISTEMAS) {
    const field = evolucao[sistema.key] as { normal: boolean; descricao?: string } | undefined;
    if (!field) continue;

    // Sistema não avaliado (nem normal nem alterado): pula
    if (!field.normal && field.descricao === undefined) continue;

    if (field.normal && !field.descricao) {
      // Normal sem descrição extra: exibe o texto normal padrão
      result.push(`${sistema.titulo}: ${sistema.normalText}`);
    } else if (field.normal && field.descricao) {
      // Normal com complemento/observação
      result.push(`${sistema.titulo}: ${field.descricao}`);
    } else if (!field.normal) {
      // Alterado (descricao pode ser string vazia ou preenchida)
      const desc = field.descricao?.trim();
      if (desc) {
        result.push(`${sistema.titulo}: ${desc}`);
      } else {
        result.push(`${sistema.titulo}: ALTERADO — sem descrição informada.`);
      }
    }
  }

  return result;
}
