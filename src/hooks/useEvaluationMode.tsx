import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import type { EvaluationMode } from '@/types/domain';
import { resolveMode } from '@/utils/evaluationFlow';

/** Modo atual (completa se ainda não definido, para compatibilidade). */
export function useEvaluationMode(): EvaluationMode {
  const modo = useEvaluationStore((s) => s.ui.modo);
  return resolveMode(modo);
}

/** Redireciona para o início se o usuário não escolheu um modo no menu. */
export function RequireMode({ children }: { children: ReactNode }) {
  const modo = useEvaluationStore((s) => s.ui.modo);
  if (!modo) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** Bloqueia rotas que não pertencem ao modo atual. */
export function RequireModes({
  allowed,
  children,
}: {
  allowed: EvaluationMode[];
  children: ReactNode;
}) {
  const modo = useEvaluationMode();
  if (!allowed.includes(modo)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
