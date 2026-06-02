import { describe, expect, it } from 'vitest';
import {
  getApgarNext,
  getCadastroNext,
  getTotalSteps,
  showsApgarInReport,
  showsCapurroInReport,
  showsGrowthInReport,
} from '../evaluationFlow';

describe('evaluationFlow', () => {
  it('define passos por modo', () => {
    expect(getTotalSteps('completa')).toBe(6);
    expect(getTotalSteps('apgar')).toBe(2);
    expect(getTotalSteps('capurro_peso')).toBe(5);
  });

  it('encaminha cadastro conforme o modo', () => {
    expect(getCadastroNext('completa')).toBe('/apgar');
    expect(getCadastroNext('apgar')).toBe('/apgar');
    expect(getCadastroNext('capurro_peso')).toBe('/capurro/metodo');
  });

  it('Apgar isolado vai direto ao relatório', () => {
    expect(getApgarNext('apgar')).toBe('/relatorio');
    expect(getApgarNext('completa')).toBe('/capurro/metodo');
  });

  it('relatório mostra seções corretas', () => {
    expect(showsApgarInReport('apgar')).toBe(true);
    expect(showsApgarInReport('capurro_peso')).toBe(false);
    expect(showsCapurroInReport('capurro_peso')).toBe(true);
    expect(showsGrowthInReport('completa')).toBe(true);
    expect(showsGrowthInReport('apgar')).toBe(false);
  });
});
