import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Printer, RotateCcw, FileText } from 'lucide-react';
import { Layout } from '@/components/common/Layout';
import { Alert } from '@/components/common/Alert';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import { capurroConfig } from '@/data/config';
import { calcularCapurro } from '@/services/capurroCalculator';
import { calcularApgarMinuto, isApgarMinutoCompleto } from '@/services/apgarCalculator';
import { classificarPesoPorIdadeGestacional } from '@/services/growthClassifier';
import { buildClinicalAlerts } from '@/services/clinicalAlerts';
import type { ApgarMinute } from '@/types/domain';

const MINUTOS: ApgarMinute[] = [1, 5, 10, 15, 20];

export default function Relatorio() {
  const navigate = useNavigate();
  const rn = useEvaluationStore((s) => s.rn);
  const apgar = useEvaluationStore((s) => s.apgar);
  const capurroState = useEvaluationStore((s) => s.capurro);
  const reset = useEvaluationStore((s) => s.reset);
  const [copiado, setCopiado] = useState(false);

  const apgarResultados = useMemo(() => {
    return MINUTOS.map((m) => {
      const reg = apgar.registros[m];
      if (!reg || !isApgarMinutoCompleto(reg)) return null;
      try {
        return calcularApgarMinuto(reg);
      } catch {
        return null;
      }
    });
  }, [apgar]);

  const capurro = useMemo(() => {
    if (!capurroState.metodo) return null;
    try {
      return calcularCapurro({
        metodo: capurroState.metodo,
        respostas: capurroState.respostas,
        config: capurroConfig,
      });
    } catch {
      return null;
    }
  }, [capurroState]);

  const growth =
    capurro && rn.sexo && rn.pesoGramas
      ? classificarPesoPorIdadeGestacional({
          pesoGramas: rn.pesoGramas,
          sexo: rn.sexo,
          idadeDias: capurro.idadeGestacionalDias,
        })
      : null;

  const apgar5 = apgarResultados[1] ?? undefined;
  const alerts = buildClinicalAlerts({
    rn,
    capurro: capurro ?? undefined,
    growth: growth ?? undefined,
    apgar5min: apgar5,
  });

  const texto = useMemo(() => buildReportText({ rn, apgarResultados, capurro, growth }), [
    rn,
    apgarResultados,
    capurro,
    growth,
  ]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  function handleNova() {
    reset();
    navigate('/');
  }

  return (
    <Layout showPrint>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-clinical-700">
            <FileText className="h-4 w-4" aria-hidden /> Relatório final
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Avaliação neonatal
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Documento de apoio clínico — SBP 2022. Não substitui prontuário oficial.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-4 no-print">
        <button onClick={handleCopy} className="btn-secondary">
          <Copy className="h-4 w-4" aria-hidden />
          {copiado ? 'Copiado!' : 'Copiar texto do relatório'}
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="h-4 w-4" aria-hidden />
          Imprimir / salvar PDF
        </button>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <header className="mb-4 border-b border-slate-200 pb-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Identificação</p>
          <p className="text-base font-semibold text-slate-900">
            {rn.identificacao || 'RN (anônimo)'}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            {rn.sexo === 'M' ? 'Masculino' : rn.sexo === 'F' ? 'Feminino' : 'Sexo não informado'} ·{' '}
            {rn.pesoGramas ? `${rn.pesoGramas} g` : 'peso não informado'}
            {rn.dataHoraNascimento
              ? ` · ${new Date(rn.dataHoraNascimento).toLocaleString('pt-BR')}`
              : ''}
            {rn.avaliador ? ` · Avaliador: ${rn.avaliador}` : ''}
          </p>
        </header>

        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            Boletim de Apgar ampliado
          </h2>
          <ApgarTabela resultados={apgarResultados} apgar={apgar} />
        </section>

        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            Idade gestacional (Capurro)
          </h2>
          {capurro ? (
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <ReportLine label="Método" value={capurroConfig.methods[capurro.metodo].label} />
              <ReportLine label="Pontos" value={String(capurro.somaPontos)} />
              <ReportLine label="IG (s+d)" value={capurro.idadeGestacionalLabel} />
              <ReportLine
                label="IG decimal"
                value={`${capurro.idadeGestacionalSemanasDecimal} sem`}
              />
              <ReportLine label="IG dias" value={`${capurro.idadeGestacionalDias} dias`} />
              <ReportLine label="Classificação" value={capurro.classificacaoTermo} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Capurro não calculado.</p>
          )}
        </section>

        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            Peso × Idade gestacional
          </h2>
          {growth && growth.status === 'ok' ? (
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <ReportLine label="Classificação" value={growth.classificacao ?? '—'} />
              <ReportLine label="Percentil" value={growth.percentilEstimado ?? '—'} />
              <ReportLine label="Peso" value={`${rn.pesoGramas} g`} />
              <ReportLine label="Curva" value={growth.referencia ?? '—'} />
              <ReportLine label="P10" value={`${growth.p10_kg?.toFixed(3)} kg`} />
              <ReportLine label="P50" value={`${growth.p50_kg?.toFixed(3)} kg`} />
              <ReportLine label="P90" value={`${growth.p90_kg?.toFixed(3)} kg`} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">{growth?.message ?? 'Não classificado.'}</p>
          )}
        </section>

        {alerts.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
              Alertas clínicos
            </h2>
            <ul className="space-y-1 text-sm text-slate-700">
              {alerts.map((a) => (
                <li key={a.id}>
                  <strong>{a.title}:</strong> {a.message}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500">
          <p>
            <strong>Observação clínica:</strong> O método de Capurro é uma estimativa clínica e
            deve ser correlacionado com DUM, ultrassonografia precoce, avaliação neonatal e
            protocolo institucional. O Apgar não decide reanimação — segue avaliação imediata e
            diretrizes SBP 2022.
          </p>
          <p className="mt-1">
            Conformidade: Diretrizes SBP 2022 (Reanimação ≥34 e &lt;34 sem) e Documento Científico
            SBP nº 33/2022 (PIG).
          </p>
        </footer>
      </article>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 no-print">
        <button onClick={() => navigate('/resultado/peso')} className="btn-secondary">
          Voltar
        </button>
        <button onClick={handleNova} className="btn-primary">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Nova avaliação
        </button>
      </div>

      <div className="mt-4 no-print">
        <Alert severity="info">
          O texto também pode ser copiado e colado em prontuário eletrônico ou impresso/salvo em PDF.
        </Alert>
      </div>
    </Layout>
  );
}

function ReportLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ApgarTabela({
  resultados,
  apgar,
}: {
  resultados: (ReturnType<typeof calcularApgarMinuto> | null)[];
  apgar: { registros: { [k in ApgarMinute]?: { intervencoes: string[] } } };
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-2">Min</th>
            <th className="px-3 py-2 text-center">Apgar</th>
            <th className="px-3 py-2">Intervenções</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MINUTOS.map((m, idx) => {
            const r = resultados[idx];
            const intervs = apgar.registros[m]?.intervencoes ?? [];
            return (
              <tr key={m} className={r ? '' : 'text-slate-400'}>
                <td className="px-3 py-2 font-semibold">{m}'</td>
                <td className="px-3 py-2 text-center font-bold tabular-nums">
                  {r ? r.total : '—'}
                </td>
                <td className="px-3 py-2 text-xs">
                  {intervs.length > 0 ? intervs.join(', ') : 'Nenhuma'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function buildReportText({
  rn,
  apgarResultados,
  capurro,
  growth,
}: {
  rn: ReturnType<typeof useEvaluationStore.getState>['rn'];
  apgarResultados: (ReturnType<typeof calcularApgarMinuto> | null)[];
  capurro: ReturnType<typeof calcularCapurro> | null;
  growth: ReturnType<typeof classificarPesoPorIdadeGestacional> | null;
}): string {
  const linhas: string[] = [];
  linhas.push('Resultado da avaliação neonatal — SBP 2022');
  linhas.push('');
  linhas.push(`Identificação: ${rn.identificacao || 'RN (anônimo)'}`);
  linhas.push(
    `Sexo: ${rn.sexo === 'M' ? 'Masculino' : rn.sexo === 'F' ? 'Feminino' : 'Não informado'}`,
  );
  linhas.push(`Peso ao nascer: ${rn.pesoGramas ? `${rn.pesoGramas} g` : 'Não informado'}`);
  if (rn.dataHoraNascimento)
    linhas.push(`Nascimento: ${new Date(rn.dataHoraNascimento).toLocaleString('pt-BR')}`);
  if (rn.avaliador) linhas.push(`Avaliador: ${rn.avaliador}`);
  linhas.push('');

  linhas.push('Boletim de Apgar ampliado:');
  MINUTOS.forEach((m, idx) => {
    const r = apgarResultados[idx];
    linhas.push(`  ${m}º min: ${r ? r.total : 'não registrado'}`);
  });
  linhas.push('');

  if (capurro) {
    linhas.push(`Método: ${capurroConfig.methods[capurro.metodo].label}`);
    linhas.push(`Pontuação total: ${capurro.somaPontos} pontos`);
    linhas.push(
      `Idade gestacional estimada: ${capurro.idadeGestacionalSemanasCompletas} semanas e ${capurro.idadeGestacionalDiasRestantes} dias`,
    );
    linhas.push(`Idade gestacional decimal: ${capurro.idadeGestacionalSemanasDecimal} semanas`);
    linhas.push(`Classificação por IG: ${capurro.classificacaoTermo}`);
    linhas.push('');
  }

  if (growth && growth.status === 'ok') {
    linhas.push(`Curva utilizada: ${growth.referencia}`);
    linhas.push(`Classificação peso/IG: ${growth.classificacao}`);
    linhas.push(`Percentil estimado: ${growth.percentilEstimado}`);
    linhas.push('');
  }

  linhas.push(
    'Observação: O método de Capurro é uma estimativa clínica e deve ser correlacionado com DUM, ultrassonografia precoce, avaliação neonatal e protocolo institucional.',
  );
  return linhas.join('\n');
}
