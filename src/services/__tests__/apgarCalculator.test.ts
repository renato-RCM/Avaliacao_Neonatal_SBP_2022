import { describe, it, expect } from 'vitest';
import {
  calcularApgarMinuto,
  isApgarMinutoCompleto,
  precisaRegistrarApgarAte20,
} from '../apgarCalculator';

describe('calcularApgarMinuto', () => {
  it('soma corretamente os 5 sinais', () => {
    const r = calcularApgarMinuto({
      minuto: 1,
      pontuacoes: {
        frequencia_cardiaca: 2,
        respiracao: 2,
        tonus_muscular: 1,
        irritabilidade_reflexa: 2,
        cor: 1,
      },
      intervencoes: ['O2 suplementar'],
    });
    expect(r.total).toBe(8);
    expect(r.minuto).toBe(1);
    expect(r.intervencoes).toContain('O2 suplementar');
    expect(r.interpretacao).toMatch(/≥ 7/);
  });

  it('marca interpretação Apgar < 7', () => {
    const r = calcularApgarMinuto({
      minuto: 5,
      pontuacoes: {
        frequencia_cardiaca: 1,
        respiracao: 1,
        tonus_muscular: 1,
        irritabilidade_reflexa: 1,
        cor: 1,
      },
      intervencoes: [],
    });
    expect(r.total).toBe(5);
    expect(r.interpretacao).toMatch(/< 7/);
  });

  it('lança erro com sinal ausente', () => {
    expect(() =>
      calcularApgarMinuto({
        minuto: 1,
        pontuacoes: {
          frequencia_cardiaca: 2,
          respiracao: 2,
          tonus_muscular: 1,
          irritabilidade_reflexa: 2,
        },
        intervencoes: [],
      }),
    ).toThrow(/cor/);
  });
});

describe('precisaRegistrarApgarAte20', () => {
  it('retorna true para Apgar 5min < 7', () => {
    expect(precisaRegistrarApgarAte20(6)).toBe(true);
  });
  it('retorna false para Apgar 5min >= 7', () => {
    expect(precisaRegistrarApgarAte20(7)).toBe(false);
  });
});

describe('isApgarMinutoCompleto', () => {
  it('reconhece registro completo', () => {
    expect(
      isApgarMinutoCompleto({
        minuto: 1,
        pontuacoes: {
          frequencia_cardiaca: 2,
          respiracao: 2,
          tonus_muscular: 2,
          irritabilidade_reflexa: 2,
          cor: 2,
        },
        intervencoes: [],
      }),
    ).toBe(true);
  });
  it('reconhece registro incompleto', () => {
    expect(
      isApgarMinutoCompleto({
        minuto: 1,
        pontuacoes: { frequencia_cardiaca: 2 },
        intervencoes: [],
      }),
    ).toBe(false);
  });
});
