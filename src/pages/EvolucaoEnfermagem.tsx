import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, CheckCircle2, AlertTriangle, ChevronUp, X } from 'lucide-react';
import { Layout } from '@/components/common/Layout';
import { SectionCard } from '@/components/common/SectionCard';
import { Alert } from '@/components/common/Alert';
import { RequireMode, useEvaluationMode } from '@/hooks/useEvaluationMode';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import { capurroConfig } from '@/data/config';
import { calcularCapurro } from '@/services/capurroCalculator';
import { classificarPesoPorIdadeGestacional } from '@/services/growthClassifier';
import { calcularApgarMinuto, isApgarMinutoCompleto } from '@/services/apgarCalculator';
import { gerarTextoEvolucao } from '@/services/evolucaoEnfermagem';
import { getRelatorioPath, getEvolucaoBack } from '@/utils/evaluationFlow';
import type {
  EvolucaoEnfermagemData,
  ExameFisicoField,
  ViaNascimento,
} from '@/types/domain';
import { createDefaultEvolucao } from '@/types/domain';

// ---------------------------------------------------------------------------
// Lista de sistemas para o bloco 5 (exame físico)
// ---------------------------------------------------------------------------

interface SistemaInfo {
  key: keyof EvolucaoEnfermagemData;
  label: string;
  normalLabel: string;
}

// ---------------------------------------------------------------------------
// Tipos sanguíneos para o bloco 2
// ---------------------------------------------------------------------------

const TIPOS_SANGUINEOS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
] as const;

// ---------------------------------------------------------------------------

const SISTEMAS: SistemaInfo[] = [
  { key: 'cranio', label: 'Cabeça / Crânio', normalLabel: 'Normocefálico, simétrico, couro cabeludo íntegro' },
  { key: 'fontanelas', label: 'Fontanelas', normalLabel: 'Bregmática e lambdóide normotensas' },
  { key: 'facies', label: 'Fácies', normalLabel: 'Simétricas e sem alterações' },
  { key: 'olhos', label: 'Olhos', normalLabel: 'Conjuntiva corada, esclera branca, pupilas isocóricas e fotorreagentes' },
  { key: 'nariz', label: 'Nariz', normalLabel: 'Implantação centralizada, narinas simétricas, mucosa íntegra' },
  { key: 'boca', label: 'Boca', normalLabel: 'Mucosa e gengiva íntegras, lábios e palatos íntegros' },
  { key: 'orelhas', label: 'Orelhas', normalLabel: 'Implantação adequada, sem secreção' },
  { key: 'pescoco', label: 'Pescoço', normalLabel: 'Mobilidade preservada, linfonodos impalpáveis' },
  { key: 'torax', label: 'Tórax', normalLabel: 'Simétrico e expansível' },
  { key: 'claviculas', label: 'Clavículas', normalLabel: 'Íntegras e sem crepitações' },
  { key: 'mamas', label: 'Mamas', normalLabel: 'Inserção mamilar simétrica, glândula entre 5-10mm' },
  { key: 'acv', label: 'ACV (Cardio)', normalLabel: 'RCR em 2T, BNF, sem sopros' },
  { key: 'ar', label: 'AR (Respiratório)', normalLabel: 'MV fisiológicos, sem RA, sem desconforto respiratório' },
  { key: 'abdome', label: 'Abdome', normalLabel: 'Globoso, RHA+, timpânico, sem visceromegalias' },
  { key: 'cotoUmbilical', label: 'Coto umbilical', normalLabel: 'Limpo e sem sinais flogísticos' },
  { key: 'quadril', label: 'Quadril', normalLabel: 'Ortolani e Barlow negativos' },
  { key: 'genitalia', label: 'Genitália', normalLabel: 'Típica, testículos palpáveis / genitália feminina típica' },
  { key: 'anus', label: 'Ânus', normalLabel: 'Aparentemente pérvio' },
  { key: 'extremidades', label: 'Extremidades', normalLabel: 'MMSS e MMII simétricos, mobilidade adequada' },
  { key: 'perfusao', label: 'Perfusão periférica', normalLabel: '< 2 segundos' },
  { key: 'pulsos', label: 'Pulsos', normalLabel: 'Palpáveis (radial, femoral, pedioso), sem edemas' },
];

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

function EvolucaoEnfermagemPage() {
  const navigate = useNavigate();
  const modo = useEvaluationMode();
  const rn = useEvaluationStore((s) => s.rn);
  const apgarState = useEvaluationStore((s) => s.apgar);
  const capurroState = useEvaluationStore((s) => s.capurro);
  const storeEvolucao = useEvaluationStore((s) => s.evolucao);
  const setEvolucao = useEvaluationStore((s) => s.setEvolucao);

  const [form, setForm] = useState<EvolucaoEnfermagemData>(
    () => storeEvolucao ?? createDefaultEvolucao(),
  );
  const [previewExpanded, setPreviewExpanded] = useState(false);

  // ── Dados automáticos calculados ──
  const capurro = useMemo(() => {
    if (!capurroState.metodo) return null;
    try {
      return calcularCapurro({ metodo: capurroState.metodo, respostas: capurroState.respostas, config: capurroConfig });
    } catch {
      return null;
    }
  }, [capurroState]);

  const growth =
    capurro && rn.sexo && rn.pesoGramas
      ? classificarPesoPorIdadeGestacional({
          pesoGramas: rn.pesoGramas,
          sexo: rn.sexo,
          idadeDias: capurro.idadeGestacionalDias,
        })
      : null;

  const apgar1 =
    apgarState.registros[1] && isApgarMinutoCompleto(apgarState.registros[1]!)
      ? calcularApgarMinuto(apgarState.registros[1]!)
      : null;
  const apgar5 =
    apgarState.registros[5] && isApgarMinutoCompleto(apgarState.registros[5]!)
      ? calcularApgarMinuto(apgarState.registros[5]!)
      : null;

  // ── Texto da evolução ──
  const textoEvolucao = useMemo(
    () =>
      gerarTextoEvolucao({
        rn,
        capurro,
        growth,
        apgar1min: apgar1,
        apgar5min: apgar5,
        evolucao: form,
      }),
    [rn, capurro, growth, apgar1, apgar5, form],
  );

  // ── Helpers de atualização ──

  const update = useCallback(
    <K extends keyof EvolucaoEnfermagemData>(key: K, value: EvolucaoEnfermagemData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateExameFisico = useCallback(
    (key: keyof EvolucaoEnfermagemData, patch: Partial<ExameFisicoField>) => {
      setForm((prev) => {
        const current = (prev[key] as ExameFisicoField) ?? { normal: true };
        return { ...prev, [key]: { ...current, ...patch }, exameFisicoTodoNormal: false };
      });
    },
    [],
  );

  const marcarTodoNormal = useCallback(() => {
    setForm((prev) => {
      const updated = { ...prev, exameFisicoTodoNormal: true };
      for (const s of SISTEMAS) {
        (updated as Record<string, unknown>)[s.key] = { normal: true, descricao: (prev[s.key] as ExameFisicoField)?.descricao ?? '' };
      }
      return updated;
    });
  }, []);

  // ── Salvar e ir para relatório ──
  function handleSalvarEGerar() {
    setEvolucao(form);
    navigate(getRelatorioPath(modo));
  }

  return (
    <Layout>
      {/* Cabeçalho */}
      <div className="mb-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-clinical-700">
          <Stethoscope className="h-4 w-4" aria-hidden /> Evolução de Enfermagem do RN
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Formulário estruturado
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Preencha os dados da evolução. Campos não preenchidos não aparecerão no texto final.
        </p>
      </div>

      <div className="space-y-5">
        {/* ─── Bloco 1: Dados automáticos do RN ─── */}
        <SectionCard
          title="1. Dados automáticos do RN"
          description="Informações já registradas na avaliação (somente leitura)."
        >
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <AutoLine label="Identificação" value={rn.identificacao || 'Anônimo'} />
            <AutoLine
              label="Sexo"
              value={rn.sexo === 'M' ? 'Masculino' : rn.sexo === 'F' ? 'Feminino' : '—'}
            />
            <AutoLine label="Peso" value={rn.pesoGramas ? `${rn.pesoGramas} g` : '—'} />
            <AutoLine
              label="Data/Hora nasc."
              value={rn.dataHoraNascimento ? new Date(rn.dataHoraNascimento).toLocaleString('pt-BR') : '—'}
            />
            {capurro && (
              <>
                <AutoLine label="Método Capurro" value={capurroConfig.methods[capurro.metodo]?.label ?? '—'} />
                <AutoLine label="IG (semanas+dias)" value={capurro.idadeGestacionalLabel} />
                <AutoLine label="Classificação" value={capurro.classificacaoTermo} />
              </>
            )}
            {growth && growth.status === 'ok' && (
              <AutoLine label="PIG / AIG / GIG" value={growth.classificacao ?? '—'} />
            )}
            {apgar1 && apgar5 && (
              <AutoLine label="Apgar 1'/5'" value={`${apgar1.total}/${apgar5.total}`} />
            )}
          </div>
        </SectionCard>

        {/* ─── Bloco 2: Dados maternos e exames ─── */}
        <SectionCard
          title="2. Dados maternos e exames"
          description="Informações da puérpera e exames relevantes."
        >
          <div className="space-y-4">
            {/* Via de nascimento */}
            <div>
              <span className="label">Via de nascimento</span>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['vaginal', 'Parto vaginal'],
                  ['cesarea', 'Cesárea'],
                  ['forceps', 'Fórceps'],
                ] as [ViaNascimento, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    className={`card-clickable !py-3 text-center text-sm font-semibold ${
                      form.viaNascimento === v
                        ? 'card-selected text-clinical-800'
                        : 'text-slate-700'
                    }`}
                    onClick={() => update('viaNascimento', form.viaNascimento === v ? undefined : v)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Tipagem materna */}
              <div>
                <span className="label">Tipagem sanguínea materna</span>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                  {TIPOS_SANGUINEOS.map((tipo) => {
                    const sel = form.tipoSanguineoMae === tipo;
                    return (
                      <button
                        key={`mae-${tipo}`}
                        type="button"
                        className={`rounded-lg border px-2 py-3 text-sm font-bold transition-all ${
                          sel
                            ? 'border-clinical-600 bg-clinical-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-clinical-300 hover:text-clinical-700 active:bg-clinical-50'
                        }`}
                        onClick={() =>
                          update('tipoSanguineoMae', sel ? undefined : tipo)
                        }
                      >
                        {tipo}
                      </button>
                    );
                  })}
                </div>
                {form.tipoSanguineoMae && (
                  <button
                    type="button"
                    className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                    onClick={() => update('tipoSanguineoMae', undefined)}
                  >
                    <X className="h-3 w-3" /> Limpar seleção
                  </button>
                )}
              </div>

              {/* Tipagem RN */}
              <div>
                <span className="label">Tipagem sanguínea do RN</span>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                  {TIPOS_SANGUINEOS.map((tipo) => {
                    const sel = form.tipoSanguineoRN === tipo;
                    return (
                      <button
                        key={`rn-${tipo}`}
                        type="button"
                        className={`rounded-lg border px-2 py-3 text-sm font-bold transition-all ${
                          sel
                            ? 'border-clinical-600 bg-clinical-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-clinical-300 hover:text-clinical-700 active:bg-clinical-50'
                        }`}
                        onClick={() =>
                          update('tipoSanguineoRN', sel ? undefined : tipo)
                        }
                      >
                        {tipo}
                      </button>
                    );
                  })}
                  {/* Opção Solicitada */}
                  <button
                    type="button"
                    className={`rounded-lg border px-2 py-3 text-sm font-semibold transition-all col-span-4 sm:col-span-1 ${
                      form.tipoSanguineoRN === 'Solicitada'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:text-amber-600'
                    }`}
                    onClick={() =>
                      update(
                        'tipoSanguineoRN',
                        form.tipoSanguineoRN === 'Solicitada' ? undefined : 'Solicitada',
                      )
                    }
                  >
                    Solicitada
                  </button>
                </div>
                {form.tipoSanguineoRN && (
                  <button
                    type="button"
                    className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                    onClick={() => update('tipoSanguineoRN', undefined)}
                  >
                    <X className="h-3 w-3" /> Limpar seleção
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="testes-rapidos">
                Testes rápidos maternos na admissão (HIV e Sífilis)
              </label>
              <select
                id="testes-rapidos"
                className="input"
                value={form.testesRapidosMaternos ?? ''}
                onChange={(e) => update('testesRapidosMaternos', e.target.value || undefined)}
              >
                <option value="">Selecione...</option>
                <option value="não reagentes">Não reagentes</option>
                <option value="reagentes">Reagentes</option>
                <option value="não realizados">Não realizados</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ─── Bloco 3: Amamentação, eliminações e vínculo ─── */}
        <SectionCard
          title="3. Amamentação, eliminações e vínculo"
          description="Registro do primeiro contato e eliminações do RN."
        >
          <div className="space-y-4">
            {/* Amamentação */}
            <div>
              <span className="label">Puérpera relata dificuldades com amamentação?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`card-clickable !py-2 px-4 text-sm font-semibold ${
                    form.amamentacaoDificuldade === false
                      ? 'card-selected text-clinical-800'
                      : 'text-slate-700'
                  }`}
                  onClick={() => update('amamentacaoDificuldade', false)}
                >
                  Nega dificuldades
                </button>
                <button
                  type="button"
                  className={`card-clickable !py-2 px-4 text-sm font-semibold ${
                    form.amamentacaoDificuldade === true
                      ? 'card-selected text-warning-700 border-warning-600 ring-warning-600/30 bg-warning-50'
                      : 'text-slate-700'
                  }`}
                  onClick={() => update('amamentacaoDificuldade', true)}
                >
                  Relata dificuldades
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="amamentacao-obs">
                Observações sobre amamentação
              </label>
              <textarea
                id="amamentacao-obs"
                className="input min-h-[80px]"
                placeholder="Ex.: Amamentação durante avaliação no primeiro contato..."
                value={form.amamentacaoObservacao ?? ''}
                onChange={(e) => update('amamentacaoObservacao', e.target.value || undefined)}
                rows={2}
              />
            </div>

            {/* Eliminações */}
            <div>
              <span className="label">Eliminações no pós-parto imediato</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <span className="text-sm font-medium text-slate-700">Vesicais:</span>
                  <button
                    type="button"
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                      form.eliminacoesVesicais === true
                        ? 'bg-clinical-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    onClick={() =>
                      update('eliminacoesVesicais', form.eliminacoesVesicais === true ? undefined : true)
                    }
                  >
                    Presentes
                  </button>
                  <button
                    type="button"
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                      form.eliminacoesVesicais === false
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    onClick={() =>
                      update('eliminacoesVesicais', form.eliminacoesVesicais === false ? undefined : false)
                    }
                  >
                    Ausentes
                  </button>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <span className="text-sm font-medium text-slate-700">Intestinais:</span>
                  <button
                    type="button"
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                      form.eliminacoesIntestinais === true
                        ? 'bg-clinical-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    onClick={() =>
                      update('eliminacoesIntestinais', form.eliminacoesIntestinais === true ? undefined : true)
                    }
                  >
                    Presentes
                  </button>
                  <button
                    type="button"
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                      form.eliminacoesIntestinais === false
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    onClick={() =>
                      update('eliminacoesIntestinais', form.eliminacoesIntestinais === false ? undefined : false)
                    }
                  >
                    Ausentes
                  </button>
                </div>
              </div>
              <textarea
                className="input mt-2 min-h-[60px]"
                placeholder="Observações adicionais sobre eliminações..."
                value={form.eliminacoesObservacao ?? ''}
                onChange={(e) => update('eliminacoesObservacao', e.target.value || undefined)}
                rows={1}
              />
            </div>

            {/* Vínculo */}
            <div>
              <label className="label" htmlFor="vinculo">
                Vínculo do binômio mãe-RN
              </label>
              <textarea
                id="vinculo"
                className="input min-h-[60px]"
                placeholder="Ex.: Boa vinculação do binômio durante a amamentação..."
                value={form.vinculoBinomio ?? ''}
                onChange={(e) => update('vinculoBinomio', e.target.value || undefined)}
                rows={1}
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── Bloco 4: Sinais vitais ─── */}
        <SectionCard
          title="4. Sinais vitais e estado geral"
          description="Registre os sinais vitais aferidos."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="fc">
                FC (bpm)
              </label>
              <input
                id="fc"
                type="number"
                className="input"
                placeholder="Ex.: 125"
                value={form.frequenciaCardiaca ?? ''}
                onChange={(e) =>
                  update('frequenciaCardiaca', e.target.value ? Number(e.target.value) : undefined)
                }
                min={60}
                max={220}
              />
            </div>
            <div>
              <label className="label" htmlFor="fr">
                FR (irpm)
              </label>
              <input
                id="fr"
                type="number"
                className="input"
                placeholder="Ex.: 42"
                value={form.frequenciaRespiratoria ?? ''}
                onChange={(e) =>
                  update('frequenciaRespiratoria', e.target.value ? Number(e.target.value) : undefined)
                }
                min={20}
                max={100}
              />
            </div>
            <div>
              <label className="label" htmlFor="temp">
                Temperatura (°C)
              </label>
              <input
                id="temp"
                type="number"
                className="input"
                placeholder="Ex.: 36.2"
                value={form.temperatura ?? ''}
                onChange={(e) =>
                  update('temperatura', e.target.value ? Number(e.target.value) : undefined)
                }
                min={35}
                max={42}
                step={0.1}
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── Bloco 5: Exame físico por sistemas ─── */}
        <SectionCard
          title="5. Exame físico por sistemas"
          description="Marque os sistemas normais ou descreva alterações."
          rightSlot={
            <button
              type="button"
              className="btn-secondary !min-h-[36px] !py-2 !px-3 text-xs"
              onClick={marcarTodoNormal}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Marcar tudo normal
            </button>
          }
        >
          <div className="space-y-2">
            {SISTEMAS.map(({ key, label, normalLabel }) => {
              const field = (form[key] as ExameFisicoField) ?? { normal: false };
              return (
                <ExameFisicoRow
                  key={key}
                  label={label}
                  normalLabel={normalLabel}
                  field={field}
                  onChange={(patch) => updateExameFisico(key, patch)}
                />
              );
            })}
          </div>
        </SectionCard>

        {/* ─── Bloco 6: Reflexos neurológicos ─── */}
        <SectionCard
          title="6. Reflexos neurológicos"
          description="Avaliação dos reflexos primitivos do RN."
        >
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              className={`card-clickable !py-2 px-4 text-sm font-semibold ${
                form.reflexosNeurologicosNormal && !form.reflexosNeurologicosDescricao
                  ? 'card-selected text-clinical-800'
                  : 'text-slate-700'
              }`}
              onClick={() => {
                update('reflexosNeurologicosNormal', true);
                update('reflexosNeurologicosDescricao', undefined);
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              De acordo com a idade
            </button>
            <button
              type="button"
              className={`card-clickable !py-2 px-4 text-sm font-semibold ${
                form.reflexosNeurologicosNormal === false && form.reflexosNeurologicosDescricao
                  ? 'card-selected text-warning-700 border-warning-600 ring-warning-600/30 bg-warning-50'
                  : 'text-slate-700'
              }`}
              onClick={() => update('reflexosNeurologicosNormal', false)}
            >
              <AlertTriangle className="h-4 w-4" />
              Descrever achados
            </button>
          </div>
          {form.reflexosNeurologicosNormal === false && (
            <textarea
              className="input min-h-[80px]"
              placeholder="Descreva os reflexos neurológicos avaliados e seus achados..."
              value={form.reflexosNeurologicosDescricao ?? ''}
              onChange={(e) => update('reflexosNeurologicosDescricao', e.target.value || undefined)}
              rows={3}
            />
          )}
        </SectionCard>

        {/* ─── Bloco 7: Intervenções de enfermagem ─── */}
        <SectionCard title="7. Intervenções de enfermagem" description="Uma intervenção por linha.">
          <textarea
            className="input min-h-[120px]"
            placeholder={`- Oriento verticalização do RN após mamadas por 20 minutos.\n- Oriento cuidados com RN e evitar superaquecer o mesmo.\n- Observo mamada e realizo orientações necessárias.`}
            value={form.intervencoes ?? ''}
            onChange={(e) => update('intervencoes', e.target.value || undefined)}
            rows={5}
          />
        </SectionCard>

        {/* ─── Bloco 8: Prescrição de enfermagem ─── */}
        <SectionCard title="8. Prescrição de enfermagem" description="Uma prescrição por linha.">
          <textarea
            className="input min-h-[120px]"
            placeholder={`- Sinais vitais a cada 6h.\n- Incentivar amamentação.\n- Observar amamentação.\n- Observar e registrar eliminações vesicais e intestinais.`}
            value={form.prescricao ?? ''}
            onChange={(e) => update('prescricao', e.target.value || undefined)}
            rows={5}
          />
        </SectionCard>

        {/* ─── Bloco 9: Prévia editável ─── */}
        <SectionCard
          title="9. Prévia da evolução final"
          description="Visualize e edite o texto que será incluído no relatório."
          rightSlot={
            <button
              type="button"
              className="btn-ghost !min-h-[36px] !py-1 !px-2 text-xs"
              onClick={() => setPreviewExpanded((p) => !p)}
            >
              {previewExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  {previewExpanded ? 'Ocultar' : 'Expandir'}
                </>
              )}
            </button>
          }
        >
          {previewExpanded ? (
            <textarea
              className="input min-h-[300px] font-mono text-xs"
              value={textoEvolucao}
              onChange={() => {
                // Permite edição livre do texto final
                // (a edição manual não volta para o formulário, é o texto final)
              }}
              rows={15}
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed max-h-[200px] overflow-y-auto">
                {textoEvolucao}
              </pre>
            </div>
          )}
        </SectionCard>

        {/* ─── Botões de ação ─── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(getEvolucaoBack(modo))}
            className="btn-secondary"
          >
            Voltar
          </button>
          <button type="button" onClick={handleSalvarEGerar} className="btn-primary">
            <Stethoscope className="h-4 w-4" />
            Salvar evolução e gerar relatório
          </button>
        </div>
      </div>

      <div className="mt-5">
        <Alert severity="info">
          O texto final não exibirá campos vazios. Dados não preenchidos serão omitidos
          automaticamente. Você pode revisar e editar o conteúdo antes de gerar o relatório.
        </Alert>
      </div>

      {/* Padding extra para scroll com bottom bar */}
      <div className="pb-20" />
    </Layout>
  );
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

function AutoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ExameFisicoRow({
  label,
  normalLabel,
  field,
  onChange,
}: {
  label: string;
  normalLabel: string;
  field: ExameFisicoField;
  onChange: (patch: Partial<ExameFisicoField>) => void;
}) {
  const isNormal = field.normal;
  const isAltered = !field.normal && field.descricao !== undefined;
  const hasDescricao = !!field.descricao;

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            {isNormal && (
              <span className="badge bg-success-100 text-success-700 text-[10px]">
                <CheckCircle2 className="h-3 w-3" />
                Normal
              </span>
            )}
            {isAltered && (
              <span className="badge bg-warning-100 text-warning-700 text-[10px]">
                <AlertTriangle className="h-3 w-3" />
                Alterado
              </span>
            )}
            {!isNormal && !isAltered && (
              <span className="badge bg-slate-100 text-slate-500 text-[10px]">
                Não avaliado
              </span>
            )}
          </div>
          {isNormal && !hasDescricao && (
            <p className="mt-0.5 text-xs text-slate-500">{normalLabel}</p>
          )}
        </div>
        <button
          type="button"
          className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex-shrink-0 ${
            isAltered
              ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
              : isNormal
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => onChange({ normal: !field.normal, descricao: field.normal ? '' : undefined })}
        >
          {isNormal ? 'Marcar alterado' : 'Marcar normal'}
        </button>
      </div>
      {/* Textarea aparece sempre que marcado como alterado */}
      {isAltered && (
        <div className="mt-2">
          <textarea
            className="input min-h-[60px] text-sm"
            placeholder={`Descreva a alteração encontrada em ${label.toLowerCase()}...`}
            value={field.descricao ?? ''}
            onChange={(e) => onChange({ descricao: e.target.value || undefined })}
            rows={2}
          />
        </div>
      )}
      {/* Textarea de complemento quando normal mas com texto extra */}
      {isNormal && hasDescricao && (
        <div className="mt-2">
          <textarea
            className="input min-h-[60px] text-sm"
            placeholder={`Complemento para ${label.toLowerCase()}...`}
            value={field.descricao ?? ''}
            onChange={(e) => onChange({ descricao: e.target.value || undefined })}
            rows={2}
          />
        </div>
      )}
    </div>
  );
}

export default function EvolucaoEnfermagem() {
  return (
    <RequireMode>
      <EvolucaoEnfermagemPage />
    </RequireMode>
  );
}
