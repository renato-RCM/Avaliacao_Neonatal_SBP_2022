import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { StepNav } from '@/components/common/StepNav';
import { Alert } from '@/components/common/Alert';
import { SectionCard } from '@/components/common/SectionCard';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import { capurroConfig } from '@/data/config';
import { calcularCapurro } from '@/services/capurroCalculator';
import { classificarPesoPorIdadeGestacional } from '@/services/growthClassifier';
import { buildClinicalAlerts } from '@/services/clinicalAlerts';
import { GrowthChart } from '@/components/growth/GrowthChart';

export default function ResultadoPeso() {
  const metodo = useEvaluationStore((s) => s.capurro.metodo);
  const respostas = useEvaluationStore((s) => s.capurro.respostas);
  const rn = useEvaluationStore((s) => s.rn);

  const capurro = useMemo(() => {
    if (!metodo) return null;
    try {
      return calcularCapurro({ metodo, respostas, config: capurroConfig });
    } catch {
      return null;
    }
  }, [metodo, respostas]);

  if (!metodo || !capurro) {
    return <Navigate to="/capurro/metodo" replace />;
  }
  if (!rn.sexo || !rn.pesoGramas) {
    return <Navigate to="/cadastro" replace />;
  }

  const growth = classificarPesoPorIdadeGestacional({
    pesoGramas: rn.pesoGramas,
    sexo: rn.sexo,
    idadeDias: capurro.idadeGestacionalDias,
  });

  const alerts = buildClinicalAlerts({ rn, capurro, growth });

  const cor =
    growth.classificacao === 'AIG'
      ? 'bg-success-100 text-success-700'
      : growth.classificacao === 'PIG'
        ? 'bg-warning-100 text-warning-700'
        : 'bg-clinical-100 text-clinical-700';

  return (
    <Layout>
      <StepNav
        step={6}
        totalSteps={6}
        title="Peso × idade gestacional"
        subtitle="Classificação PIG/AIG/GIG conforme SBP 2022."
        backTo="/resultado/capurro"
        nextTo="/relatorio"
        nextLabel="Ver relatório"
        isFinal
      />

      <div className="space-y-4">
        {growth.status === 'ok' ? (
          <SectionCard
            title={`Classificação: ${growth.classificacao}`}
            description={`Curva: ${growth.referencia}. ${
              growth.classificacao === 'PIG'
                ? 'Peso ao nascer abaixo do P10 para a IG e sexo.'
                : growth.classificacao === 'GIG'
                  ? 'Peso ao nascer acima do P90 para a IG e sexo.'
                  : 'Peso ao nascer entre P10 e P90 — adequado para a IG e sexo.'
            }`}
            badge={<span className={`badge text-sm ${cor}`}>{growth.classificacao}</span>}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Peso ao nascer" value={`${rn.pesoGramas} g`} highlight />
              <Stat label="Sexo" value={rn.sexo === 'M' ? 'Masculino' : 'Feminino'} />
              <Stat label="IG" value={capurro.idadeGestacionalLabel} />
              <Stat label="Percentil" value={growth.percentilEstimado ?? '—'} highlight />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center text-sm">
              <Ref label="P10" value={`${growth.p10_kg?.toFixed(3)} kg`} color="text-danger-700" />
              <Ref label="P50" value={`${growth.p50_kg?.toFixed(3)} kg`} color="text-clinical-700" />
              <Ref label="P90" value={`${growth.p90_kg?.toFixed(3)} kg`} color="text-success-700" />
            </div>

            <div className="mt-4">
              <GrowthChart
                sexo={rn.sexo}
                pesoGramas={rn.pesoGramas}
                idadeDias={capurro.idadeGestacionalDias}
                source={growth.referencia ?? 'INTERGROWTH-21st Newborn Size Standards'}
              />
            </div>
          </SectionCard>
        ) : (
          <Alert severity="danger" title="Não foi possível classificar">
            {growth.message}
          </Alert>
        )}

        {alerts.map((a) => (
          <Alert key={a.id} severity={a.severity} title={a.title}>
            {a.message}
          </Alert>
        ))}

        <Alert severity="info" title="Recomendação SBP 2022">
          Para classificar tamanho ao nascimento, esta tela usa{' '}
          <strong>INTERGROWTH-21st (33+0 a 42+6)</strong> e <strong>Fenton &amp; Kim (&lt;33+0)</strong>.
          Curvas de crescimento intrauterino/fetal não são a melhor opção para avaliar tamanho ao
          nascimento.
        </Alert>
      </div>
    </Layout>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-1 text-sm font-bold tabular-nums sm:text-base ${
          highlight ? 'text-clinical-700' : 'text-slate-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Ref({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className={`text-xs font-semibold ${color}`}>{label}</p>
      <p className="font-mono text-xs text-slate-700">{value}</p>
    </div>
  );
}
