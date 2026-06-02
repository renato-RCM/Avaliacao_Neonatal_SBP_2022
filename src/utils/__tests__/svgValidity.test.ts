import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Valida que todos os SVGs em src/assets sao XML bem-formado.
 *
 * Motivacao: caracteres como "<" precisam ser escapados como "&lt;" em
 * conteudo de texto e atributos. O navegador (e o image inliner do Vite)
 * podem renderizar a imagem como quebrada quando isso e violado, sem dar
 * erro fatal — exatamente o caso reportado em "frequencia_cardiaca_1.svg".
 */

const ROOT = join(process.cwd(), 'src', 'assets');

function listSvgs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      out.push(...listSvgs(full));
    } else if (entry.toLowerCase().endsWith('.svg')) {
      out.push(full);
    }
  }
  return out;
}

describe('integridade XML dos SVGs', () => {
  const svgs = listSvgs(ROOT);

  it('encontra ao menos 40 SVGs no diretorio src/assets', () => {
    expect(svgs.length).toBeGreaterThan(40);
  });

  it.each(svgs.map((p) => [p.replace(ROOT + '\\', '').replace(ROOT + '/', '').replace(/\\/g, '/')]))(
    '%s e XML bem-formado',
    (relPath) => {
      const fullPath = svgs.find((p) => p.endsWith(relPath.replace(/\//g, '\\')) || p.endsWith(relPath));
      expect(fullPath).toBeDefined();
      const content = readFileSync(fullPath!, 'utf-8');

      // 1) Nao pode haver "<" em valor de atributo (entre aspas duplas)
      const attrPattern = /="([^"]*)"/g;
      let m: RegExpExecArray | null;
      while ((m = attrPattern.exec(content)) !== null) {
        if (m[1].includes('<')) {
          throw new Error(
            `Caractere "<" sem escape em atributo: ${JSON.stringify(m[1])} em ${relPath}. Use &lt;.`,
          );
        }
      }

      // 2) Nao pode haver "<" em conteudo de texto (entre ">" e "<" subsequentes
      //    quando o "<" subsequente nao e o inicio de uma tag).
      //    Detecta o padrao: ">" + algo + " < " (com espaco) que indica conteudo, nao tag.
      //    Na pratica, o teste 1 ja captura a maioria dos casos. O parser DOMParser
      //    abaixo cobre o resto.

      // 3) Validacao final: parser DOM nativo (jsdom) — falha XML mal-formado.
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'image/svg+xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        throw new Error(`SVG mal-formado em ${relPath}: ${errorNode.textContent}`);
      }
    },
  );
});
