import { Layout } from '@/components/common/Layout';
import { StepNav } from '@/components/common/StepNav';
import { Alert } from '@/components/common/Alert';
import { RequireModes, useEvaluationMode } from '@/hooks/useEvaluationMode';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import {
  getCapurroMetodoBack,
  getCapurroMetodoNext,
  getStepNumber,
  getTotalSteps,
} from '@/utils/evaluationFlow';
import { capurroConfig } from '@/data/config';
import type { CapurroMethod } from '@/types/domain';
import { Brain, Hand, Check, Sparkles } from 'lucide-react';

function CapurroMetodoPage() {
  const modo = useEvaluationMode();
  const metodo = useEvaluationStore((s) => s.capurro.metodo);
  const setMetodo = useEvaluationStore((s) => s.setCapurroMetodo);

  return (
    <Layout>
      <StepNav
        step={getStepNumber('capurro_metodo', modo)}
        totalSteps={getTotalSteps(modo)}
        title="Método de Capurro"
        subtitle="Selecione o método para estimar a idade gestacional. A escolha define os parâmetros que serão avaliados na próxima tela."
        backTo={getCapurroMetodoBack(modo)}
        nextTo={getCapurroMetodoNext()}
        nextDisabled={!metodo}
      />

      <div className="space-y-4">
        <MetodoCard
          metodo="capurro_somatico"
          selected={metodo === 'capurro_somatico'}
          onSelect={() => setMetodo('capurro_somatico')}
          icon={<Hand className="h-7 w-7" aria-hidden />}
          itens={['orelha', 'glandula_mamaria', 'mamilo', 'pele', 'pregas_plantares']}
          formula="IG dias = soma dos pontos + 204"
          descricao="Estimativa por 5 características físicas. Ideal quando avaliação neurológica não é segura ou prática."
          gradient="from-emerald-500 to-teal-600"
          accent="emerald"
        />
        <MetodoCard
          metodo="capurro_somatoneurologico"
          selected={metodo === 'capurro_somatoneurologico'}
          onSelect={() => setMetodo('capurro_somatoneurologico')}
          icon={<Brain className="h-7 w-7" aria-hidden />}
          itens={['orelha', 'glandula_mamaria', 'pele', 'pregas_plantares', 'xale', 'cabeca']}
          formula="IG dias = soma dos pontos + 200"
          descricao="Inclui sinal do xale e posição da cabeça. Recomendado quando o RN permite avaliação neurológica segura."
          gradient="from-violet-500 to-purple-600"
          accent="violet"
        />

        <Alert severity="info" title="Configurabilidade institucional">
          A pontuação final do <strong>sinal do xale</strong> (16 ou 18 pontos) é configurável
          conforme protocolo do serviço. Padrão deste app: <strong>16</strong>, conforme Caderno de
          Atenção à Saúde da Criança/PR.
        </Alert>
      </div>
    </Layout>
  );
}

export default function CapurroMetodo() {
  return (
    <RequireModes allowed={['completa', 'capurro_peso']}>
      <CapurroMetodoPage />
    </RequireModes>
  );
}

function MetodoCard({
  metodo,
  selected,
  onSelect,
  icon,
  itens,
  formula,
  descricao,
  gradient,
  accent,
}: {
  metodo: CapurroMethod;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  itens: string[];
  formula: string;
  descricao: string;
  gradient: string;
  accent: string;
}) {
  const cfg = capurroConfig.methods[metodo];

  // Mapeamento de cores fixas (Tailwind JIT não suporta classes dinâmicas)
  const iconBg: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
  };
  const chipBg: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  const formulaBg: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  const shadowColor: Record<string, string> = {
    emerald: 'shadow-emerald-500/30',
    violet: 'shadow-violet-500/30',
  };

  return (
    <button
      type="button"
      className={`group relative w-full overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 ${
        selected
          ? `border-transparent bg-gradient-to-br ${gradient} text-white shadow-lg ${shadowColor[accent]} scale-[1.01]`
          : 'border-violet-100 bg-white hover:border-violet-300 hover:shadow-md'
      }`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {/* Fundo decorativo quando selecionado */}
      {selected && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      )}
      {selected && (
        <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
      )}

      <div className="relative flex items-start gap-4">
        {/* Ícone */}
        <span
          className={`grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl transition-all duration-300 ${
            selected
              ? 'bg-white/20 text-white shadow-inner'
              : iconBg[accent]
          }`}
        >
          {icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className={`text-lg font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>
                {cfg.label}
              </h2>
              {selected && (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                  <Sparkles className="h-3 w-3" /> Selecionado
                </span>
              )}
            </div>
            {selected && (
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-white text-violet-600 shadow-sm">
                <Check className="h-4 w-4" aria-hidden />
              </span>
            )}
          </div>

          <p className={`mt-1.5 text-sm leading-relaxed ${selected ? 'text-white/90' : 'text-slate-600'}`}>
            {descricao}
          </p>

          {/* Chips de parâmetros */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {itens.map((it) => (
              <span
                key={it}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  selected
                    ? 'bg-white/20 text-white'
                    : chipBg[accent]
                }`}
              >
                {capurroConfig.items[it as keyof typeof capurroConfig.items]?.label ?? it}
              </span>
            ))}
          </div>

          {/* Fórmula */}
          <div
            className={`mt-3 inline-block rounded-lg px-3 py-1.5 font-mono text-xs font-semibold ${
              selected
                ? 'bg-white/20 text-white'
                : formulaBg[accent]
            }`}
          >
            {formula}
          </div>
        </div>
      </div>
    </button>
  );
}
