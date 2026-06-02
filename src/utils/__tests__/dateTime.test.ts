import { describe, it, expect } from 'vitest';
import {
  composeISODateTime,
  isValidCalendarDate,
  isValidTime,
  parseDate,
  parseTime,
  splitISODateTime,
  validateBirthDateTime,
} from '../dateTime';

describe('parseDate / parseTime', () => {
  it('parseia datas no formato YYYY-MM-DD', () => {
    expect(parseDate('2026-06-02')).toEqual({ y: 2026, m: 6, d: 2 });
  });

  it('rejeita datas em outros formatos', () => {
    expect(parseDate('02/06/2026')).toBeNull();
    expect(parseDate('2026-6-2')).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate('abc')).toBeNull();
  });

  it('parseia horas no formato HH:mm', () => {
    expect(parseTime('11:30')).toEqual({ h: 11, min: 30 });
    expect(parseTime('00:00')).toEqual({ h: 0, min: 0 });
    expect(parseTime('23:59')).toEqual({ h: 23, min: 59 });
  });

  it('rejeita horas em outros formatos', () => {
    expect(parseTime('11:30:00')).toBeNull();
    expect(parseTime('1:30')).toBeNull();
    expect(parseTime('abc')).toBeNull();
  });
});

describe('isValidCalendarDate', () => {
  it.each([
    [2026, 6, 2, true],
    [2024, 2, 29, true],
    [2025, 2, 29, false],
    [2026, 2, 30, false],
    [2026, 13, 1, false],
    [2026, 4, 31, false],
    [2026, 0, 1, false],
    [1899, 1, 1, false],
    [2101, 1, 1, false],
  ])('isValidCalendarDate(%i, %i, %i) = %s', (y, m, d, esperado) => {
    expect(isValidCalendarDate(y, m, d)).toBe(esperado);
  });
});

describe('isValidTime', () => {
  it.each([
    [0, 0, true],
    [23, 59, true],
    [12, 30, true],
    [24, 0, false],
    [-1, 0, false],
    [12, 60, false],
    [12, -1, false],
  ])('isValidTime(%i, %i) = %s', (h, m, esperado) => {
    expect(isValidTime(h, m)).toBe(esperado);
  });
});

describe('validateBirthDateTime', () => {
  const now = new Date(2026, 5, 2, 12, 0, 0);

  it('aceita campos vazios (todos opcionais)', () => {
    const r = validateBirthDateTime('', '', now);
    expect(r.ok).toBe(true);
  });

  it('aceita data e hora válidas no passado', () => {
    const r = validateBirthDateTime('2026-06-01', '14:30', now);
    expect(r.ok).toBe(true);
  });

  it('rejeita data inexistente', () => {
    const r = validateBirthDateTime('2026-02-30', '10:00', now);
    expect(r.ok).toBe(false);
    expect(r.dateError).toMatch(/calendário/);
  });

  it('rejeita formato inválido de data', () => {
    const r = validateBirthDateTime('02/06/2026', '10:00', now);
    expect(r.ok).toBe(false);
    expect(r.dateError).toMatch(/formato/i);
  });

  it('rejeita hora inválida', () => {
    const r = validateBirthDateTime('2026-06-01', '25:00', now);
    expect(r.ok).toBe(false);
    expect(r.timeError).toBeDefined();
  });

  it('rejeita data/hora no futuro', () => {
    const r = validateBirthDateTime('2026-06-03', '10:00', now);
    expect(r.ok).toBe(false);
    expect(r.generalError).toMatch(/futuro/);
  });

  it('aceita data/hora dentro de tolerância de drift do relógio', () => {
    const r = validateBirthDateTime('2026-06-02', '12:03', now);
    expect(r.ok).toBe(true);
  });

  it('rejeita data muito antiga (>365 dias)', () => {
    const r = validateBirthDateTime('2024-01-01', '10:00', now);
    expect(r.ok).toBe(false);
    expect(r.generalError).toMatch(/antiga/);
  });

  it('exige data se hora foi preenchida', () => {
    const r = validateBirthDateTime('', '10:00', now);
    expect(r.ok).toBe(false);
    expect(r.dateError).toMatch(/data/i);
  });

  it('aceita data sozinha sem hora', () => {
    const r = validateBirthDateTime('2026-06-01', '', now);
    expect(r.ok).toBe(true);
  });
});

describe('composeISODateTime / splitISODateTime', () => {
  it('combina data e hora em ISO local', () => {
    expect(composeISODateTime('2026-06-02', '11:30')).toBe('2026-06-02T11:30');
  });

  it('compõe com 00:00 quando hora está ausente', () => {
    expect(composeISODateTime('2026-06-02', '')).toBe('2026-06-02T00:00');
  });

  it('retorna undefined se data ausente', () => {
    expect(composeISODateTime('', '11:30')).toBeUndefined();
  });

  it('retorna undefined se data inválida', () => {
    expect(composeISODateTime('2026-02-30', '11:30')).toBeUndefined();
  });

  it('decompõe ISO em data e hora', () => {
    expect(splitISODateTime('2026-06-02T11:30')).toEqual({ date: '2026-06-02', time: '11:30' });
  });

  it('decompõe ISO com segundos', () => {
    expect(splitISODateTime('2026-06-02T11:30:45')).toEqual({
      date: '2026-06-02',
      time: '11:30',
    });
  });

  it('lida com undefined', () => {
    expect(splitISODateTime(undefined)).toEqual({ date: '', time: '' });
  });

  it('round-trip: split → compose preserva o valor', () => {
    const iso = '2026-06-02T11:30';
    const partes = splitISODateTime(iso);
    expect(composeISODateTime(partes.date, partes.time)).toBe(iso);
  });
});
