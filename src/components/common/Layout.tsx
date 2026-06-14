import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Printer } from 'lucide-react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showPrint?: boolean;
}

export function Layout({ children, showPrint = false }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-violet-50/30">
      <header className="sticky top-0 z-30 border-b border-violet-100 bg-white/90 backdrop-blur-md no-print">
        <div className="container-app flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2 text-slate-900 hover:text-violet-700 transition-colors">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-500/30">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold sm:text-base">Avaliação Neonatal</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-violet-600 sm:text-xs">
                SBP 2022
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {showPrint && (
              <button
                onClick={() => window.print()}
                className="btn-secondary !min-h-[40px] !py-2 !px-3 text-xs sm:text-sm"
                aria-label="Imprimir relatório"
              >
                <Printer className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            )}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="btn-ghost !min-h-[40px] !py-2 !px-3 text-xs sm:text-sm"
              >
                Início
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container-app py-5 pb-28 sm:py-8">{children}</main>

      <footer className="border-t border-violet-100 bg-white no-print">
        <div className="container-app py-4 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          <p className="font-semibold text-violet-700">Aviso clínico</p>
          <p>
            Este aplicativo é uma ferramenta de apoio à avaliação profissional. Os resultados
            <strong> não substituem </strong>
            avaliação médica/enfermagem neonatal, DUM confiável, ultrassonografia precoce ou
            protocolo institucional. O Apgar não decide reanimação — segue avaliação imediata e
            diretrizes SBP 2022.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 sm:text-[11px]">
            <span className="rounded bg-violet-50 px-1.5 py-0.5 font-mono font-semibold text-violet-600">
              v{__APP_VERSION__}
            </span>
            <span>build {__APP_BUILD_DATE__}</span>
            <span className="hidden sm:inline">·</span>
            <span>Avaliação Neonatal SBP 2022</span>
          </p>
          <p className="mt-1.5 text-[10px] text-slate-400 sm:text-[11px]">
            Desenvolvido por{' '}
            <span className="font-semibold text-slate-500">Renato C. Miranda</span>
            {' '}·{' '}
            <a href="mailto:renatorcm@gmail.com" className="hover:text-violet-600 transition-colors underline underline-offset-2">
              renatorcm@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
