import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Printer, RotateCcw, FileText, Stethoscope, Pencil, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Layout } from '@/components/common/Layout';
import { Alert } from '@/components/common/Alert';
import { RequireMode, useEvaluationMode } from '@/hooks/useEvaluationMode';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import { capurroConfig } from '@/data/config';
import {
  getRelatorioBack,
  getRelatorioTitle,
  MODE_LABELS,
  showsApgarInReport,
  showsCapurroInReport,
  showsGrowthInReport,
} from '@/utils/evaluationFlow';
import type { EvaluationMode } from '@/types/domain';
import { calcularCapurro } from '@/services/capurroCalculator';
import { calcularApgarMinuto, isApgarMinutoCompleto } from '@/services/apgarCalculator';
import { classificarPesoPorIdadeGestacional } from '@/services/growthClassifier';
import { buildClinicalAlerts } from '@/services/clinicalAlerts';
import { gerarTextoEvolucao } from '@/services/evolucaoEnfermagem';
import type { ApgarMinute } from '@/types/domain';

const MINUTOS: ApgarMinute[] = [1, 5, 10, 15, 20];

function RelatorioPage() {
  const navigate = useNavigate();
  const modo = useEvaluationMode();
  const rn = useEvaluationStore((s) => s.rn);
  const apgar = useEvaluationStore((s) => s.apgar);
  const capurroState = useEvaluationStore((s) => s.capurro);
  const evolucao = useEvaluationStore((s) => s.evolucao);
  const reset = useEvaluationStore((s) => s.reset);
  const [copiado, setCopiado] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const artigoRef = useRef<HTMLElement>(null);

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
  const apgar1 = apgarResultados[0] ?? undefined;
  const alerts = buildClinicalAlerts({
    rn,
    capurro: capurro ?? undefined,
    growth: growth ?? undefined,
    apgar5min: apgar5,
  });

  const textoEvolucao = useMemo(() => {
    if (!evolucao) return null;
    return gerarTextoEvolucao({
      rn,
      capurro,
      growth,
      apgar1min: apgar1,
      apgar5min: apgar5,
      evolucao,
    });
  }, [rn, capurro, growth, apgar1, apgar5, evolucao]);

  const texto = useMemo(
    () => buildReportText({ modo, rn, apgarResultados, capurro, growth, textoEvolucao }),
    [modo, rn, apgarResultados, capurro, growth, textoEvolucao],
  );

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

  async function handlePDF() {
    if (!artigoRef.current || gerandoPDF) return;
    setGerandoPDF(true);
    try {
      const el = artigoRef.current;
      const nomeArquivo = `avaliacao-neonatal-${rn.identificacao || 'rn'}-${new Date().toISOString().slice(0, 10)}.pdf`;
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: nomeArquivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save();
    } finally {
      setGerandoPDF(false);
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
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-600">
            <FileText className="h-4 w-4" aria-hidden /> Relatório final
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {getRelatorioTitle(modo)}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {MODE_LABELS[modo]} — documento de apoio clínico SBP 2022. Não substitui prontuário
            oficial.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-4 no-print">
        <button onClick={handleCopy} className="btn-secondary">
          <Copy className="h-4 w-4" aria-hidden />
          {copiado ? 'Copiado!' : 'Copiar texto do relatório'}
        </button>
        <button onClick={handlePDF} disabled={gerandoPDF} className="btn-primary">
          {gerandoPDF ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Printer className="h-4 w-4" aria-hidden />
          )}
          {gerandoPDF ? 'Gerando PDF...' : 'Gerar PDF'}
        </button>
      </div>

      <article ref={artigoRef} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
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

        {showsApgarInReport(modo) && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
              Boletim de Apgar ampliado
            </h2>
            <ApgarTabela resultados={apgarResultados} apgar={apgar} />
          </section>
        )}

        {showsCapurroInReport(modo) && (
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
        )}

        {showsGrowthInReport(modo) && (
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
        )}

        {textoEvolucao && (
          <section className="mb-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
              <Stethoscope className="h-4 w-4 text-violet-600" aria-hidden />
              Evolução de Enfermagem do RN
            </h2>
            <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed">
                {textoEvolucao}
              </pre>
            </div>
          </section>
        )}

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
        <button onClick={() => navigate(getRelatorioBack(modo))} className="btn-secondary">
          Voltar
        </button>
        {evolucao && (
          <button onClick={() => navigate('/evolucao/enfermagem')} className="btn-secondary">
            <Pencil className="h-4 w-4" aria-hidden />
            Editar evolução
          </button>
        )}
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

export default function Relatorio() {
  return (
    <RequireMode>
      <RelatorioPage />
    </RequireMode>
  );
}

function buildReportText({
  modo,
  rn,
  apgarResultados,
  capurro,
  growth,
  textoEvolucao,
}: {
  modo: EvaluationMode;
  rn: ReturnType<typeof useEvaluationStore.getState>['rn'];
  apgarResultados: (ReturnType<typeof calcularApgarMinuto> | null)[];
  capurro: ReturnType<typeof calcularCapurro> | null;
  growth: ReturnType<typeof classificarPesoPorIdadeGestacional> | null;
  textoEvolucao: string | null;
}): string {
  const linhas: string[] = [];
  linhas.push(`${getRelatorioTitle(modo)} — SBP 2022`);
  linhas.push(`Módulo: ${MODE_LABELS[modo]}`);
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

  if (showsApgarInReport(modo)) {
    linhas.push('Boletim de Apgar ampliado:');
    MINUTOS.forEach((m, idx) => {
      const r = apgarResultados[idx];
      linhas.push(`  ${m}º min: ${r ? r.total : 'não registrado'}`);
    });
    linhas.push('');
  }

  if (showsCapurroInReport(modo) && capurro) {
    linhas.push(`Método: ${capurroConfig.methods[capurro.metodo].label}`);
    linhas.push(`Pontuação total: ${capurro.somaPontos} pontos`);
    linhas.push(
      `Idade gestacional estimada: ${capurro.idadeGestacionalSemanasCompletas} semanas e ${capurro.idadeGestacionalDiasRestantes} dias`,
    );
    linhas.push(`Idade gestacional decimal: ${capurro.idadeGestacionalSemanasDecimal} semanas`);
    linhas.push(`Classificação por IG: ${capurro.classificacaoTermo}`);
    linhas.push('');
  }

  if (showsGrowthInReport(modo) && growth && growth.status === 'ok') {
    linhas.push(`Curva utilizada: ${growth.referencia}`);
    linhas.push(`Classificação peso/IG: ${growth.classificacao}`);
    linhas.push(`Percentil estimado: ${growth.percentilEstimado}`);
    linhas.push('');
  }

  if (textoEvolucao) {
    linhas.push('--- Evolução de Enfermagem do RN ---');
    linhas.push('');
    linhas.push(textoEvolucao);
    linhas.push('');
  }

  if (modo === 'apgar') {
    linhas.push(
      'Observação: O Apgar não decide reanimação — segue avaliação imediata e diretrizes SBP 2022.',
    );
  } else {
    linhas.push(
      'Observação: O método de Capurro é uma estimativa clínica e deve ser correlacionado com DUM, ultrassonografia precoce, avaliação neonatal e protocolo institucional.',
    );
    if (modo === 'completa') {
      linhas.push(
        'O Apgar não decide reanimação — segue avaliação imediata e diretrizes SBP 2022.',
      );
    }
  }
  return linhas.join('\n');
}
