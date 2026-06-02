import { describe, it, expect } from 'vitest';
import { calcularCapurro, classificarIdadeGestacional } from '../capurroCalculator';
import { capurroConfig } from '@/data/config';

describe('calcularCapurro - Capurro Somático', () => {
  it('aplica fórmula soma + 204 e converte em semanas+dias', () => {
    const r = calcularCapurro({
      metodo: 'capurro_somatico',
      respostas: {
        orelha: 16,
        glandula_mamaria: 10,
        mamilo: 10,
        pele: 10,
        pregas_plantares: 10,
      },
      config: capurroConfig,
    });
    expect(r.somaPontos).toBe(56);
    expect(r.idadeGestacionalDias).toBe(260);
    expect(r.idadeGestacionalSemanasCompletas).toBe(37);
    expect(r.idadeGestacionalDiasRestantes).toBe(1);
    expect(r.idadeGestacionalLabel).toBe('37+1');
    expect(r.classificacaoTermo).toBe('A termo');
  });

  it('classifica pré-termo quando IG < 37+0', () => {
    const r = calcularCapurro({
      metodo: 'capurro_somatico',
      respostas: {
        orelha: 8,
        glandula_mamaria: 5,
        mamilo: 5,
        pele: 5,
        pregas_plantares: 5,
      },
      config: capurroConfig,
    });
    expect(r.idadeGestacionalDias).toBe(232);
    expect(r.classificacaoTermo).toBe('Pré-termo');
  });

  it('classifica pós-termo quando IG >= 42+0', () => {
    const r = calcularCapurro({
      metodo: 'capurro_somatico',
      respostas: {
        orelha: 24,
        glandula_mamaria: 15,
        mamilo: 15,
        pele: 20,
        pregas_plantares: 20,
      },
      config: capurroConfig,
    });
    expect(r.idadeGestacionalDias).toBe(298);
    expect(r.classificacaoTermo).toBe('Pós-termo');
  });

  it('lança erro com parâmetro ausente', () => {
    expect(() =>
      calcularCapurro({
        metodo: 'capurro_somatico',
        respostas: { orelha: 8, glandula_mamaria: 5, mamilo: 5, pele: 5 },
        config: capurroConfig,
      }),
    ).toThrow(/pregas_plantares/);
  });
});

describe('calcularCapurro - Capurro Somático-Neurológico', () => {
  it('aplica fórmula soma + 200 e ignora "mamilo"', () => {
    const r = calcularCapurro({
      metodo: 'capurro_somatoneurologico',
      respostas: {
        orelha: 16,
        glandula_mamaria: 10,
        pele: 10,
        pregas_plantares: 10,
        xale: 12,
        cabeca: 8,
      },
      config: capurroConfig,
    });
    expect(r.somaPontos).toBe(66);
    expect(r.idadeGestacionalDias).toBe(266);
    expect(r.idadeGestacionalSemanasCompletas).toBe(38);
    expect(r.idadeGestacionalLabel).toBe('38+0');
    expect(r.classificacaoTermo).toBe('A termo');
  });

  it('exige sinal do xale e posição da cabeça', () => {
    expect(() =>
      calcularCapurro({
        metodo: 'capurro_somatoneurologico',
        respostas: {
          orelha: 16,
          glandula_mamaria: 10,
          pele: 10,
          pregas_plantares: 10,
        },
        config: capurroConfig,
      }),
    ).toThrow();
  });
});

describe('classificarIdadeGestacional', () => {
  it.each([
    [36 * 7 + 6, 'Pré-termo'],
    [37 * 7, 'A termo'],
    [41 * 7 + 6, 'A termo'],
    [42 * 7, 'Pós-termo'],
  ])('idade %i dias → %s', (dias, esperado) => {
    expect(classificarIdadeGestacional(dias)).toBe(esperado);
  });
});
