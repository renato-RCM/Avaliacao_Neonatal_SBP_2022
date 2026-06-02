import { useMemo } from 'react';
import { Layout } from '@/components/common/Layout';
import { StepNav } from '@/components/common/StepNav';
import { Alert } from '@/components/common/Alert';
import { SectionCard } from '@/components/common/SectionCard';
import { OptionCard } from '@/components/common/OptionCard';
import { RequireModes, useEvaluationMode } from '@/hooks/useEvaluationMode';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import {
  getApgarBack,
  getApgarNext,
  getStepNumber,
  getTotalSteps,
} from '@/utils/evaluationFlow';
import { capurroConfig } from '@/data/config';
import {
  APGAR_ITEM_KEYS,
  calcularApgarMinuto,
  isApgarMinutoCompleto,
} from '@/services/apgarCalculator';
import type { ApgarItemKey, ApgarMinute, ApgarScore } from '@/types/domain';

const MINUTOS_BASE: ApgarMinute[] = [1, 5];
const MINUTOS_CONDICIONAIS: ApgarMinute[] = [10, 15, 20];

function ApgarPage() {
  const modo = useEvaluationMode();
  const apgar = useEvaluationStore((s) => s.apgar);
  const setApgarItem = useEvaluationStore((s) => s.setApgarItem);
  const toggleIntervencao = useEvaluationStore((s) => s.toggleApgarIntervencao);

  const apgar5 = useMemo(() => {
    const reg = apgar.registros[5];
    if (!reg || !isApgarMinutoCompleto(reg)) return undefined;
    try {
      return calcularApgarMinuto(reg);
    } catch {
      return undefined;
    }
  }, [apgar.registros]);

  const minutosVisiveis: ApgarMinute[] =
    apgar5 && apgar5.total < 7
      ? [...MINUTOS_BASE, ...MINUTOS_CONDICIONAIS]
      : [...MINUTOS_BASE];

  const obrigatoriosOk = MINUTOS_BASE.every((m) => isApgarMinutoCompleto(apgar.registros[m]));

  return (
    <Layout>
      <StepNav
        step={getStepNumber('apgar', modo)}
        totalSteps={getTotalSteps(modo)}
        title="Boletim de Apgar ampliado"
        subtitle="SBP 2022. Pontue cada sinal nos minutos 1 e 5. Se Apgar do 5º minuto for menor que 7, registre também 10, 15 e 20 minutos."
        backTo={getApgarBack(modo)}
        nextTo={getApgarNext(modo)}
        nextLabel={modo === 'apgar' ? 'Ver relatório' : 'Continuar'}
        nextDisabled={!obrigatoriosOk}
        isFinal={modo === 'apgar'}
      />

      <div className="space-y-4">
        <Alert severity="warning" title="Atenção clínica">
          O Apgar <strong>não decide</strong> o início da reanimação. As condutas de reanimação
          devem seguir avaliação imediata de vitalidade, FC, respiração e diretrizes SBP 2022 /
          protocolo institucional.
        </Alert>

        {minutosVisiveis.map((minuto) => (
          <MinutoApgar
            key={minuto}
            minuto={minuto}
            condicional={MINUTOS_CONDICIONAIS.includes(minuto)}
            onSetItem={setApgarItem}
            onToggleIntervencao={toggleIntervencao}
          />
        ))}

        {apgar5 && apgar5.total < 7 && (
          <Alert severity="warning" title="Apgar do 5º minuto < 7">
            Conforme SBP 2022, registre o Apgar a cada 5 minutos até 20 minutos de vida.
          </Alert>
        )}
      </div>
    </Layout>
  );
}

function MinutoApgar({
  minuto,
  condicional,
  onSetItem,
  onToggleIntervencao,
}: {
  minuto: ApgarMinute;
  condicional: boolean;
  onSetItem: (m: ApgarMinute, item: ApgarItemKey, score: ApgarScore) => void;
  onToggleIntervencao: (m: ApgarMinute, intervencao: string) => void;
}) {
  const reg = useEvaluationStore((s) => s.apgar.registros[minuto]);
  const intervencoes = capurroConfig.apgar.resuscitation_interventions_to_document;

  const total = useMemo(() => {
    if (!reg || !isApgarMinutoCompleto(reg)) return null;
    try {
      return calcularApgarMinuto(reg).total;
    } catch {
      return null;
    }
  }, [reg]);

  const completo = isApgarMinutoCompleto(reg);

  return (
    <SectionCard
      title={`${minuto}º minuto${condicional ? ' (condicional)' : ''}`}
      description={
        condicional
          ? 'Registro recomendado pelas Diretrizes SBP 2022 quando Apgar do 5º minuto < 7.'
          : 'Pontue cada um dos cinco sinais clínicos.'
      }
      badge={
        total !== null ? (
          <span
            className={`badge text-sm ${
              total < 7 ? 'bg-warning-100 text-warning-700' : 'bg-success-100 text-success-700'
            }`}
          >
            Apgar = {total}
          </span>
        ) : (
          <span className="badge bg-slate-100 text-slate-600">Pendente</span>
        )
      }
    >
      <div className="space-y-4">
        {APGAR_ITEM_KEYS.map((itemKey) => {
          const item = capurroConfig.apgar.items[itemKey];
          const valorAtual = reg?.pontuacoes[itemKey];
          return (
            <div key={itemKey}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{item.label}</p>
              <div className="grid grid-cols-3 gap-2">
                {item.options.map((opt) => (
                  <OptionCard
                    key={opt.score}
                    asset={opt.asset}
                    label={opt.label}
                    score={opt.score}
                    selected={valorAtual === opt.score}
                    onSelect={() => onSetItem(minuto, itemKey, opt.score as ApgarScore)}
                    variant="apgar"
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Manobras de reanimação registradas neste minuto
          </p>
          <div className="flex flex-wrap gap-2">
            {intervencoes.map((interv) => {
              const checked = reg?.intervencoes.includes(interv) ?? false;
              return (
                <button
                  key={interv}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    checked
                      ? 'border-clinical-600 bg-clinical-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-clinical-400'
                  }`}
                  onClick={() => onToggleIntervencao(minuto, interv)}
                  aria-pressed={checked}
                >
                  {interv}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-slate-500">
            Documentação clínica das manobras realizadas — não condiciona pontuação do Apgar.
          </p>
        </div>

        {!completo && (
          <p className="text-xs font-medium text-danger-700">
            Pontue todos os 5 sinais para concluir este minuto.
          </p>
        )}
      </div>
    </SectionCard>
  );
}

export default function Apgar() {
  return (
    <RequireModes allowed={['completa', 'apgar']}>
      <ApgarPage />
    </RequireModes>
  );
}
