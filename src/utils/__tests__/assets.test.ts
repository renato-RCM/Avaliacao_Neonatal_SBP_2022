import { describe, it, expect } from 'vitest';
import { resolveAsset, __assetLookup } from '../assets';
import { capurroConfig } from '@/data/config';

function collectConfigAssetPaths(): string[] {
  const paths = new Set<string>();
  for (const item of Object.values(capurroConfig.items)) {
    for (const opt of item.options) {
      paths.add(opt.asset);
    }
  }
  for (const item of Object.values(capurroConfig.apgar.items)) {
    for (const opt of item.options) {
      paths.add(opt.asset);
    }
  }
  return Array.from(paths);
}

describe('assets lookup integridade', () => {
  it('o lookup foi preenchido com arquivos SVG', () => {
    const total = Object.keys(__assetLookup).length;
    expect(total).toBeGreaterThan(0);
  });

  it('todos os paths do capurro_config.json são resolvíveis', () => {
    const paths = collectConfigAssetPaths();
    expect(paths.length).toBeGreaterThan(40);

    const missing: string[] = [];
    for (const p of paths) {
      const url = resolveAsset(p);
      if (!url) missing.push(p);
    }
    expect(missing, `Assets ausentes:\n${missing.join('\n')}`).toEqual([]);
  });

  it('resolveAsset retorna string vazia para path desconhecido', () => {
    expect(resolveAsset('assets/inexistente/foo.svg')).toBe('');
  });

  it('aceita fallback por nome do arquivo', () => {
    const r = resolveAsset('orelha_0.svg');
    expect(r).toBeTruthy();
  });
});
