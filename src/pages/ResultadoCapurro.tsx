import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Clock, FlaskConical } from 'lucide-react';
import { Layout } from '@/components/common/Layout';
import { StepNav } from '@/components/common/StepNav';
import { Alert } from '@/components/common/Alert';
import { SectionCard } from '@/components/common/SectionCard';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import { capurroConfig } from '@/data/config';
import { calcularCapurro } from '@/services/capurroCalculator';
import { buildClinicalAlerts } from '@/services/clinicalAlerts';

export default function ResultadoCapurro() {
  const metodo = useEvaluationStore((s) => s.capurro.metodo);
  const respostas = useEvaluationStore((s) => s.capurro.respostas);
  const rn = useEvaluationStore((s) => s.rn);

  const resultado = useMemo(() => {
    if (!metodo) return null;
    try {
      return calcularCapurro({ metodo, respostas, config: capurroConfig });
    } catch {
      return null;
    }
  }, [metodo, respostas]);

  if (!metodo || !resultado) {
    return <Navigate to="/capurro/metodo" replace />;
  }

  const alerts = buildClinicalAlerts({ rn, capurro: resultado });
  const metodoLabel = capurroConfig.methods[metodo].label;
  const corClassificacao =
    resultado.classificacaoTermo === 'A termo'
      ? 'bg-success-100 text-success-700'
      : resultado.classificacaoTermo === 'Pré-termo'
        ? 'bg-warning-100 text-warning-700'
        : 'bg-clinical-100 text-clinical-700';

  return (
    <Layout>
      <StepNav
        step={5}
        totalSteps={6}
        title="Resultado — Capurro"
        subtitle="Idade gestacional estimada e classificação por idade gestacional."
        backTo="/capurro/parametros"
        nextTo="/resultado/peso"
      />

      <div className="space-y-4">
        <SectionCard
          title="Idade gestacional estimada"
          description={`Método utilizado: ${metodoLabel}`}
          rightSlot={<span className={`badge ${corClassificacao}`}>{resultado.classificacaoTermo}</span>}
        >
          <div className="grid grid-cols-3 gap-3">
            <BigStat
              icon={<FlaskConical className="h-4 w-4" aria-hidden />}
              label="Pontos"
              value={String(resultado.somaPontos)}
            />
            <BigStat
              icon={<Calendar className="h-4 w-4" aria-hidden />}
              label="Semanas + dias"
              value={resultado.idadeGestacionalLabel}
              accent
            />
            <BigStat
              icon={<Clock className="h-4 w-4" aria-hidden />}
              label="Decimal"
              value={`${resultado.idadeGestacionalSemanasDecimal} sem`}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <InfoLine label="IG em dias" value={`${resultado.idadeGestacionalDias} dias`} />
            <InfoLine
              label="Semanas completas"
              value={`${resultado.idadeGestacionalSemanasCompletas} sem`}
            />
            <InfoLine
              label="Constante da fórmula"
              value={`+${capurroConfig.methods[metodo].constant_days} dias`}
            />
            <InfoLine
              label="Classificação"
              value={resultado.classificacaoTermo}
            />
          </div>
        </SectionCard>

        <Alert severity="info" title="Margem de erro clínica">
          O método de Capurro é uma estimativa clínica. Correlacione com DUM, ultrassonografia
          precoce e avaliação neonatal completa. Diferenças de poucas semanas podem alterar a
          classificação.
        </Alert>

        {alerts.map((a) => (
          <Alert key={a.id} severity={a.severity} title={a.title}>
            {a.message}
          </Alert>
        ))}
      </div>
    </Layout>
  );
}

function BigStat({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        accent ? 'border-clinical-300 bg-clinical-50' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p className="mb-1 flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <p
        className={`text-lg font-bold tabular-nums sm:text-xl ${
          accent ? 'text-clinical-800' : 'text-slate-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
