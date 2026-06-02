/**
 * Utilitários puros para validação e composição de data/hora de nascimento.
 *
 * Convenções:
 *   - data:   string no formato "YYYY-MM-DD"
 *   - hora:   string no formato "HH:mm"
 *   - ISO:    string ISO 8601 local (ex.: "2026-06-02T11:30")
 *
 * Todas as funções são puras — sem efeitos colaterais — para facilitar testes.
 */

const RE_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const RE_TIME = /^(\d{2}):(\d{2})$/;

export interface DateTimeValidation {
  ok: boolean;
  /** Mensagem específica do campo data, se inválido. */
  dateError?: string;
  /** Mensagem específica do campo hora, se inválido. */
  timeError?: string;
  /** Mensagem geral (ex.: combinação no futuro). */
  generalError?: string;
}

/** Limite máximo no passado: 365 dias (avaliação retroativa muito antiga). */
const MAX_DAYS_PAST = 365;

/** Tolerância para considerar "futuro" (compensa pequenos drifts de relógio). */
const FUTURE_TOLERANCE_MIN = 5;

export function parseDate(value: string): { y: number; m: number; d: number } | null {
  const match = RE_DATE.exec(value.trim());
  if (!match) return null;
  return {
    y: Number(match[1]),
    m: Number(match[2]),
    d: Number(match[3]),
  };
}

export function parseTime(value: string): { h: number; min: number } | null {
  const match = RE_TIME.exec(value.trim());
  if (!match) return null;
  return {
    h: Number(match[1]),
    min: Number(match[2]),
  };
}

/** Valida se ano, mês e dia formam uma data real do calendário. */
export function isValidCalendarDate(y: number, m: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
  );
}

/** Valida hora (00:00 a 23:59). */
export function isValidTime(h: number, min: number): boolean {
  if (!Number.isInteger(h) || !Number.isInteger(min)) return false;
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

/**
 * Valida data e hora opcionais, individualmente e em combinação.
 * Regra: se ambas preenchidas, a combinação não pode ser no futuro nem mais antiga
 * que MAX_DAYS_PAST. Campos vazios são permitidos (todos opcionais).
 */
export function validateBirthDateTime(
  dateStr: string,
  timeStr: string,
  now: Date = new Date(),
): DateTimeValidation {
  const result: DateTimeValidation = { ok: true };

  const hasDate = dateStr.trim() !== '';
  const hasTime = timeStr.trim() !== '';

  let dateParts: ReturnType<typeof parseDate> = null;
  let timeParts: ReturnType<typeof parseTime> = null;

  if (hasDate) {
    dateParts = parseDate(dateStr);
    if (!dateParts) {
      result.dateError = 'Data inválida. Use o formato AAAA-MM-DD.';
    } else if (!isValidCalendarDate(dateParts.y, dateParts.m, dateParts.d)) {
      result.dateError = 'Esta data não existe no calendário.';
    }
  }

  if (hasTime) {
    timeParts = parseTime(timeStr);
    if (!timeParts) {
      result.timeError = 'Hora inválida. Use o formato HH:MM.';
    } else if (!isValidTime(timeParts.h, timeParts.min)) {
      result.timeError = 'Hora fora do intervalo 00:00 a 23:59.';
    }
  }

  if (hasTime && !hasDate) {
    result.dateError = result.dateError ?? 'Informe também a data do nascimento.';
  }

  if (
    dateParts &&
    timeParts &&
    !result.dateError &&
    !result.timeError &&
    isValidCalendarDate(dateParts.y, dateParts.m, dateParts.d) &&
    isValidTime(timeParts.h, timeParts.min)
  ) {
    const composta = new Date(
      dateParts.y,
      dateParts.m - 1,
      dateParts.d,
      timeParts.h,
      timeParts.min,
      0,
      0,
    );
    const diffMin = (composta.getTime() - now.getTime()) / 60_000;
    const diffDias = (now.getTime() - composta.getTime()) / 86_400_000;

    if (diffMin > FUTURE_TOLERANCE_MIN) {
      result.generalError = 'A data/hora informada está no futuro.';
    } else if (diffDias > MAX_DAYS_PAST) {
      result.generalError = `Data/hora muito antiga (mais de ${MAX_DAYS_PAST} dias).`;
    }
  } else if (dateParts && !hasTime && !result.dateError) {
    // só data: validar futuro com base em fim do dia
    const fimDoDia = new Date(dateParts.y, dateParts.m - 1, dateParts.d, 23, 59, 59, 999);
    const inicioDoDia = new Date(dateParts.y, dateParts.m - 1, dateParts.d, 0, 0, 0, 0);
    if (inicioDoDia.getTime() - now.getTime() > 24 * 60 * 60_000) {
      result.generalError = 'A data informada está no futuro.';
    }
    void fimDoDia;
    const diffDias = (now.getTime() - inicioDoDia.getTime()) / 86_400_000;
    if (diffDias > MAX_DAYS_PAST) {
      result.generalError = `Data muito antiga (mais de ${MAX_DAYS_PAST} dias).`;
    }
  }

  result.ok = !result.dateError && !result.timeError && !result.generalError;
  return result;
}

/**
 * Combina data (YYYY-MM-DD) e hora (HH:mm) em string ISO local sem timezone
 * (ex.: "2026-06-02T11:30"). Compatível com Date constructor.
 * Retorna undefined se nenhum dos dois for fornecido ou se houver erro.
 */
export function composeISODateTime(dateStr: string, timeStr: string): string | undefined {
  const hasDate = dateStr.trim() !== '';
  if (!hasDate) return undefined;
  const dateParts = parseDate(dateStr);
  if (!dateParts || !isValidCalendarDate(dateParts.y, dateParts.m, dateParts.d)) {
    return undefined;
  }
  const time = timeStr.trim() === '' ? '00:00' : timeStr.trim();
  const timeParts = parseTime(time);
  if (!timeParts || !isValidTime(timeParts.h, timeParts.min)) {
    return undefined;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(dateParts.y)}-${pad(dateParts.m)}-${pad(dateParts.d)}T${pad(timeParts.h)}:${pad(timeParts.min)}`;
}

/** Decompõe string ISO local em {date: 'YYYY-MM-DD', time: 'HH:mm'}. */
export function splitISODateTime(iso?: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const [d, t] = iso.split('T');
  const time = t ? t.slice(0, 5) : '';
  return { date: d ?? '', time };
}
