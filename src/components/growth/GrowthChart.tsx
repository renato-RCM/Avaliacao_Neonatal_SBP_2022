import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { intergrowthRows, fentonRows } from '@/data/percentile_tables';
import type { Sexo } from '@/types/domain';
import { interpolarLinha } from '@/services/growthClassifier';

interface GrowthChartProps {
  sexo: Sexo;
  pesoGramas: number;
  idadeDias: number;
  source: 'INTERGROWTH-21st Newborn Size Standards' | 'Fenton & Kim 2013' | string;
}

interface ChartPoint {
  x: number;
  label: string;
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
}

function buildChartSeries(sexo: Sexo, source: string): ChartPoint[] {
  const isIG = source.startsWith('INTERGROWTH');
  const base = isIG ? intergrowthRows : fentonRows;
  const filtered = base
    .filter((r) => r.sex === sexo)
    .sort((a, b) => a.ga_total_days - b.ga_total_days);

  const points: ChartPoint[] = [];
  for (let i = 0; i < filtered.length - 1; i++) {
    const a = filtered[i];
    const b = filtered[i + 1];
    for (let d = 0; d < 7; d++) {
      const dia = a.ga_total_days + d;
      const r = interpolarLinha(filtered, sexo, dia);
      if (!r) continue;
      const semanas = Math.floor(dia / 7);
      const dext = dia % 7;
      points.push({
        x: dia,
        label: `${semanas}+${dext}`,
        p3: Number(r.p3_kg.toFixed(3)),
        p10: Number(r.p10_kg.toFixed(3)),
        p50: Number(r.p50_kg.toFixed(3)),
        p90: Number(r.p90_kg.toFixed(3)),
        p97: Number(r.p97_kg.toFixed(3)),
      });
    }
    if (i === filtered.length - 2) {
      points.push({
        x: b.ga_total_days,
        label: `${b.ga_weeks}+0`,
        p3: b.p3_kg,
        p10: b.p10_kg,
        p50: b.p50_kg,
        p90: b.p90_kg,
        p97: b.p97_kg,
      });
    }
  }
  return points;
}

export function GrowthChart({ sexo, pesoGramas, idadeDias, source }: GrowthChartProps) {
  const data = buildChartSeries(sexo, source);
  const pesoKg = Number((pesoGramas / 1000).toFixed(3));

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="x"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={data
              .filter((p) => p.x % 7 === 0)
              .map((p) => p.x)
              .filter((v, idx, arr) => arr.indexOf(v) === idx)}
            tickFormatter={(d: number) => `${Math.floor(d / 7)}`}
            stroke="#64748b"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Idade gestacional (semanas)',
              position: 'insideBottom',
              offset: -2,
              style: { fontSize: 11, fill: '#64748b' },
            }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Peso (kg)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#64748b' },
            }}
            domain={[
              (min: number) => Math.max(0, Math.floor(min * 10) / 10 - 0.2),
              (max: number) => Math.ceil(max * 10) / 10 + 0.2,
            ]}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            labelFormatter={(d: number) => `IG: ${Math.floor(d / 7)}+${d % 7}`}
            formatter={(v: number, name: string) => [`${v.toFixed(3)} kg`, name.toUpperCase()]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            dataKey="p3"
            name="P3"
            stroke="#fca5a5"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            type="monotone"
          />
          <Line
            dataKey="p10"
            name="P10"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Line
            dataKey="p50"
            name="P50"
            stroke="#1d4ed8"
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Line
            dataKey="p90"
            name="P90"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Line
            dataKey="p97"
            name="P97"
            stroke="#86efac"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            type="monotone"
          />
          <ReferenceDot
            x={idadeDias}
            y={pesoKg}
            r={7}
            fill="#0f172a"
            stroke="#fff"
            strokeWidth={2}
            isFront
            label={{
              value: 'RN',
              position: 'top',
              fontSize: 11,
              fontWeight: 700,
              fill: '#0f172a',
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
