import { Check, Zap } from 'lucide-react';
import { resolveAsset } from '@/utils/assets';

interface OptionCardProps {
  asset?: string;
  label: string;
  score: number;
  selected: boolean;
  scoreLabel?: string;
  note?: string;
  onSelect: () => void;
  variant?: 'capurro' | 'apgar';
}

export function OptionCard({
  asset,
  label,
  score,
  selected,
  scoreLabel,
  note,
  onSelect,
  variant = 'capurro',
}: OptionCardProps) {
  const url = asset ? resolveAsset(asset) : '';
  const showAsApgar = variant === 'apgar';
  const finalScoreLabel = scoreLabel ?? `${score} ${score === 1 ? 'ponto' : 'pontos'}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300 ${
        selected
          ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg shadow-violet-500/20 scale-[1.02]'
          : 'border-violet-100 bg-white hover:border-violet-300 hover:shadow-md hover:scale-[1.01]'
      }`}
      aria-pressed={selected}
    >
      {/* Indicador de seleção */}
      {selected && (
        <div className="absolute -right-3 -top-3 grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-white shadow-md">
          <Check className="h-4 w-4" aria-hidden />
        </div>
      )}

      {/* Score badge */}
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
          selected
            ? 'bg-violet-600 text-white shadow-sm'
            : showAsApgar
              ? 'bg-rose-50 text-rose-700 group-hover:bg-rose-100'
              : 'bg-violet-50 text-violet-700 group-hover:bg-violet-100'
        }`}
      >
        {selected && <Zap className="h-3 w-3" />}
        {finalScoreLabel}
      </span>

      {/* Imagem */}
      {url && (
        <div className={`my-3 flex aspect-[3/2] items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${
          selected ? 'border-violet-200 bg-purple-50/50' : 'border-violet-50 bg-violet-50/30'
        }`}>
          <img src={url} alt={label} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}

      {/* Label */}
      <p className={`text-sm font-semibold leading-snug transition-colors ${
        selected ? 'text-violet-900' : 'text-slate-800'
      }`}>
        {label}
      </p>

      {/* Nota */}
      {note && (
        <p className={`mt-1 text-xs leading-relaxed ${selected ? 'text-violet-600' : 'text-slate-500'}`}>
          {note}
        </p>
      )}

      {/* Barra inferior indicativa quando selecionado */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
      )}
    </button>
  );
}
