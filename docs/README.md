# Documentação técnica e regulatória

Esta pasta contém a documentação clínica e técnica utilizada como base para o desenvolvimento do aplicativo. **Não é necessária em runtime** — só serve como referência para auditoria, revisão clínica e futuras evoluções.

## Arquivos

| Arquivo | Descrição |
|---|---|
| [`especificacao-sbp2022.md`](./especificacao-sbp2022.md) | **Especificação principal v2.0** — App Apgar + Capurro + PIG/AIG/GIG conforme **SBP 2022**. Base atual do código. |
| [`especificacao-v1-capurro.md`](./especificacao-v1-capurro.md) | Especificação histórica v1.0 — apenas Capurro + classificação de peso. Mantida como referência da evolução. |
| [`manifest-assets.json`](./manifest-assets.json) | Manifesto descritivo dos 47 SVGs autorais (item, código, score, label, asset). Útil para auditoria/inventário. |

## Mapeamento spec → código

| Item da spec v2.0 | Implementação |
|---|---|
| §3 Dados iniciais do RN | `src/pages/Cadastro.tsx` |
| §4A Apgar ampliado SBP 2022 | `src/pages/Apgar.tsx` + `src/services/apgarCalculator.ts` |
| §4 Métodos de Capurro | `src/pages/CapurroMetodo.tsx` + `src/pages/CapurroParametros.tsx` |
| §5 Pontuação por parâmetro | `src/data/capurro_config.json` (fonte de verdade) |
| §6 Cálculo da idade gestacional | `src/services/capurroCalculator.ts` |
| §7 Classificação PIG/AIG/GIG | `src/services/growthClassifier.ts` + `src/data/percentile_tables.ts` |
| §8 Estimativa de percentil | `src/services/percentileEstimator.ts` |
| §9 Gráfico PIG/AIG/GIG | `src/components/growth/GrowthChart.tsx` |
| §10 Telas do aplicativo | `src/pages/*` (7 telas) |
| §11 Regras de alerta clínico | `src/services/clinicalAlerts.ts` |
| §12 Arquivos de configuração | `src/data/capurro_config.json` |
| §13 Critérios de aceite | Cobertos por testes em `src/**/__tests__/*.test.ts` |
| §16 Checklist de implementação | 100% concluído |

## Referências oficiais (URLs externas)

- **Diretrizes SBP 2022 — RN ≥34 semanas**: https://www.sbp.com.br/fileadmin/user_upload/sbp/2022/maio/20/DiretrizesSBP-Reanimacao-RNigualMaior34semanas-MAIO2022.pdf
- **Diretrizes SBP 2022 — RN <34 semanas**: https://www.sbp.com.br/fileadmin/user_upload/sbp/2022/maio/20/DiretrizesSBP-Reanimacao-RNmenor34semanas-MAIO2022.pdf
- **Documento Científico SBP nº 33 (22/12/2022) — PIG**: https://www.sbp.com.br/fileadmin/user_upload/23772c-DC_PIG_AlemPeriodoNeonatal.pdf
- **INTERGROWTH-21st**: https://intergrowth21.com/tools-resources/newborn-size
- **Fenton & Kim 2013** — BMC Pediatrics. 2013;13:59.
- **Manual AIDPI Neonatal — MS/OPAS**: https://bvsms.saude.gov.br/bvs/publicacoes/manual_aidpi_neonatal_3ed_2012.pdf
- **Caderno RN de Risco/PR**: https://www.saude.pr.gov.br/sites/default/arquivos_restritos/files/documento/2020-07/pdf1.pdf

## Atualização da spec

Caso a SBP atualize as Diretrizes ou tabelas (ex.: nova edição), o fluxo recomendado é:

1. Substituir/atualizar `especificacao-sbp2022.md` mantendo histórico via Git.
2. Ajustar `src/data/capurro_config.json` (pontuações, fórmulas, regras de exibição).
3. Atualizar `src/data/percentile_tables.ts` se houver nova referência de tamanho ao nascimento.
4. Rodar `npm run test` — os testes de integridade alertam regressões automaticamente.
