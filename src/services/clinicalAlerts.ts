import type {
  ApgarMinuteResult,
  CapurroResult,
  GrowthResult,
  RNData,
} from '@/types/domain';

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface ClinicalAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
}

/**
 * Constrói a lista de alertas clínicos relevantes para o caso, conforme spec §11.
 */
export function buildClinicalAlerts({
  rn,
  capurro,
  growth,
  apgar5min,
}: {
  rn: RNData;
  capurro?: CapurroResult;
  growth?: GrowthResult;
  apgar5min?: ApgarMinuteResult;
}): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  if (capurro && capurro.idadeGestacionalDias < 29 * 7) {
    alerts.push({
      id: 'ig-extrema',
      severity: 'warning',
      title: 'Idade gestacional < 29 semanas',
      message:
        'Capurro pode não ser o método ideal para prematuridade extrema. Considerar New Ballard ou protocolo institucional.',
    });
  }

  if (rn.pesoGramas !== undefined && rn.pesoGramas < 1500) {
    alerts.push({
      id: 'mbp',
      severity: 'warning',
      title: 'Recém-nascido de muito baixo peso',
      message:
        'Peso < 1500 g. Resultado deve ser interpretado com cautela e por profissional habilitado.',
    });
  }

  if (growth && growth.status === 'ok' && growth.pesoKg && growth.p10_kg && growth.p90_kg) {
    const margem = 0.05;
    const proxP10 = Math.abs(growth.pesoKg - growth.p10_kg) / growth.p10_kg <= margem;
    const proxP90 = Math.abs(growth.pesoKg - growth.p90_kg) / growth.p90_kg <= margem;
    if (proxP10 || proxP90) {
      alerts.push({
        id: 'fronteira',
        severity: 'info',
        title: 'Peso próximo do limite P10/P90',
        message:
          'A classificação pode mudar considerando a margem de erro da estimativa de IG. Reavaliar critério clínico.',
      });
    }
  }

  if (rn.sexo === undefined) {
    alerts.push({
      id: 'sem-sexo',
      severity: 'danger',
      title: 'Sexo não informado',
      message: 'Não é possível classificar PIG/AIG/GIG sem sexo do RN.',
    });
  }

  if (rn.pesoGramas === undefined || rn.pesoGramas <= 0) {
    alerts.push({
      id: 'sem-peso',
      severity: 'danger',
      title: 'Peso não informado',
      message: 'Não é possível classificar PIG/AIG/GIG sem peso ao nascer.',
    });
  }

  if (growth && growth.status === 'erro') {
    alerts.push({
      id: 'curva-indisponivel',
      severity: 'warning',
      title: 'Curva de referência indisponível',
      message: growth.message ?? 'Idade gestacional fora da faixa das curvas disponíveis.',
    });
  }

  if (apgar5min && apgar5min.total < 7) {
    alerts.push({
      id: 'apgar5-baixo',
      severity: 'warning',
      title: 'Apgar do 5º minuto < 7',
      message:
        'Habilitar registro do Apgar a cada 5 minutos até 20 minutos de vida, conforme SBP 2022.',
    });
  }

  return alerts;
}
