import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { StepNav } from '@/components/common/StepNav';
import { Alert } from '@/components/common/Alert';
import { SectionCard } from '@/components/common/SectionCard';
import { OptionCard } from '@/components/common/OptionCard';
import { RequireModes, useEvaluationMode } from '@/hooks/useEvaluationMode';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import {
  getCapurroParametrosBack,
  getCapurroParametrosNext,
  getStepNumber,
  getTotalSteps,
} from '@/utils/evaluationFlow';
import { capurroConfig } from '@/data/config';
import type { CapurroItemKey } from '@/types/domain';

const ITEM_GUIDANCE: Record<CapurroItemKey, string> = {
  orelha:
    'Observe sem tocar. Avalie a curvatura do bordo superior. Não usar orelha achatada pela posição do nascimento.',
  glandula_mamaria:
    'Pince levemente o tecido subcutâneo adjacente para diferenciar tecido mamário e medir o diâmetro do nódulo.',
  mamilo:
    'Observe ambos os mamilos e meça o diâmetro da aréola. Verifique pontilhado e elevação de borda.',
  pele:
    'Palpe e examine antebraços, mãos, pernas e pés. Observe descamação dorsal e profundidade de rachaduras.',
  pregas_plantares:
    'Hiperestenda a pele para diferenciar pregas (somem) de sulcos (permanecem marcados).',
  xale:
    'Com o RN em decúbito dorsal, leve a mão/braço em direção ao ombro contralateral. Não force a articulação.',
  cabeca:
    'Avalie o controle/tônus cervical ao levantar suavemente o RN, observando o ângulo entre cabeça e tronco.',
};

function CapurroParametrosPage() {
  const modo = useEvaluationMode();
  const metodo = useEvaluationStore((s) => s.capurro.metodo);
  const respostas = useEvaluationStore((s) => s.capurro.respostas);
  const setResposta = useEvaluationStore((s) => s.setCapurroResposta);

  if (!metodo) {
    return <Navigate to="/capurro/metodo" replace />;
  }

  const metodoCfg = capurroConfig.methods[metodo];
  const itens = metodoCfg.items;

  const somaParcial = useMemo(() => {
    return itens.reduce((acc, it) => acc + (respostas[it] !== undefined ? Number(respostas[it]) : 0), 0);
  }, [itens, respostas]);

  const totalRespondidos = itens.filter((i) => respostas[i] !== undefined).length;
  const completo = totalRespondidos === itens.length;
  const projecaoDias = somaParcial + metodoCfg.constant_days;

  return (
    <Layout>
      <StepNav
        step={getStepNumber('capurro_parametros', modo)}
        totalSteps={getTotalSteps(modo)}
        title={metodoCfg.label}
        subtitle="Selecione uma opção em cada parâmetro. A pontuação aparece em tempo real."
        backTo={getCapurroParametrosBack()}
        nextTo={getCapurroParametrosNext()}
        nextDisabled={!completo}
      />

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-violet-100 bg-white p-3 shadow-card">
        <Stat label="Itens" value={`${totalRespondidos}/${itens.length}`} />
        <Stat label="Soma de pontos" value={`${somaParcial}`} />
        <Stat
          label="IG estimada"
          value={`${Math.floor(projecaoDias / 7)}+${projecaoDias % 7}`}
          highlight={completo}
        />
      </div>

      <div className="space-y-4">
        {itens.map((itemKey) => {
          const item = capurroConfig.items[itemKey];
          const valor = respostas[itemKey];
          return (
            <SectionCard
              key={itemKey}
              title={item.label}
              description={ITEM_GUIDANCE[itemKey]}
              badge={
                valor !== undefined ? (
                  <span className="badge bg-violet-600 text-white shadow-sm">{valor} pontos</span>
                ) : (
                  <span className="badge bg-violet-50 text-violet-600">Pendente</span>
                )
              }
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {item.options.map((opt) => (
                  <OptionCard
                    key={opt.score}
                    asset={opt.asset}
                    label={opt.label}
                    score={opt.score}
                    note={opt.note}
                    selected={valor === opt.score}
                    onSelect={() => setResposta(itemKey, opt.score)}
                  />
                ))}
              </div>
            </SectionCard>
          );
        })}

        {!completo && (
          <Alert severity="info">
            Selecione uma opção em cada um dos {itens.length} parâmetros para calcular a idade
            gestacional.
          </Alert>
        )}
      </div>
    </Layout>
  );
}

export default function CapurroParametros() {
  return (
    <RequireModes allowed={['completa', 'capurro_peso']}>
      <CapurroParametrosPage />
    </RequireModes>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`text-lg font-bold tabular-nums sm:text-xl ${
          highlight ? 'text-clinical-700' : 'text-slate-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
