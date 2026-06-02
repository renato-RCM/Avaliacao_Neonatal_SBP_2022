# Avaliação Neonatal SBP 2022

Aplicativo web clínico de **apoio** à avaliação neonatal em sala de parto:

- **Boletim de Apgar ampliado** (1, 5, 10, 15 e 20 minutos) com registro de manobras de reanimação.
- **Idade gestacional pelo método de Capurro** (Somático e Somático-Neurológico).
- **Classificação peso ao nascer × idade gestacional** (PIG / AIG / GIG) com:
  - **INTERGROWTH-21st Newborn Size Standards** para 33+0 a 42+6 semanas.
  - **Fenton & Kim 2013** para idades gestacionais &lt; 33+0 semanas.

> Conformidade clínica: Diretrizes 2022 da Sociedade Brasileira de Pediatria sobre reanimação do RN ≥34 e &lt;34 semanas, e Documento Científico SBP nº 33 (22/12/2022) sobre PIG.

---

## ⚠️ Aviso clínico

Este aplicativo é uma **ferramenta de apoio à avaliação profissional**. Os resultados **não substituem** avaliação médica/enfermagem neonatal, DUM confiável, ultrassonografia precoce ou protocolo institucional. **O Apgar não decide reanimação** — segue avaliação imediata e diretrizes SBP 2022.

---

## Arquitetura

- **Vite + React 18 + TypeScript** — build rápido e type safety nas fórmulas clínicas.
- **TailwindCSS** — UI mobile-first responsiva.
- **React Router** — navegação entre as 7 telas (wizard clínico).
- **Zustand + persist** — estado global com persistência local (avaliação não se perde em reload).
- **Recharts** — gráfico PIG/AIG/GIG com P3/P10/P50/P90/P97 + ponto do RN.
- **Vitest + Testing Library** — testes unitários das fórmulas (Capurro, Apgar, classificação, percentil).

### Princípios

1. **`capurro_config.json` é a fonte de verdade** dos parâmetros, pontuações e assets — alterações de protocolo (ex.: sinal do xale 16↔18) não exigem mudança de código.
2. **Cálculos isolados em `src/services/`** — funções puras, determinísticas e 100% testadas.
3. **Tabelas de percentis embutidas** em `src/data/percentile_tables.ts` — funcionamento offline.
4. **Mobile-first**: cards grandes (mín. 48px), texto legível, contraste AA, navegação inferior fixa.
5. **Disclaimers clínicos sempre visíveis** (rodapé + alertas contextuais).

### Estrutura

```
src/
├── assets/                 # SVGs autorais (Apgar, Capurro, gráficos)
├── components/
│   ├── common/             # Layout, StepNav, Alert, OptionCard, SectionCard
│   └── growth/             # GrowthChart (Recharts)
├── data/
│   ├── capurro_config.json # Fonte de verdade do protocolo
│   ├── config.ts
│   └── percentile_tables.ts# INTERGROWTH-21st + Fenton & Kim
├── pages/                  # As 7 telas
├── services/
│   ├── apgarCalculator.ts
│   ├── capurroCalculator.ts
│   ├── growthClassifier.ts
│   ├── percentileEstimator.ts
│   └── clinicalAlerts.ts
├── store/
│   └── useEvaluationStore.ts (Zustand + persist)
├── types/
│   └── domain.ts
└── utils/
    └── assets.ts (resolve SVGs via import.meta.glob)
```

---

## Como rodar

Pré-requisito: Node.js 18+ (recomendado 20 ou 22).

```bash
# instalar dependências
npm install

# desenvolvimento (http://localhost:5173)
npm run dev

# testes unitários
npm run test

# build de produção (gera ./dist)
npm run build

# preview do build
npm run preview

# lint e formatação
npm run lint
npm run format
```

### Deploy

A pasta `dist/` gerada por `npm run build` é estática — pode ser hospedada em qualquer CDN/servidor (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, Nginx). O app não requer backend.

---

## Telas (fluxo wizard)

1. **Início** — apresentação e início de nova avaliação.
2. **Cadastro** — identificação, sexo (obrigatório), peso (obrigatório), data/hora, avaliador.
3. **Apgar ampliado** — minutos 1 e 5 obrigatórios; 10/15/20 habilitados se Apgar 5min &lt; 7. Manobras de reanimação registráveis por minuto.
4. **Capurro — método** — escolha entre Somático e Somático-Neurológico.
5. **Capurro — parâmetros** — cards com SVG, descrição e pontuação. Soma e IG projetada em tempo real.
6. **Resultado Capurro** — IG em dias, semanas+dias, decimal e classificação termo.
7. **Peso × IG** — classificação PIG/AIG/GIG, percentil estimado e gráfico.
8. **Relatório** — texto copiável e impressão (PDF via `Ctrl+P`).

---

## Documentação técnica

A especificação clínica completa, o mapeamento spec → código e o manifesto dos assets estão em [`docs/`](./docs/README.md):

- [`docs/especificacao-sbp2022.md`](./docs/especificacao-sbp2022.md) — especificação principal (base do código).
- [`docs/especificacao-v1-capurro.md`](./docs/especificacao-v1-capurro.md) — versão histórica (referência).
- [`docs/manifest-assets.json`](./docs/manifest-assets.json) — manifesto dos 47 SVGs autorais.
- [`docs/README.md`](./docs/README.md) — índice e mapeamento spec → arquivos do código.

## Referências oficiais

- **Diretrizes SBP 2022 — Reanimação do RN ≥34 semanas em sala de parto**: https://www.sbp.com.br/fileadmin/user_upload/sbp/2022/maio/20/DiretrizesSBP-Reanimacao-RNigualMaior34semanas-MAIO2022.pdf
- **Diretrizes SBP 2022 — Reanimação do RN &lt;34 semanas em sala de parto**: https://www.sbp.com.br/fileadmin/user_upload/sbp/2022/maio/20/DiretrizesSBP-Reanimacao-RNmenor34semanas-MAIO2022.pdf
- **Documento Científico SBP nº 33 (22/12/2022) — PIG além do período neonatal**: https://www.sbp.com.br/fileadmin/user_upload/23772c-DC_PIG_AlemPeriodoNeonatal.pdf
- **INTERGROWTH-21st Newborn Size Standards**: https://intergrowth21.com/tools-resources/newborn-size
- **Fenton TR, Kim JH.** *A systematic review and meta-analysis to revise the Fenton growth chart for preterm infants.* BMC Pediatrics. 2013;13:59.
- **Manual AIDPI Neonatal — Ministério da Saúde/OPAS**: https://bvsms.saude.gov.br/bvs/publicacoes/manual_aidpi_neonatal_3ed_2012.pdf
- **Caderno de Atenção à Saúde da Criança — RN de Risco/PR**: https://www.saude.pr.gov.br/sites/default/arquivos_restritos/files/documento/2020-07/pdf1.pdf
- **Capurro H. et al.** *A simplified method for diagnosis of gestational age in the newborn infant.* J Pediatr 1978. DOI: 10.1016/S0022-3476(78)80153-X

---

## Licença e direitos autorais

- Código-fonte: livre para uso clínico interno e educacional.
- SVGs em `src/assets/`: ilustrações **autorais** simplificadas representando os achados — uso permitido neste app. Não são cópias dos PDFs oficiais.
- Imagens de PDFs oficiais não são reutilizadas; servem apenas como referência técnica/visual para validação clínica.

---

## Privacidade

- Não há backend. Todos os dados ficam **somente no dispositivo** (`localStorage` do navegador).
- Não evite armazenar dados pessoais sensíveis sem consentimento adequado conforme a LGPD.
- Para uso institucional, recomenda-se ativar contexto privado/anônimo após cada uso.
