import { Link, useNavigate } from 'react-router-dom';
import { Activity, Baby, BookOpen, ChevronRight, Heart, LineChart, RotateCcw } from 'lucide-react';
import { Layout } from '@/components/common/Layout';
import { useEvaluationStore } from '@/store/useEvaluationStore';

export default function Home() {
  const navigate = useNavigate();
  const reset = useEvaluationStore((s) => s.reset);
  const rn = useEvaluationStore((s) => s.rn);
  const temAvaliacaoEmAndamento = !!rn.sexo || !!rn.pesoGramas;

  function handleNova() {
    reset();
    navigate('/cadastro');
  }

  return (
    <Layout>
      <section className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-clinical-600 to-clinical-800 p-6 text-white shadow-card sm:p-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 backdrop-blur">
              <Baby className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
              SBP 2022
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            Avaliação Neonatal<br className="sm:hidden" /> em sala de parto
          </h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">
            Apgar ampliado, idade gestacional pelo método de Capurro e classificação PIG/AIG/GIG
            conforme as Diretrizes 2022 da Sociedade Brasileira de Pediatria.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button onClick={handleNova} className="btn-primary !bg-white !text-clinical-700 hover:!bg-slate-100">
              <Activity className="h-5 w-5" aria-hidden />
              Iniciar nova avaliação
            </button>
            {temAvaliacaoEmAndamento && (
              <Link to="/cadastro" className="btn-secondary !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                <RotateCcw className="h-4 w-4" aria-hidden />
                Continuar avaliação
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FeatureCard
            icon={<Heart className="h-5 w-5" />}
            title="Apgar ampliado"
            text="1, 5, 10, 15 e 20 min, com registro das manobras de reanimação."
          />
          <FeatureCard
            icon={<Activity className="h-5 w-5" />}
            title="Capurro"
            text="Somático e Somático-Neurológico com pontuação visual."
          />
          <FeatureCard
            icon={<LineChart className="h-5 w-5" />}
            title="PIG/AIG/GIG"
            text="INTERGROWTH-21st e Fenton & Kim conforme SBP 2022."
          />
        </div>

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

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-clinical-100 text-clinical-700">
          {icon}
        </span>
        <ChevronRight className="ml-auto h-4 w-4 text-slate-400" aria-hidden />
      </div>
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-0.5 text-xs leading-snug text-slate-600">{text}</p>
    </div>
  );
}
