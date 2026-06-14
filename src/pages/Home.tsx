import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Baby,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Heart,
  LineChart,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import { Layout } from '@/components/common/Layout';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import type { EvaluationMode } from '@/types/domain';
import {
  MODE_DESCRIPTIONS,
  MODE_LABELS,
  getEntryPath,
} from '@/utils/evaluationFlow';

const MODOS: {
  modo: EvaluationMode;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    modo: 'completa',
    icon: <ClipboardList className="h-6 w-6" aria-hidden />,
    accent: 'from-violet-600 to-purple-700',
  },
  {
    modo: 'apgar',
    icon: <Heart className="h-6 w-6" aria-hidden />,
    accent: 'from-rose-500 to-pink-600',
  },
  {
    modo: 'capurro_peso',
    icon: <LineChart className="h-6 w-6" aria-hidden />,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    modo: 'enfermagem',
    icon: <Stethoscope className="h-6 w-6" aria-hidden />,
    accent: 'from-fuchsia-600 to-purple-700',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const iniciarModo = useEvaluationStore((s) => s.iniciarModo);
  const modoAtual = useEvaluationStore((s) => s.ui.modo);
  const rn = useEvaluationStore((s) => s.rn);
  const temAvaliacaoEmAndamento = !!modoAtual;

  function handleIniciar(modo: EvaluationMode) {
    iniciarModo(modo);
    navigate(getEntryPath(modo));
  }

  return (
    <Layout>
      <section className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-clinical-100 text-clinical-700">
              <Baby className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              SBP 2022
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Avaliação neonatal em sala de parto
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Escolha o módulo que deseja utilizar. Cada opção funciona de forma independente,
            conforme a necessidade clínica do momento.
          </p>
        </div>

        <div className="space-y-3">
          {MODOS.map(({ modo, icon, accent }) => (
            <button
              key={modo}
              type="button"
              onClick={() => handleIniciar(modo)}
              className="card-clickable group w-full !p-0 text-left overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${accent} px-4 py-3 text-white sm:px-5`}>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold sm:text-lg">{MODE_LABELS[modo]}</p>
                    {modo === 'completa' && (
                      <span className="mt-0.5 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className="h-5 w-5 flex-shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="px-4 py-3 sm:px-5">
                <p className="text-sm leading-snug text-slate-600">{MODE_DESCRIPTIONS[modo]}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-clinical-700">
                  <Activity className="h-3.5 w-3.5" aria-hidden />
                  Iniciar este módulo
                </p>
              </div>
            </button>
          ))}
        </div>

        {temAvaliacaoEmAndamento && (
          <div className="mt-4 rounded-xl border border-clinical-200 bg-clinical-50 p-4">
            <p className="text-sm font-semibold text-clinical-900">
              Avaliação em andamento
            </p>
            <p className="mt-0.5 text-xs text-clinical-800">
              Modo: <strong>{MODE_LABELS[modoAtual!]}</strong>
              {rn.identificacao ? ` · ${rn.identificacao}` : ''}
            </p>
            <Link
              to={getEntryPath(modoAtual!)}
              className="btn-secondary mt-3 !min-h-[44px] w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Continuar de onde parou
            </Link>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
          <p className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
            <BookOpen className="h-4 w-4 text-clinical-600" aria-hidden />
            Referências oficiais
          </p>
          <ul className="space-y-1 pl-1">
            <li>• Diretrizes SBP 2022 — Reanimação do RN ≥34 semanas e &lt;34 semanas.</li>
            <li>• Documento Científico SBP 2022 — PIG (nº 33, 22/12/2022).</li>
            <li>• INTERGROWTH-21st Newborn Size Standards (33+0 a 42+6).</li>
            <li>• Fenton &amp; Kim 2013 — Preterm growth chart (&lt;33+0).</li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}
