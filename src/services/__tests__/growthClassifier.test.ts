import { describe, it, expect } from 'vitest';
import { classificarPesoPorIdadeGestacional } from '../growthClassifier';

describe('classificarPesoPorIdadeGestacional - INTERGROWTH-21st (33+0 a 42+6)', () => {
  it('classifica AIG quando peso entre P10 e P90', () => {
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 3380,
      sexo: 'M',
      idadeDias: 40 * 7,
    });
    expect(r.status).toBe('ok');
    expect(r.classificacao).toBe('AIG');
    expect(r.referencia).toMatch(/INTERGROWTH/);
  });

  it('classifica PIG quando peso < P10', () => {
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 2500,
      sexo: 'M',
      idadeDias: 40 * 7,
    });
    expect(r.classificacao).toBe('PIG');
  });

  it('classifica GIG quando peso > P90', () => {
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 5000,
      sexo: 'M',
      idadeDias: 40 * 7,
    });
    expect(r.classificacao).toBe('GIG');
  });

  it('respeita diferenças por sexo', () => {
    // Aos 39 semanas: P10 masc = 3.131, P10 fem = 3.020 → 3060g é PIG-masc/AIG-fem.
    const masc = classificarPesoPorIdadeGestacional({
      pesoGramas: 3060,
      sexo: 'M',
      idadeDias: 39 * 7,
    });
    const fem = classificarPesoPorIdadeGestacional({
      pesoGramas: 3060,
      sexo: 'F',
      idadeDias: 39 * 7,
    });
    expect(masc.classificacao).toBe('PIG');
    expect(fem.classificacao).toBe('AIG');
  });
});

describe('classificarPesoPorIdadeGestacional - Fenton & Kim (<33+0)', () => {
  it('usa curva Fenton para IG < 33+0', () => {
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 1485,
      sexo: 'M',
      idadeDias: 30 * 7,
    });
    expect(r.referencia).toMatch(/Fenton/);
    expect(r.classificacao).toBe('AIG');
  });

  it('classifica PIG em prematuro com peso baixo', () => {
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 800,
      sexo: 'F',
      idadeDias: 28 * 7,
    });
    expect(r.classificacao).toBe('PIG');
  });
});

describe('classificarPesoPorIdadeGestacional - validações', () => {
  it('retorna erro quando IG fora da faixa', () => {
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 3000,
      sexo: 'M',
      idadeDias: 23 * 7,
    });
    expect(r.status).toBe('erro');
  });

  it('retorna erro quando sexo ausente', () => {
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 3000,
      sexo: undefined as unknown as 'M',
      idadeDias: 40 * 7,
    });
    expect(r.status).toBe('erro');
  });

  it('interpola corretamente em dias intermediários', () => {
    const r38 = classificarPesoPorIdadeGestacional({
      pesoGramas: 3500,
      sexo: 'M',
      idadeDias: 38 * 7,
    });
    const r38mais3 = classificarPesoPorIdadeGestacional({
      pesoGramas: 3500,
      sexo: 'M',
      idadeDias: 38 * 7 + 3,
    });
    expect(r38.status).toBe('ok');
    expect(r38mais3.status).toBe('ok');
    expect(r38mais3.p50_kg).toBeGreaterThanOrEqual(r38.p50_kg ?? 0);
  });
});

describe('classificarPesoPorIdadeGestacional — testes de borda GIG/AIG', () => {
  it('classifica GIG quando peso está exatamente 1g acima do P90 interpolado', () => {
    // Menino 38+0: P90 = 4.224 kg. 4225g (4.225 kg) deve ser GIG
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 4225,
      sexo: 'M',
      idadeDias: 38 * 7,
    });
    expect(r.status).toBe('ok');
    expect(r.classificacao).toBe('GIG');
  });

  it('classifica AIG quando peso está 1g abaixo do P90 interpolado', () => {
    // Menino 38+0: P90 = 4.224 kg. 4223g (4.223 kg) deve ser AIG
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 4223,
      sexo: 'M',
      idadeDias: 38 * 7,
    });
    expect(r.status).toBe('ok');
    expect(r.classificacao).toBe('AIG');
  });

  it('classifica GIG em todas as semanas INTERGROWTH com peso claramente acima', () => {
    // Para cada semana 33-42, peso = P90 da semana * 1000 + 100g deve ser GIG
    for (let sem = 33; sem <= 42; sem++) {
      const r = classificarPesoPorIdadeGestacional({
        pesoGramas: 5500, // bem acima de qualquer P90
        sexo: 'M',
        idadeDias: sem * 7,
      });
      expect(r.classificacao).toBe('GIG');
    }
  });

  it('classifica GIG em dia intermediário com peso acima do P90', () => {
    // Menino 38+3 (269 dias): P90 interpolado entre 38w (4.224) e 39w (4.499)
    // P90 ≈ 4.224 + 3/7*(4.499-4.224) = 4.224 + 0.118 = 4.342
    // 4500g (4.500 kg) > 4.342 → GIG
    const r = classificarPesoPorIdadeGestacional({
      pesoGramas: 4500,
      sexo: 'M',
      idadeDias: 38 * 7 + 3,
    });
    expect(r.status).toBe('ok');
    expect(r.classificacao).toBe('GIG');
    expect(r.p90_kg).toBeGreaterThan(4.3);
    expect(r.p90_kg).toBeLessThan(4.4);
  });
});
