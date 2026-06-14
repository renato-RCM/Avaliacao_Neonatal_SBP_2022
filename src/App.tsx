import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Apgar from './pages/Apgar';
import CapurroMetodo from './pages/CapurroMetodo';
import CapurroParametros from './pages/CapurroParametros';
import ResultadoCapurro from './pages/ResultadoCapurro';
import DecisaoEvolucao from './pages/DecisaoEvolucao';
import EvolucaoEnfermagem from './pages/EvolucaoEnfermagem';

const ResultadoPeso = lazy(() => import('./pages/ResultadoPeso'));
const Relatorio = lazy(() => import('./pages/Relatorio'));

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
      Carregando…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/apgar" element={<Apgar />} />
        <Route path="/capurro/metodo" element={<CapurroMetodo />} />
        <Route path="/capurro/parametros" element={<CapurroParametros />} />
        <Route path="/resultado/capurro" element={<ResultadoCapurro />} />
        <Route path="/resultado/peso" element={<ResultadoPeso />} />
        <Route path="/evolucao/decidir" element={<DecisaoEvolucao />} />
        <Route path="/evolucao/enfermagem" element={<EvolucaoEnfermagem />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
