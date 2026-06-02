/**
 * Resolve "assets/<categoria>/<arquivo>.svg" (formato usado em capurro_config.json)
 * para a URL final processada pelo Vite.
 *
 * Importante: o Vite EXIGE caminhos literais relativos em import.meta.glob — aliases
 * como `@/` não são expandidos de forma confiável. Por isso usamos `../assets/...`.
 */
const svgModules = import.meta.glob('../assets/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const lookup: Record<string, string> = {};

for (const [absPath, url] of Object.entries(svgModules)) {
  // absPath chega como "../assets/orelha/orelha_0.svg" (relativo a src/utils/)
  // ou "/src/assets/orelha/orelha_0.svg" dependendo da config do Vite.
  const idx = absPath.indexOf('assets/');
  if (idx === -1) continue;
  const relPath = absPath.slice(idx); // "assets/orelha/orelha_0.svg"
  lookup[relPath] = url;
  // também indexa só pelo nome do arquivo como fallback
  const fileName = relPath.split('/').pop();
  if (fileName) {
    lookup[fileName] = url;
  }
}

export function resolveAsset(assetPath: string): string {
  if (!assetPath) return '';

  // 1) match exato no formato "assets/categoria/arquivo.svg"
  if (lookup[assetPath]) return lookup[assetPath];

  // 2) fallback por nome do arquivo (ex.: "orelha_0.svg")
  const fileName = assetPath.split('/').pop();
  if (fileName && lookup[fileName]) return lookup[fileName];

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[assets] não encontrado: ${assetPath}`, {
      keysDisponiveis: Object.keys(lookup).slice(0, 5),
      total: Object.keys(lookup).length,
    });
  }
  return '';
}

/** Apenas para testes/debug. */
export const __assetLookup = lookup;
