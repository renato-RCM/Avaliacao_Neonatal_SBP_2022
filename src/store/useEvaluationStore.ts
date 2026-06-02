import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ApgarItemKey,
  ApgarMinute,
  ApgarMinuteRecord,
  ApgarScore,
  CapurroItemKey,
  CapurroMethod,
  RNData,
} from '@/types/domain';

interface EvaluationState {
  rn: RNData;
  apgar: {
    registros: Partial<Record<ApgarMinute, ApgarMinuteRecord>>;
  };
  capurro: {
    metodo?: CapurroMethod;
    respostas: Partial<Record<CapurroItemKey, number>>;
  };
  ui: {
    iniciadoEm?: string;
    finalizado?: boolean;
  };

  setRN: (data: Partial<RNData>) => void;
  setApgarItem: (minuto: ApgarMinute, item: ApgarItemKey, score: ApgarScore) => void;
  toggleApgarIntervencao: (minuto: ApgarMinute, intervencao: string) => void;
  setCapurroMetodo: (metodo: CapurroMethod) => void;
  setCapurroResposta: (item: CapurroItemKey, score: number) => void;
  reset: () => void;
}

const initialState: Omit<
  EvaluationState,
  | 'setRN'
  | 'setApgarItem'
  | 'toggleApgarIntervencao'
  | 'setCapurroMetodo'
  | 'setCapurroResposta'
  | 'reset'
> = {
  rn: {},
  apgar: { registros: {} },
  capurro: { respostas: {} },
  ui: {},
};

export const useEvaluationStore = create<EvaluationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setRN: (data) =>
        set((state) => ({
          rn: { ...state.rn, ...data },
          ui: { ...state.ui, iniciadoEm: state.ui.iniciadoEm ?? new Date().toISOString() },
        })),

      setApgarItem: (minuto, item, score) =>
        set((state) => {
          const existente: ApgarMinuteRecord = state.apgar.registros[minuto] ?? {
            minuto,
            pontuacoes: {},
            intervencoes: [],
          };
          return {
            apgar: {
              registros: {
                ...state.apgar.registros,
                [minuto]: {
                  ...existente,
                  pontuacoes: { ...existente.pontuacoes, [item]: score },
                },
              },
            },
          };
        }),

      toggleApgarIntervencao: (minuto, intervencao) =>
        set((state) => {
          const existente: ApgarMinuteRecord = state.apgar.registros[minuto] ?? {
            minuto,
            pontuacoes: {},
            intervencoes: [],
          };
          const tem = existente.intervencoes.includes(intervencao);
          const novas = tem
            ? existente.intervencoes.filter((i) => i !== intervencao)
            : [...existente.intervencoes, intervencao];
          return {
            apgar: {
              registros: {
                ...state.apgar.registros,
                [minuto]: { ...existente, intervencoes: novas },
              },
            },
          };
        }),

      setCapurroMetodo: (metodo) =>
        set((state) => ({
          capurro: { metodo, respostas: state.capurro.metodo === metodo ? state.capurro.respostas : {} },
          rn: { ...state.rn, metodoCapurro: metodo },
        })),

      setCapurroResposta: (item, score) =>
        set((state) => ({
          capurro: {
            ...state.capurro,
            respostas: { ...state.capurro.respostas, [item]: score },
          },
        })),

      reset: () => {
        set({ ...initialState });
        // Garante que o suspect persistido seja limpo também
        try {
          localStorage.removeItem('avaliacao-neonatal-sbp-2022');
        } catch {
          /* ignore */
        }
        // Reaplica timestamp inicial
        set((state) => ({ ui: { ...state.ui, iniciadoEm: undefined } }));
        void get();
      },
    }),
    {
      name: 'avaliacao-neonatal-sbp-2022',
      version: 1,
    },
  ),
);
