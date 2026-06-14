import { useNavigate } from 'react-router-dom';
import { FileText, Stethoscope, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/common/Layout';
import { Alert } from '@/components/common/Alert';
import { RequireMode, useEvaluationMode } from '@/hooks/useEvaluationMode';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import { getRelatorioPath, getEvolucaoBack } from '@/utils/evaluationFlow';

function DecisaoEvolucaoPage() {
  const navigate = useNavigate();
  const modo = useEvaluationMode();
  const clearEvolucao = useEvaluationStore((s) => s.clearEvolucao);

  function handleComEvolucao() {
    navigate('/evolucao/enfermagem');
  }

  function handleSemEvolucao() {
    clearEvolucao();
    navigate(getRelatorioPath(modo));
  }

  return (
    <Layout>
      <div className="mb-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-600">
          <Stethoscope className="h-4 w-4" aria-hidden /> Evolução de Enfermagem
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Deseja adicionar Evolução de Enfermagem?
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Você pode incluir uma evolução de enfermagem estruturada no relatório final ou gerar o
          relatório diretamente com os dados já registrados.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleComEvolucao}
          className="card-clickable group w-full !p-0 text-left overflow-hidden"
        >
          <div className="bg-gradient-to-r from-clinical-600 to-clinical-800 px-4 py-4 text-white sm:px-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <Stethoscope className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold sm:text-lg">Adicionar Evolução de Enfermagem</p>
                <p className="mt-0.5 text-xs text-white/80">
                  Preencher formulário estruturado com dados automáticos do RN
                </p>
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleSemEvolucao}
          className="card-clickable group w-full !p-0 text-left overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-600 to-slate-800 px-4 py-4 text-white sm:px-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <FileText className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold sm:text-lg">Gerar relatório sem evolução</p>
                <p className="mt-0.5 text-xs text-white/80">
                  Ir direto para o relatório final com os dados já preenchidos
                </p>
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate(getEvolucaoBack(modo))}
          className="btn-secondary w-full"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar para revisar dados
        </button>
      </div>

      <div className="mt-5">
        <Alert severity="info">
          A evolução de enfermagem é opcional e complementa o relatório com dados de exame físico,
          sinais vitais, intervenções e prescrições de enfermagem do RN.
        </Alert>
      </div>
    </Layout>
  );
}

export default function DecisaoEvolucao() {
  return (
    <RequireMode>
      <DecisaoEvolucaoPage />
    </RequireMode>
  );
}
