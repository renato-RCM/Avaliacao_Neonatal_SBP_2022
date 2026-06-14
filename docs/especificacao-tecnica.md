# 🏥 Avaliação Neonatal SBP 2022 — Especificação Técnica

**Versão:** 1.1.0 | **Última atualização:** 2026-06-14 | **Desenvolvedor:** Renato C. Miranda

---

## 1. Visão Geral do Projeto

Aplicação web progressiva (PWA) para avaliação clínica de recém-nascidos em sala de parto, seguindo as diretrizes da Sociedade Brasileira de Pediatria (SBP 2022). A ferramenta sistematiza o fluxo de avaliação neonatal, garantindo que nenhum procedimento seja esquecido e que todos os dados sejam registrados de forma padronizada.

### Objetivos principais
- Padronizar o registro da avaliação neonatal conforme SBP 2022
- Reduzir erros e omissões em ambientes de alta demanda
- Gerar texto clínico automaticamente para prontuário eletrônico
- Funcionar offline (PWA com cache)
- Ser responsivo para celular, tablet e desktop

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | 18.3+ |
| Linguagem | TypeScript | 5.6+ (strict) |
| Bundler | Vite | 5.4+ |
| CSS | Tailwind CSS | 3.4+ |
| Roteamento | React Router DOM | 6.28+ |
| Estado global | Zustand | 5.0+ (com persist localStorage) |
| Gráficos | Recharts | 2.14+ |
| Ícones | Lucide React | 0.460+ |
| Testes | Vitest + Testing Library | 2.1+ |
| Containerização | Docker (multi-stage) | — |

### Scripts npm
```
dev          vite
build        tsc -b && vite build
preview      vite preview
test         vitest run
test:watch   vitest
```

---

## 3. Estrutura de Arquivos

```
src/
├── App.tsx                        # Rotas React Router (10 rotas)
├── index.css                      # Tailwind + CSS custom (@layer base/components/utilities)
├── main.tsx                       # Entry point: StrictMode + BrowserRouter
│
├── assets/
│   ├── manifest_capurro_assets.json
│   ├── apgar/          # SVGs: frequencia_cardiaca_{0,1,2}.svg, respiracao_{0,1,2}.svg, etc.
│   ├── cabeca/         # SVGs: cabeca_{0,4,8,12}.svg
│   ├── glandula_mamaria/
│   ├── mamilo/         # SVGs: mamilo_{0,5,10,15}.svg
│   ├── orelha/         # SVGs: orelha_{0,8,16,24}.svg
│   ├── pele/           # SVGs: pele_{0,5,10,15,20}.svg
│   ├── pregas_plantares/
│   ├── xale/           # SVGs: xale_{0,6,12,16}.svg
│   └── graficos/
│
├── components/
│   ├── common/
│   │   ├── Alert.tsx         # severity: info | warning | danger
│   │   ├── Layout.tsx        # Shell: header + main + footer
│   │   ├── OptionCard.tsx    # Card de seleção (Capurro/Apgar) com imagem + score
│   │   ├── SectionCard.tsx   # Container de seção com título/descrição/badge
│   │   └── StepNav.tsx       # Barra de progresso + navegação
│   └── growth/
│       └── GrowthChart.tsx   # Gráfico Recharts (P3-P10-P50-P90-P97)
│
├── data/
│   ├── capurro_config.json   # Configuração completa (métodos, itens, apgar, growth)
│   ├── config.ts             # Re-export tipado como CapurroConfig
│   └── percentile_tables.ts  # INTERGROWTH-21st + Fenton & Kim 2013
│
├── hooks/
│   └── useEvaluationMode.tsx # useEvaluationMode(), RequireMode, RequireModes
│
├── pages/
│   ├── Home.tsx               # Menu principal (4 modos)
│   ├── Cadastro.tsx           # Dados iniciais do RN
│   ├── Apgar.tsx              # Boletim Apgar ampliado
│   ├── CapurroMetodo.tsx      # Seleção Somático vs Somático-Neurológico
│   ├── CapurroParametros.tsx  # Parâmetros com imagens
│   ├── ResultadoCapurro.tsx   # Resultado IG
│   ├── ResultadoPeso.tsx      # PIG/AIG/GIG + GrowthChart
│   ├── DecisaoEvolucao.tsx    # "Deseja adicionar Evolução de Enfermagem?"
│   ├── EvolucaoEnfermagem.tsx # Formulário 8 blocos da evolução
│   └── Relatorio.tsx          # Relatório final + cópia/impressão
│
├── services/
│   ├── apgarCalculator.ts
│   ├── capurroCalculator.ts
│   ├── clinicalAlerts.ts
│   ├── evolucaoEnfermagem.ts
│   ├── growthClassifier.ts
│   ├── percentileEstimator.ts
│   └── __tests__/
│
├── store/
│   └── useEvaluationStore.ts  # Zustand + persist v3
│
├── types/
│   └── domain.ts              # Todos os tipos TypeScript
│
├── utils/
│   ├── assets.ts              # Resolvedor de assets SVG (import.meta.glob)
│   ├── dateTime.ts            # Validação data/hora ISO
│   ├── evaluationFlow.ts      # Roteamento e labels dos modos
│   └── __tests__/
│
└── test/
    └── setup.ts               # Setup Vitest
```

---

## 4. Arquitetura de Estado (Zustand Store)

### Persistência
- **Key localStorage:** `avaliacao-neonatal-sbp-2022`
- **Versão do schema:** 3 (migração automática de versões anteriores)
- **partialize:** `evolucao` é EXCLUÍDA da persistência (só existe em memória durante a sessão)
- **migrate (v2→v3):** remove `evolucao` de dados persistidos antigos

### Estrutura do estado (`EvaluationState`)

```typescript
{
  rn: {
    identificacao?: string,
    sexo?: 'M' | 'F',
    pesoGramas?: number,
    dataHoraNascimento?: string,   // ISO 8601 local (YYYY-MM-DDTHH:mm)
    avaliador?: string,
    metodoCapurro?: CapurroMethod,
  },
  apgar: {
    registros: Partial<Record<ApgarMinute, ApgarMinuteRecord>>,
    // ApgarMinute = 1 | 5 | 10 | 15 | 20
    // ApgarMinuteRecord = { minuto, pontuacoes, intervencoes }
  },
  capurro: {
    metodo?: 'capurro_somatico' | 'capurro_somatoneurologico',
    respostas: Partial<Record<CapurroItemKey, number>>,
  },
  evolucao?: EvolucaoEnfermagemData,  // NÃO persistido
  ui: {
    modo?: 'completa' | 'apgar' | 'capurro_peso' | 'enfermagem',
    iniciadoEm?: string,
  },
}
```

### Actions
| Action | Descrição |
|---|---|
| `iniciarModo(modo)` | Limpa localStorage + reseta estado + define modo |
| `setRN(data)` | Atualiza dados do RN (merge parcial) |
| `setApgarItem(minuto, item, score)` | Define pontuação Apgar |
| `toggleApgarIntervencao(minuto, intervencao)` | Alterna intervenção de reanimação |
| `setCapurroMetodo(metodo)` | Define método Capurro + limpa respostas se método mudou |
| `setCapurroResposta(item, score)` | Define resposta de parâmetro Capurro |
| `setEvolucao(data)` | Atualiza evolução (merge parcial, NÃO persistido) |
| `clearEvolucao()` | Remove evolução da memória |
| `reset()` | Reseta TODO estado + remove localStorage |

---

## 5. Modos de Avaliação e Fluxo de Navegação

### EvaluationMode

```typescript
type EvaluationMode = 'completa' | 'apgar' | 'capurro_peso' | 'enfermagem';
```

### Fluxo por modo

**`completa` (6 etapas):**
Home → Cadastro → Apgar → CapurroMetodo → CapurroParametros → ResultadoCapurro → ResultadoPeso → DecisaoEvolucao → (EvolucaoEnfermagem) → Relatorio

**`apgar` (2 etapas):**
Home → Cadastro → Apgar → DecisaoEvolucao → (EvolucaoEnfermagem) → Relatorio

**`capurro_peso` (5 etapas):**
Home → Cadastro → CapurroMetodo → CapurroParametros → ResultadoCapurro → ResultadoPeso → DecisaoEvolucao → (EvolucaoEnfermagem) → Relatorio

**`enfermagem` (2 etapas):**
Home → Cadastro → EvolucaoEnfermagem → Relatorio

### Guardas de rota
| Hook | Comportamento |
|---|---|
| `RequireMode` | Redireciona para `/` se `ui.modo` for undefined |
| `RequireModes({ allowed })` | Redireciona para `/` se modo atual não estiver na lista |

### Regras de negócio por modo
| Modo | Sexo/Peso obrigatórios? | Apgar | Capurro | Growth | Evolução |
|---|---|---|---|---|---|
| completa | Sim | Sim | Sim | Sim | Opcional |
| apgar | Não | Sim | Não | Não | Opcional |
| capurro_peso | Sim | Não | Sim | Sim | Opcional |
| enfermagem | Não | Não | Não | Não | Obrigatória |

---

## 6. Tipos de Domínio

### Tipos principais

```typescript
type Sexo = 'M' | 'F';
type CapurroMethod = 'capurro_somatico' | 'capurro_somatoneurologico';
type ApgarMinute = 1 | 5 | 10 | 15 | 20;
type ApgarScore = 0 | 1 | 2;
type GrowthClassification = 'PIG' | 'AIG' | 'GIG';
type ViaNascimento = 'vaginal' | 'cesarea' | 'forceps';
type TesteRapidoResultado = 'nao_reagente' | 'reagente' | 'nao_necessario';
```

### Interfaces principais

**CapurroResult**
```typescript
{
  metodo: CapurroMethod;
  somaPontos: number;
  idadeGestacionalDias: number;
  idadeGestacionalSemanasDecimal: number;
  idadeGestacionalSemanasCompletas: number;
  idadeGestacionalDiasRestantes: number;
  idadeGestacionalLabel: string;        // Ex: "38+1"
  classificacaoTermo: 'Pré-termo' | 'A termo' | 'Pós-termo';
}
```

**GrowthResult**
```typescript
{
  status: 'ok' | 'erro';
  message?: string;
  classificacao?: 'PIG' | 'AIG' | 'GIG';
  pesoKg?: number;
  p3_kg?, p10_kg?, p50_kg?, p90_kg?, p97_kg?: number;
  percentilEstimado?: string;           // Ex: "≈P25–P50"
  referencia?: string;                  // Ex: "INTERGROWTH-21st"
}
```

**ExameFisicoField** (usado em EvolucaoEnfermagemData)
```typescript
{
  normal: boolean;        // true = normal, false = alterado/não avaliado
  descricao?: string;     // undefined = não avaliado, '' = alterado sem texto, '...' = alterado com texto
}
```

**EvolucaoEnfermagemData** — 8 blocos:
1. Dados maternos: viaNascimento, tipoSanguineoMae, tipoSanguineoRN, sifilisMae, hivMae, hepatiteBMae, hepatiteCMae
2. Amamentação: amamentacaoDificuldade, amamentacaoObservacao
3. Eliminações: eliminacoesVesicais, eliminacoesIntestinais, eliminacoesObservacao, vinculoBinomio
4. Sinais vitais: frequenciaCardiaca, frequenciaRespiratoria, temperatura
5. Exame físico (21 sistemas): cranio, fontanelas, facies, olhos, nariz, boca, orelhas, pescoco, torax, claviculas, mamas, acv, ar, abdome, cotoUmbilical, quadril, genitalia, anus, extremidades, perfusao, pulsos
6. Reflexos: reflexosNeurologicosNormal, reflexosNeurologicosDescricao
7. Intervenções: intervencoes (multilinha)
8. Prescrição: prescricao (multilinha)

---

## 7. Algoritmos e Regras Clínicas

### 7.1 Cálculo do Apgar

**Fonte:** SBP 2022 — Reanimação do RN ≥34 semanas

**Função:** `calcularApgarMinuto(registro: ApgarMinuteRecord): ApgarMinuteResult`

5 sinais avaliados:
- Frequência cardíaca (0=ausente, 1=<100, 2=>100)
- Respiração (0=ausente, 1=irregular, 2=forte/choro)
- Tônus muscular (0=flácido, 1=flexão parcial, 2=flexão completa)
- Irritabilidade reflexa (0=sem resposta, 1=careta, 2=choro/tosse)
- Cor (0=cianose/palidez, 1=acrocianose, 2=rosado)

**Regra SBP 2022:** Apgar NÃO decide início da reanimação. Se Apgar 5º minuto < 7, habilitar minutos 10, 15 e 20.

### 7.2 Cálculo do Capurro

**Fonte:** Método de Capurro (1978), adaptado conforme Caderno de Atenção à Saúde da Criança/PR

**Função:** `calcularCapurro({ metodo, respostas, config }): CapurroResult`

**Capurro Somático** (5 parâmetros):
| Parâmetro | Pontuações |
|---|---|
| Forma da orelha | 0, 8, 16, 24 |
| Tamanho glândula mamária | 0, 5, 10, 15 |
| Formação do mamilo | 0, 5, 10, 15 |
| Textura da pele | 0, 5, 10, 15, 20 |
| Pregas plantares | 0, 5, 10, 15, 20 |

Fórmula: `IG dias = soma dos pontos + 204`

**Capurro Somático-Neurológico** (6 parâmetros):
| Parâmetro | Pontuações |
|---|---|
| Orelha, glândula, pele, pregas | (mesmo do somático) |
| Sinal do xale | 0, 6, 12, 16 (configurável 16 ou 18) |
| Posição da cabeça | 0, 4, 8, 12 |

Fórmula: `IG dias = soma dos pontos + 200`

**Classificação:**
- < 37 semanas (259 dias): Pré-termo
- 37 a < 42 semanas (259-293 dias): A termo
- ≥ 42 semanas (294 dias): Pós-termo

### 7.3 Classificação PIG/AIG/GIG

**Fonte:** INTERGROWTH-21st (33+0 a 42+6) + Fenton & Kim 2013 (<33+0)

**Função:** `classificarPesoPorIdadeGestacional({ pesoGramas, sexo, idadeDias }): GrowthResult`

**Algoritmo:**
1. Seleciona a tabela de referência conforme idade gestacional
2. Interpola linearmente entre semanas inteiras para a IG exata em dias
3. Compara peso ao nascer com os percentis interpolados:
   - Peso < P10 → PIG (Pequeno para Idade Gestacional)
   - P10 ≤ Peso ≤ P90 → AIG (Adequado para Idade Gestacional)
   - Peso > P90 → GIG (Grande para Idade Gestacional)
4. Estima percentil aproximado por interpolação entre P3-P10-P50-P90-P97

**Faixa disponível:** 24+0 a 42+6 semanas

### 7.4 Alertas Clínicos

**Função:** `buildClinicalAlerts({ rn, capurro, growth, apgar5min }): ClinicalAlert[]`

| Condição | Severidade | Alerta |
|---|---|---|
| IG < 29 semanas | warning | Capurro pode não ser ideal — considerar New Ballard |
| Peso < 1500g | warning | RN de muito baixo peso |
| Peso próximo de P10 ou P90 (±5%) | info | Fronteira de classificação — reavaliar |
| Sexo não informado | danger | Impossível classificar PIG/AIG/GIG |
| Peso não informado | danger | Impossível classificar PIG/AIG/GIG |
| Curva indisponível (IG fora da faixa) | warning | IG fora da faixa das curvas (24+0 a 42+6) |
| Apgar 5º min < 7 | warning | Habilitar registro até 20 min |

### 7.5 Evolução de Enfermagem

**Função:** `gerarTextoEvolucao({ rn, capurro, growth, apgar1min, apgar5min, evolucao }): string`

Gera texto clínico em formato padronizado com:
- Horas de vida calculadas automaticamente (singular/plural: "1 hora" / "3 horas")
- Via de nascimento, Apgar, tipagem sanguínea, testes rápidos (Sífilis, HIV, Hep B, Hep C)
- Capurro e classificação PIG/AIG/GIG (se disponíveis)
- Amamentação, eliminações e vínculo
- Exame físico por sistemas (apenas sistemas avaliados)
- Reflexos neurológicos
- Intervenções de enfermagem (formato bullet points)
- Prescrição de enfermagem (formato bullet points)

**Regra de validação:** Sistemas marcados como alterados DEVEM ter descrição preenchida antes de salvar.

---

## 8. Regras de Data/Hora

### Validação
- Data: formato YYYY-MM-DD, ano 1900-2100, data real do calendário
- Hora: formato HH:mm, 00:00 a 23:59
- Combinação: não pode ser futura (>5 min de tolerância) nem >365 dias no passado
- Data sem hora: não pode ser futura, máximo 365 dias atrás

### Funções
```typescript
validateBirthDateTime(dateStr, timeStr, now?) → DateTimeValidation { ok, dateError?, timeError?, generalError? }
composeISODateTime(dateStr, timeStr) → string | undefined   // "YYYY-MM-DDTHH:mm"
splitISODateTime(iso?) → { date: string, time: string }
calcularIdadeHorasVida(iso?) → number | null                // horas desde o nascimento
```

---

## 9. Sistema de Assets (SVGs)

Os assets SVG são carregados via `import.meta.glob` do Vite para lazy loading.

**Manifest:** `assets/manifest_capurro_assets.json` — mapeia `itemKey/score` → `caminho/arquivo`

**Resolvedor:** `resolveAsset(path: string): string` — busca o SVG no glob e retorna a URL

**Exemplo:** `resolveAsset('/src/assets/orelha/orelha_16.svg')` → URL do asset no bundle

---

## 10. Design System (Tailwind CSS)

### Cores customizadas

| Token | Valores | Uso |
|---|---|---|
| `clinical` | violet-50 a violet-950 | Cor primária (antes azul, remapeada para violeta) |
| `success` | green-50 a green-700 | Estados de sucesso / Normal |
| `warning` | amber-50 a amber-700 | Alertas / Alterado |
| `danger` | red-50 a red-700 | Erros / Crítico |

### Classes de componentes

| Classe | Descrição |
|---|---|
| `.container-app` | Container principal: `max-w-3xl mx-auto px-4` |
| `.card-clickable` | Card clicável: `rounded-2xl border-violet-100 hover:border-violet-300` |
| `.card-selected` | Card selecionado: `border-violet-500 ring-2 bg-violet-50/80 scale-[1.02]` |
| `.btn` | Botão base: `rounded-xl px-5 py-3 min-h-[48px] active:scale-95` |
| `.btn-primary` | Gradiente violeta→roxo + sombra colorida |
| `.btn-secondary` | Branco com borda violeta |
| `.btn-ghost` | Transparente com hover violeta |
| `.input` | Input: `rounded-xl border-violet-200 focus:ring-violet-500/20` |
| `.label` | Label: `text-sm font-semibold text-slate-700` |
| `.badge` | Badge: `rounded-full px-2.5 py-0.5 text-xs` |

### Breakpoints
- `sm:` 640px (tablet)
- `md:` 768px
- `lg:` 1024px

### Font
- Família: Inter (com fallback system-ui)
- Features: cv02, cv03, cv04, cv11 (numerais tabulares, ligaduras)
- Inputs: 16px em mobile (evita zoom do iOS), 0.95rem em desktop

### Impressão
- Margens A4 (1.5cm)
- `.no-print` oculto
- `break-inside: avoid` em cards
- `print-color-adjust: exact` em badges
- Tabelas com bordas colapsadas

---

## 11. Regras de UX/UI

### Área de toque (mobile)
- Botões: `min-h-[48px]` (≥44px recomendado WCAG)
- Tipagem sanguínea: `py-3` (≥44px altura)

### Estados do Exame Físico
| Estado | `normal` | `descricao` | Badge | Borda | Ação |
|---|---|---|---|---|---|
| Não avaliado | `false` | `undefined` | "Não avaliado" (cinza) | violeta | "Marcar normal" |
| Normal | `true` | — | "Normal" (verde) | verde esq. | "Marcar alterado" |
| Alterado | `false` | `''` ou texto | "Alterado" (âmbar) | âmbar esq. | "Marcar normal" |

### Comportamento do toggle "Marcar alterado"
- Ao clicar: `normal: false, descricao: ''`
- Textarea aparece imediatamente
- Badge "Alterado" aparece imediatamente
- Ao salvar: valida se `descricao` não está vazia

### Responsividade
- 0 scroll horizontal em todos os breakpoints testados (360px a 1920px)
- Container `max-w-3xl` (768px) garante legibilidade
- Grid de tipagem: 4 colunas mobile, 8 (mãe) ou 5+1 (RN) desktop

---

## 12. Deploy

### Docker
- **Dockerfile:** multi-stage (Node build → Nginx serve)
- **docker-compose.build.yml:** build da imagem
- **docker-compose.runtime.yml:** execução com Nginx
- **nginx.conf:** servidor estático + headers de segurança + cache
- **Imagem Docker Hub:** `renatorcm/avaliacao-neonatal-sbp2022`

### Cloudflare Pages
- **Build command:** `npm run build` (tsc -b && vite build)
- **Output directory:** `dist`
- **Config:** sem Wrangler necessário (SPA estática)

### Publicação (publish.bat)
```
publish.bat vX.Y.Z [latest] [--no-git]
```
- Atualiza `package.json` com a versão
- Build Docker + push para Docker Hub
- Git commit + tag + push (opcional `--no-git`)

---

## 13. Referências e Fontes

### Diretrizes clínicas
- **SBP 2022:** Reanimação do RN ≥34 semanas e <34 semanas
- **Documento Científico SBP nº 33/2022:** PIG (22/12/2022)
- **INTERGROWTH-21st:** Newborn Size Standards (33+0 a 42+6 semanas)
- **Fenton & Kim 2013:** Preterm growth chart (<33+0 semanas)
- **Método de Capurro (1978):** estimativa de idade gestacional
- **Caderno de Atenção à Saúde da Criança/PR:** pontuação padrão do sinal do xale (16)

### Tecnologias
- **Tailwind CSS:** utility-first CSS framework
- **Zustand:** state management com persist (localStorage, partialize, migrate)
- **Recharts:** gráficos de percentis (ComposedChart)
- **Lucide React:** ícones SVG
- **Vite:** bundler com HMR, import.meta.glob, define
- **Vitest:** test runner compatível com Vite

---

## 14. Testes

### Cobertura de testes unitários
| Arquivo | Serviço testado |
|---|---|
| `apgarCalculator.test.ts` | Cálculo de Apgar, completude de registros, regra dos 20 min |
| `capurroCalculator.test.ts` | Cálculo Capurro, classificação IG, validação de método |
| `growthClassifier.test.ts` | Interpolação, classificação PIG/AIG/GIG, limites |
| `percentileEstimator.test.ts` | Estimativa de percentil por interpolação |
| `assets.test.ts` | Resolução de assets via glob |
| `dateTime.test.ts` | Validação e composição de data/hora |
| `evaluationFlow.test.ts` | Rotas e labels dos modos |
| `svgValidity.test.ts` | Validação de SVGs no manifest |

### Configuração
- Framework: Vitest
- Ambiente: jsdom
- Setup: `src/test/setup.ts`
- Matchers: @testing-library/jest-dom

---

## 15. Pontos de Atenção para Revisão

1. **Zustand persist v3:** `evolucao` é excluída do localStorage via `partialize`. A migração de v2→v3 remove `evolucao` de dados antigos.

2. **Tailwind JIT:** classes dinâmicas NÃO funcionam (ex: `bg-${color}-50`). Usar mapas de classes estáticas.

3. **tsc -b rigoroso:** O build production usa `tsc -b` que é mais estrito que `tsc --noEmit`. Todos os unused locals/parameters são erros.

4. **ExameFisicoField:** `descricao: undefined` = não avaliado, `descricao: ''` = alterado sem texto, `descricao: '...'` = alterado com texto. O serviço `gerarExameFisicoTextos` usa `!== undefined` (não truthy check).

5. **Horas de vida:** calculadas como `(agora - nascimento) / (1000*60*60)` com Math.round. Singular/plural automático.

6. **Sinal do xale:** padrão 16 pontos, configurável para 18 no `capurro_config.json`.

7. **Apgar condicional:** minutos 10/15/20 só aparecem se Apgar 5º min < 7 (regra SBP 2022).

---

*Documento gerado automaticamente a partir da análise do código-fonte. Versão do código: v1.1.0.*
