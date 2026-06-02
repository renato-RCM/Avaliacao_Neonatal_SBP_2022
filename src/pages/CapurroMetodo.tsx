import { Layout } from '@/components/common/Layout';
import { StepNav } from '@/components/common/StepNav';
import { Alert } from '@/components/common/Alert';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import { capurroConfig } from '@/data/config';
import type { CapurroMethod } from '@/types/domain';
import { Brain, Hand, Check } from 'lucide-react';

export default function CapurroMetodo() {
  const metodo = useEvaluationStore((s) => s.capurro.metodo);
  const setMetodo = useEvaluationStore((s) => s.setCapurroMetodo);

  return (
    <Layout>
      <StepNav
        step={3}
        totalSteps={6}
        title="Método de Capurro"
        subtitle="Selecione o método para estimar a idade gestacional. A escolha define os parâmetros que serão avaliados na próxima tela."
        backTo="/apgar"
        nextTo="/capurro/parametros"
        nextDisabled={!metodo}
      />

      <div className="space-y-3">
        <MetodoCard
          metodo="capurro_somatico"
          selected={metodo === 'capurro_somatico'}
          onSelect={() => setMetodo('capurro_somatico')}
          icon={<Hand className="h-6 w-6" aria-hidden />}
          itens={['orelha', 'glandula_mamaria', 'mamilo', 'pele', 'pregas_plantares']}
          formula="IG dias = soma dos pontos + 204"
          descricao="Estimativa por 5 características físicas. Ideal quando avaliação neurológica não é segura ou prática."
        />
        <MetodoCard
          metodo="capurro_somatoneurologico"
          selected={metodo === 'capurro_somatoneurologico'}
          onSelect={() => setMetodo('capurro_somatoneurologico')}
          icon={<Brain className="h-6 w-6" aria-hidden />}
          itens={['orelha', 'glandula_mamaria', 'pele', 'pregas_plantares', 'xale', 'cabeca']}
          formula="IG dias = soma dos pontos + 200"
          descricao="Inclui sinal do xale e posição da cabeça. Recomendado quando o RN permite avaliação neurológica segura."
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

function MetodoCard({
  metodo,
  selected,
  onSelect,
  icon,
  itens,
  formula,
  descricao,
}: {
  metodo: CapurroMethod;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  itens: string[];
  formula: string;
  descricao: string;
}) {
  const cfg = capurroConfig.methods[metodo];
  return (
    <button
      type="button"
      className={`card-clickable !p-5 text-left ${selected ? 'card-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl ${
            selected ? 'bg-clinical-600 text-white' : 'bg-clinical-100 text-clinical-700'
          }`}
        >
          {icon}
        </span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">{cfg.label}</h2>
            {selected && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-clinical-600 text-white">
                <Check className="h-4 w-4" aria-hidden />
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">{descricao}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {itens.map((it) => (
              <span
                key={it}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {capurroConfig.items[it as keyof typeof capurroConfig.items]?.label ?? it}
              </span>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-clinical-700">{formula}</p>
        </div>
      </div>
    </button>
  );
}
