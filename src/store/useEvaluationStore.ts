import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ApgarItemKey,
  ApgarMinute,
  ApgarMinuteRecord,
  ApgarScore,
  CapurroItemKey,
  CapurroMethod,
  EvaluationMode,
  EvolucaoEnfermagemData,
  RNData,
} from '@/types/domain';
import { createDefaultEvolucao } from '@/types/domain';

interface EvaluationState {
  rn: RNData;
  apgar: {
    registros: Partial<Record<ApgarMinute, ApgarMinuteRecord>>;
  };
  capurro: {
    metodo?: CapurroMethod;
    respostas: Partial<Record<CapurroItemKey, number>>;
  };
  evolucao?: EvolucaoEnfermagemData;
  ui: {
    modo?: EvaluationMode;
    iniciadoEm?: string;
    finalizado?: boolean;
  };

  iniciarModo: (modo: EvaluationMode) => void;
  setRN: (data: Partial<RNData>) => void;
  setApgarItem: (minuto: ApgarMinute, item: ApgarItemKey, score: ApgarScore) => void;
  toggleApgarIntervencao: (minuto: ApgarMinute, intervencao: string) => void;
  setCapurroMetodo: (metodo: CapurroMethod) => void;
  setCapurroResposta: (item: CapurroItemKey, score: number) => void;
  setEvolucao: (data: Partial<EvolucaoEnfermagemData>) => void;
  clearEvolucao: () => void;
  reset: () => void;
}

const initialState: Omit<
  EvaluationState,
  | 'iniciarModo'
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
    (set) => ({
      ...initialState,

      iniciarModo: (modo) => {
        try {
          localStorage.removeItem('avaliacao-neonatal-sbp-2022');
        } catch {
          /* ignore */
        }
        set({
          ...initialState,
          ui: { modo, iniciadoEm: new Date().toISOString() },
        });
      },

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

      setEvolucao: (data) =>
        set((state) => ({
          evolucao: {
            ...(state.evolucao ?? createDefaultEvolucao()),
            ...data,
          },
        })),

      clearEvolucao: () =>
        set(() => ({
          evolucao: undefined,
        })),

      reset: () => {
        set({ ...initialState });
        // Garante que o estado persistido seja completamente limpo
        try {
          localStorage.removeItem('avaliacao-neonatal-sbp-2022');
        } catch {
          /* ignore */
        }
        // Reaplica timestamp inicial limpo
        set({ rn: {}, apgar: { registros: {} }, capurro: { respostas: {} }, evolucao: undefined, ui: {} });
      },
    }),
    {
      name: 'avaliacao-neonatal-sbp-2022',
      version: 3,
      migrate: (persistedState: unknown) => {
        // v3: remove evolucao de dados persistidos antigos
        const state = persistedState as Record<string, unknown> | null;
        if (state && typeof state === 'object') {
          delete state.evolucao;
        }
        return state ?? {};
      },
      partialize: (state) => {
        // Exclui evolucao da persistência — deve sempre começar limpa
        const { evolucao, ...rest } = state;
        return rest;
      },
    },
  ),
);
