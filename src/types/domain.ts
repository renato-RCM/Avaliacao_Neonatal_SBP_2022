export type Sexo = 'M' | 'F';

/** Modo de uso escolhido no menu principal. */
export type EvaluationMode = 'completa' | 'apgar' | 'capurro_peso' | 'enfermagem';

export type CapurroMethod = 'capurro_somatico' | 'capurro_somatoneurologico';

export type CapurroItemKey =
  | 'orelha'
  | 'glandula_mamaria'
  | 'mamilo'
  | 'pele'
  | 'pregas_plantares'
  | 'xale'
  | 'cabeca';

export type ApgarItemKey =
  | 'frequencia_cardiaca'
  | 'respiracao'
  | 'tonus_muscular'
  | 'irritabilidade_reflexa'
  | 'cor';

export type ApgarMinute = 1 | 5 | 10 | 15 | 20;

export type ApgarScore = 0 | 1 | 2;

export interface ConfigOption {
  score: number;
  label: string;
  asset: string;
  note?: string;
}

export interface ConfigItem {
  label: string;
  options: ConfigOption[];
}

export interface ConfigMethod {
  label: string;
  constant_days: number;
  formula_days: string;
  formula_weeks_decimal: string;
  items: CapurroItemKey[];
}

export interface ApgarItem {
  label: string;
  options: ConfigOption[];
}

export interface CapurroConfig {
  version: string;
  units: { gestational_age: string; birth_weight: string };
  methods: Record<CapurroMethod, ConfigMethod>;
  items: Record<CapurroItemKey, ConfigItem>;
  modules: string[];
  clinical_guideline: string;
  apgar: {
    label: string;
    minutes: number[];
    default_minutes: number[];
    repeat_rule: string;
    important_note: string;
    items: Record<ApgarItemKey, ApgarItem>;
    resuscitation_interventions_to_document: string[];
  };
  growth_classification_sbp2022: {
    label: string;
    classification: { PIG: string; AIG: string; GIG: string };
    reference_selection: { ga_range: string; source: string; use: string }[];
    warning: string;
  };
}

export interface RNData {
  identificacao?: string;
  sexo?: Sexo;
  pesoGramas?: number;
  dataHoraNascimento?: string;
  avaliador?: string;
  metodoCapurro?: CapurroMethod;
}

export interface ApgarMinuteRecord {
  minuto: ApgarMinute;
  pontuacoes: Partial<Record<ApgarItemKey, ApgarScore>>;
  intervencoes: string[];
}

export interface ApgarState {
  registros: Partial<Record<ApgarMinute, ApgarMinuteRecord>>;
}

export interface CapurroState {
  metodo?: CapurroMethod;
  respostas: Partial<Record<CapurroItemKey, number>>;
}

export interface ApgarMinuteResult {
  minuto: ApgarMinute;
  total: number;
  interpretacao: string;
  intervencoes: string[];
}

export interface CapurroResult {
  metodo: CapurroMethod;
  somaPontos: number;
  idadeGestacionalDias: number;
  idadeGestacionalSemanasDecimal: number;
  idadeGestacionalSemanasCompletas: number;
  idadeGestacionalDiasRestantes: number;
  idadeGestacionalLabel: string;
  classificacaoTermo: 'Pré-termo' | 'A termo' | 'Pós-termo';
}

export interface PercentileRow {
  sex: Sexo;
  ga_weeks: number;
  ga_days_extra: number;
  ga_total_days: number;
  p3_kg: number;
  p10_kg: number;
  p50_kg: number;
  p90_kg: number;
  p97_kg: number;
  source: string;
}

export type GrowthClassification = 'PIG' | 'AIG' | 'GIG';

// ---- Evolução de Enfermagem ----

export interface ExameFisicoField {
  normal: boolean;
  descricao?: string;
}

export type ViaNascimento = 'vaginal' | 'cesarea' | 'forceps';

export type TesteRapidoResultado = 'nao_reagente' | 'reagente' | 'nao_necessario';

export interface EvolucaoEnfermagemData {
  // Bloco 2: Dados maternos e exames
  viaNascimento?: ViaNascimento;
  tipoSanguineoMae?: string;
  tipoSanguineoRN?: string;
  sifilisMae?: TesteRapidoResultado;
  hivMae?: TesteRapidoResultado;
  hepatiteBMae?: TesteRapidoResultado;
  hepatiteCMae?: TesteRapidoResultado;

  // Bloco 3: Amamentação, eliminações e vínculo
  amamentacaoDificuldade?: boolean;
  amamentacaoObservacao?: string;
  eliminacoesVesicais?: boolean;
  eliminacoesIntestinais?: boolean;
  eliminacoesObservacao?: string;
  vinculoBinomio?: string;

  // Bloco 4: Sinais vitais
  frequenciaCardiaca?: number;
  frequenciaRespiratoria?: number;
  temperatura?: number;

  // Bloco 5: Exame físico (normal = marcado como normal; se false, campo está alterado)
  exameFisicoTodoNormal: boolean;
  cranio: ExameFisicoField;
  fontanelas: ExameFisicoField;
  facies: ExameFisicoField;
  olhos: ExameFisicoField;
  nariz: ExameFisicoField;
  boca: ExameFisicoField;
  orelhas: ExameFisicoField;
  pescoco: ExameFisicoField;
  torax: ExameFisicoField;
  claviculas: ExameFisicoField;
  mamas: ExameFisicoField;
  acv: ExameFisicoField;
  ar: ExameFisicoField;
  abdome: ExameFisicoField;
  cotoUmbilical: ExameFisicoField;
  quadril: ExameFisicoField;
  genitalia: ExameFisicoField;
  anus: ExameFisicoField;
  extremidades: ExameFisicoField;
  perfusao: ExameFisicoField;
  pulsos: ExameFisicoField;

  // Bloco 6: Reflexos neurológicos
  reflexosNeurologicosNormal: boolean;
  reflexosNeurologicosDescricao?: string;

  // Bloco 7: Intervenções
  intervencoes?: string;

  // Bloco 8: Prescrição
  prescricao?: string;
}

export function createDefaultExameFisicoField(): ExameFisicoField {
  return { normal: false };
}

export function createDefaultEvolucao(): EvolucaoEnfermagemData {
  return {
    exameFisicoTodoNormal: false,
    cranio: createDefaultExameFisicoField(),
    fontanelas: createDefaultExameFisicoField(),
    facies: createDefaultExameFisicoField(),
    olhos: createDefaultExameFisicoField(),
    nariz: createDefaultExameFisicoField(),
    boca: createDefaultExameFisicoField(),
    orelhas: createDefaultExameFisicoField(),
    pescoco: createDefaultExameFisicoField(),
    torax: createDefaultExameFisicoField(),
    claviculas: createDefaultExameFisicoField(),
    mamas: createDefaultExameFisicoField(),
    acv: createDefaultExameFisicoField(),
    ar: createDefaultExameFisicoField(),
    abdome: createDefaultExameFisicoField(),
    cotoUmbilical: createDefaultExameFisicoField(),
    quadril: createDefaultExameFisicoField(),
    genitalia: createDefaultExameFisicoField(),
    anus: createDefaultExameFisicoField(),
    extremidades: createDefaultExameFisicoField(),
    perfusao: createDefaultExameFisicoField(),
    pulsos: createDefaultExameFisicoField(),
    reflexosNeurologicosNormal: false,
  };
}

export interface GrowthResult {
  status: 'ok' | 'erro';
  message?: string;
  classificacao?: GrowthClassification;
  pesoKg?: number;
  p3_kg?: number;
  p10_kg?: number;
  p50_kg?: number;
  p90_kg?: number;
  p97_kg?: number;
  percentilEstimado?: string;
  referencia?: string;
}
