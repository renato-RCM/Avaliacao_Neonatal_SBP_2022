import { useMemo, useState } from 'react';
import { Layout } from '@/components/common/Layout';
import { StepNav } from '@/components/common/StepNav';
import { Alert } from '@/components/common/Alert';
import { useEvaluationStore } from '@/store/useEvaluationStore';
import type { Sexo } from '@/types/domain';
import {
  composeISODateTime,
  splitISODateTime,
  validateBirthDateTime,
} from '@/utils/dateTime';

export default function Cadastro() {
  const rn = useEvaluationStore((s) => s.rn);
  const setRN = useEvaluationStore((s) => s.setRN);

  const partesIniciais = splitISODateTime(rn.dataHoraNascimento);

  const [pesoStr, setPesoStr] = useState<string>(
    rn.pesoGramas !== undefined ? String(rn.pesoGramas) : '',
  );
  const [identificacao, setIdentificacao] = useState<string>(rn.identificacao ?? '');
  const [avaliador, setAvaliador] = useState<string>(rn.avaliador ?? '');
  const [dataNascimento, setDataNascimento] = useState<string>(partesIniciais.date);
  const [horaNascimento, setHoraNascimento] = useState<string>(partesIniciais.time);
  const [sexo, setSexo] = useState<Sexo | undefined>(rn.sexo);
  const [submitted, setSubmitted] = useState(false);

  const pesoNum = useMemo(() => Number(pesoStr.replace(',', '.')), [pesoStr]);
  const pesoOk = !pesoStr || (pesoNum > 300 && pesoNum < 7000);
  const sexoOk = !!sexo;

  const dateTimeValidation = useMemo(
    () => validateBirthDateTime(dataNascimento, horaNascimento),
    [dataNascimento, horaNascimento],
  );

  const podeProsseguir = pesoOk && sexoOk && pesoStr !== '' && dateTimeValidation.ok;

  function handleNext() {
    setSubmitted(true);
    if (!podeProsseguir) return;
    setRN({
      identificacao: identificacao || undefined,
      sexo,
      pesoGramas: pesoNum,
      dataHoraNascimento: composeISODateTime(dataNascimento, horaNascimento),
      avaliador: avaliador || undefined,
    });
  }

  const hojeISO = useMemo(() => {
    const hoje = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
  }, []);

  const dataInvalida = !!dateTimeValidation.dateError;
  const horaInvalida = !!dateTimeValidation.timeError;
  const erroGeral = dateTimeValidation.generalError;

  return (
    <Layout>
      <StepNav
        step={1}
        totalSteps={6}
        title="Dados iniciais do RN"
        subtitle="Identificação anônima ou clínica do recém-nascido. Sexo e peso são obrigatórios para a classificação PIG/AIG/GIG."
        backTo="/"
        nextTo="/apgar"
        nextLabel="Continuar"
        nextDisabled={!podeProsseguir}
        onNext={handleNext}
      />

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <label className="label" htmlFor="identificacao">
            Identificação do RN <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="identificacao"
            type="text"
            className="input"
            placeholder="Ex.: RN da Sra. Silva, ou código interno"
            value={identificacao}
            onChange={(e) => setIdentificacao(e.target.value)}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-slate-500">
            Pode ser anônimo. Não armazene dados pessoais sensíveis sem consentimento.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <span className="label">
            Sexo biológico ao nascimento <span className="text-danger-600">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`card-clickable !py-4 text-center font-semibold ${
                sexo === 'M' ? 'card-selected text-clinical-800' : 'text-slate-700'
              }`}
              onClick={() => setSexo('M')}
              aria-pressed={sexo === 'M'}
            >
              Masculino
            </button>
            <button
              type="button"
              className={`card-clickable !py-4 text-center font-semibold ${
                sexo === 'F' ? 'card-selected text-clinical-800' : 'text-slate-700'
              }`}
              onClick={() => setSexo('F')}
              aria-pressed={sexo === 'F'}
            >
              Feminino
            </button>
          </div>
          {submitted && !sexoOk && (
            <p className="mt-2 text-xs font-medium text-danger-700">
              Sexo é obrigatório para a classificação PIG/AIG/GIG.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <label className="label" htmlFor="peso">
            Peso ao nascer (gramas) <span className="text-danger-600">*</span>
          </label>
          <input
            id="peso"
            type="number"
            inputMode="decimal"
            className={`input ${submitted && (!pesoOk || !pesoStr) ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-500/30' : ''}`}
            placeholder="Ex.: 3250"
            value={pesoStr}
            onChange={(e) => setPesoStr(e.target.value)}
            min={300}
            max={7000}
          />
          <p className="mt-1 text-xs text-slate-500">Valor entre 300 g e 7000 g.</p>
          {submitted && pesoStr && !pesoOk && (
            <p className="mt-2 text-xs font-medium text-danger-700">
              Peso fora da faixa válida (300 a 7000 g).
            </p>
          )}
          {submitted && !pesoStr && (
            <p className="mt-2 text-xs font-medium text-danger-700">Informe o peso ao nascer.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <span className="label">
            Data e hora do nascimento{' '}
            <span className="font-normal text-slate-400">(opcional)</span>
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="data-nasc">
                Data
              </label>
              <input
                id="data-nasc"
                type="date"
                className={`input ${dataInvalida ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-500/30' : ''}`}
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                max={hojeISO}
                aria-invalid={dataInvalida}
                aria-describedby={dataInvalida ? 'data-nasc-erro' : undefined}
              />
              {dataInvalida && (
                <p id="data-nasc-erro" className="mt-1 text-xs font-medium text-danger-700">
                  {dateTimeValidation.dateError}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="hora-nasc">
                Hora
              </label>
              <input
                id="hora-nasc"
                type="time"
                className={`input ${horaInvalida ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-500/30' : ''}`}
                value={horaNascimento}
                onChange={(e) => setHoraNascimento(e.target.value)}
                aria-invalid={horaInvalida}
                aria-describedby={horaInvalida ? 'hora-nasc-erro' : undefined}
                step={60}
              />
              {horaInvalida && (
                <p id="hora-nasc-erro" className="mt-1 text-xs font-medium text-danger-700">
                  {dateTimeValidation.timeError}
                </p>
              )}
            </div>
          </div>
          {erroGeral && (
            <p className="mt-2 text-xs font-medium text-danger-700">{erroGeral}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Útil para o relatório. Aceita data até hoje e hora no formato 00:00 a 23:59.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <label className="label" htmlFor="avaliador">
            Avaliador <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="avaliador"
            type="text"
            className="input"
            placeholder="Ex.: Dr(a). nome"
            value={avaliador}
            onChange={(e) => setAvaliador(e.target.value)}
            autoComplete="off"
          />
        </div>

        <Alert severity="info" title="Próximos passos">
          A próxima etapa é o <strong>Boletim de Apgar ampliado</strong> nos minutos 1 e 5. Se o
          Apgar do 5º minuto for &lt; 7, os minutos 10, 15 e 20 serão habilitados conforme SBP 2022.
        </Alert>
      </div>
    </Layout>
  );
}
