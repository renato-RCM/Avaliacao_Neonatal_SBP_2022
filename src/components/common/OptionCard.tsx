import { Check } from 'lucide-react';
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
      className={`card-clickable group relative flex flex-col text-left ${
        selected ? 'card-selected' : ''
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`badge ${
            selected
              ? 'bg-clinical-600 text-white'
              : showAsApgar
                ? 'bg-violet-50 text-violet-700'
                : 'bg-violet-100 text-violet-700'
          }`}
        >
          {finalScoreLabel}
        </span>
        {selected && (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-clinical-600 text-white">
            <Check className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>

      {url && (
        <div className="my-3 flex aspect-[3/2] items-center justify-center overflow-hidden rounded-xl bg-violet-50/50">
          <img src={url} alt={label} loading="lazy" className="max-h-full max-w-full" />
        </div>
      )}

      <p className="text-sm font-medium leading-snug text-slate-800">{label}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </button>
  );
}
