import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface StepNavProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  backTo?: string;
  nextTo?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  isFinal?: boolean;
  onNext?: () => void;
}

export function StepNav({
  step,
  totalSteps,
  title,
  subtitle,
  backTo,
  nextTo,
  nextLabel,
  nextDisabled,
  isFinal,
  onNext,
}: StepNavProps) {
  const navigate = useNavigate();
  const progress = Math.round((step / totalSteps) * 100);

  function handleNext() {
    if (onNext) onNext();
    if (nextTo) navigate(nextTo);
  }

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Etapa {step} de {totalSteps}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-clinical-600 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        </div>
      </div>

      {(backTo || nextTo || onNext) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur no-print">
          <div className="container-app flex items-center justify-between gap-3 py-3">
            {backTo ? (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="btn-secondary"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            ) : (
              <span />
            )}

            {(nextTo || onNext) && (
              <button
                type="button"
                onClick={handleNext}
                disabled={nextDisabled}
                className="btn-primary flex-1 sm:flex-none"
              >
                {isFinal ? <Check className="h-4 w-4" aria-hidden /> : null}
                <span>{nextLabel ?? 'Continuar'}</span>
                {!isFinal && <ArrowRight className="h-4 w-4" aria-hidden />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
