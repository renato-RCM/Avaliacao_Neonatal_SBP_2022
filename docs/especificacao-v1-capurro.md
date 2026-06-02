# Documentação técnica - App Capurro + PIG/AIG/GIG

**Versão:** 1.0  
**Objetivo:** especificar um aplicativo para estimar idade gestacional neonatal pelo método de Capurro e classificar o recém-nascido pelo peso ao nascer em relação à idade gestacional.

> **Uso clínico:** o aplicativo deve ser apresentado como ferramenta de apoio à avaliação profissional. O resultado não substitui avaliação médica/enfermagem neonatal, DUM confiável, ultrassonografia precoce ou protocolo institucional.

---

## 1. Escopo do aplicativo

O aplicativo deve permitir:

1. Registrar dados mínimos do recém-nascido.
2. Escolher o método de cálculo:
   - Capurro Somático.
   - Capurro Somático-Neurológico.
3. Exibir cada parâmetro com imagem, descrição e pontuação.
4. Calcular a idade gestacional estimada em dias, semanas decimais e semanas + dias.
5. Classificar a idade gestacional em pré-termo, termo ou pós-termo.
6. Inserir peso ao nascer e sexo.
7. Cruzar peso + sexo + idade gestacional com curva de referência.
8. Classificar em PIG, AIG ou GIG.
9. Exibir percentil aproximado e gráfico.
10. Gerar relatório simples do resultado.

---

## 2. Fontes oficiais e referências visuais

### 2.1. Capurro - fontes técnicas

1. **Manual AIDPI Neonatal - Ministério da Saúde/OPAS**  
   Contém descrição do método, imagens ilustrativas dos parâmetros físicos, orientações de exame e fórmula do Capurro somático.  
   URL principal:  
   `https://bvsms.saude.gov.br/bvs/publicacoes/manual_aidpi_neonatal_3ed_2012.pdf`  
   Páginas úteis:
   - `#page=105` - quadro visual dos 5 parâmetros somáticos com pontuação.
   - `#page=106` - descrição da orelha, glândula mamária e mamilo com fotos.
   - `#page=107` - descrição da pele, pregas plantares, fórmula e exemplo.
   - `#page=108` - gráfico de conversão dos pontos para semanas.
   - `#page=109` - fotografias de exercício/treino visual.

2. **Caderno de Atenção à Saúde da Criança - Recém-Nascido de Risco, Paraná**  
   Contém pontuação dos parâmetros somáticos e neurológicos, incluindo sinal do xale, posição da cabeça e fórmulas para Capurro somático e somático-neurológico.  
   URL:  
   `https://www.saude.pr.gov.br/sites/default/arquivos_restritos/files/documento/2020-07/pdf1.pdf`  
   Páginas úteis:
   - `#page=19` e `#page=20`.

3. **Artigo original**  
   Capurro H. et al. *A simplified method for diagnosis of gestational age in the newborn infant*. The Journal of Pediatrics, 1978.  
   DOI:  
   `https://doi.org/10.1016/S0022-3476(78)80153-X`

### 2.2. Curvas de peso ao nascer por idade gestacional - INTERGROWTH-21st

1. Página oficial de recursos:  
   `https://intergrowth21.com/tools-resources/newborn-size`

2. Calculadora oficial/manual entry:  
   `https://intergrowth21.ndog.ox.ac.uk/pt/manualentry`

3. Tabelas de peso ao nascer - 33+0 a 42+6 semanas:
   - Meninos: `https://intergrowth21.com/sites/default/files/2023-02/grow_newborn-ct-boys_bw_table.pdf`
   - Meninas: `https://intergrowth21.com/sites/default/files/2023-02/grow_newborn-ct-girls_bw_table.pdf`

4. Gráficos de peso ao nascer - 33+0 a 42+6 semanas:
   - Meninos: `https://intergrowth21.com/sites/default/files/2023-02/grow_newborn-ct-boys_bw_en.pdf`
   - Meninas: `https://intergrowth21.com/sites/default/files/2023-02/grow_newborn-ct-girls_bw_en.pdf`

5. Curvas/tabelas para muito prematuros - 24+0 a 32+6 semanas:
   - Meninos, gráfico combinado: `https://intergrowth21.com/sites/default/files/2023-01/grow_vp-nb-combined-ct-boys_en.pdf`
   - Meninas, gráfico combinado: `https://intergrowth21.com/sites/default/files/2023-02/grow_vp-nb-combined-ct-girls_en.pdf`
   - Meninos, tabela de peso: `https://intergrowth21.ndog.ox.ac.uk/Content/PDF/VeryPreterm/INTERGROWTH-21st_Weight_Standards_Boys.pdf`
   - Meninas, tabela de peso: pesquisar/baixar no portal oficial INTERGROWTH em caso de alteração de URL.

### 2.3. Observação importante sobre uso de imagens externas

As imagens de sites, PDFs e apostilas podem ter direitos autorais. Para uso em aplicativo comercial, **não usar hotlink nem copiar imagens sem licença explícita**. Este pacote inclui **SVGs autorais simplificados** para representar cada achado e pontuação no app. As imagens externas devem ser usadas como referência técnica/visual para validação clínica e redesenho.

---

## 3. Dados iniciais do RN

### Campos obrigatórios

| Campo | Tipo | Obrigatório | Observação |
|---|---:|---:|---|
| Identificação do RN | texto | não | Pode ser anônimo. |
| Sexo biológico ao nascimento | enum: `M`, `F` | sim | Necessário para curva INTERGROWTH. |
| Peso ao nascer | número | sim | Registrar em gramas. |
| Método de Capurro | enum | sim | `capurro_somatico` ou `capurro_somatoneurologico`. |
| Data/hora de nascimento | data/hora | não | Útil para relatório. |
| Avaliador | texto | não | Profissional que realizou o exame. |

### Validações iniciais

- Peso deve ser maior que 300 g e menor que 7000 g.
- Sexo deve ser informado para classificação PIG/AIG/GIG.
- Não permitir cálculo se algum parâmetro obrigatório do método escolhido estiver ausente.
- Exibir alerta quando a idade gestacional estimada for menor que 29 semanas: Capurro não é ideal para prematuridade extrema; considerar New Ballard ou protocolo institucional.

---

## 4. Métodos de Capurro

### 4.1. Capurro Somático

Usa 5 parâmetros físicos:

1. Forma da orelha.
2. Tamanho da glândula mamária.
3. Formação do mamilo.
4. Textura da pele.
5. Pregas plantares.

**Fórmula:**

```text
idade_gestacional_dias = soma_pontos + 204
idade_gestacional_semanas_decimal = (soma_pontos + 204) / 7
```

### 4.2. Capurro Somático-Neurológico

Usa 4 parâmetros somáticos + 2 neurológicos:

1. Forma da orelha.
2. Tamanho da glândula mamária.
3. Textura da pele.
4. Pregas plantares.
5. Sinal do xale.
6. Posição da cabeça ao levantar o RN.

**Não usa formação do mamilo** nessa versão.

**Fórmula:**

```text
idade_gestacional_dias = soma_pontos + 200
idade_gestacional_semanas_decimal = (soma_pontos + 200) / 7
```

### 4.3. Atenção sobre divergência na pontuação do sinal do xale

Algumas referências/calculadoras apresentam a última opção do **sinal do xale** com **18 pontos**, enquanto documentos institucionais brasileiros também aparecem com **16 pontos**. Para segurança, o app deve manter essa pontuação **configurável por protocolo institucional**.

Configuração padrão sugerida neste projeto: **16 pontos**, conforme o Caderno de Atenção à Saúde da Criança - Recém-Nascido de Risco/PR. Caso o serviço utilize outra tabela validada localmente, o app deve permitir alterar para 18 sem modificar o código-fonte.

---

## 5. Pontuação detalhada e imagens por parâmetro

Os arquivos SVG abaixo estão no pacote `/assets`. Cada card deve exibir:

- imagem,
- nome do parâmetro,
- descrição do achado,
- pontuação,
- botão de seleção.

### 5.1. Forma da orelha / pavilhão auricular

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `orelha_0` | 0 | Chata, disforme, pavilhão não encurvado | `assets/orelha/orelha_0.svg` | AIDPI `#page=105` |
| `orelha_8` | 8 | Pavilhão parcialmente encurvado no bordo superior | `assets/orelha/orelha_8.svg` | AIDPI `#page=105` |
| `orelha_16` | 16 | Pavilhão encurvado em toda a borda superior | `assets/orelha/orelha_16.svg` | AIDPI `#page=105` |
| `orelha_24` | 24 | Pavilhão totalmente encurvado | `assets/orelha/orelha_24.svg` | AIDPI `#page=105` |

Orientação clínica na tela:

> Observar sem tocar. Avaliar a curvatura do bordo superior do pavilhão auricular. Se uma orelha estiver achatada pela posição do nascimento, não usar essa orelha como referência.

---

### 5.2. Tamanho da glândula mamária

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `glandula_0` | 0 | Não palpável | `assets/glandula_mamaria/glandula_0.svg` | AIDPI `#page=105` |
| `glandula_5` | 5 | Palpável, diâmetro menor que 5 mm | `assets/glandula_mamaria/glandula_5.svg` | AIDPI `#page=105` |
| `glandula_10` | 10 | Palpável, diâmetro entre 5 e 10 mm | `assets/glandula_mamaria/glandula_10.svg` | AIDPI `#page=105` |
| `glandula_15` | 15 | Palpável, diâmetro maior que 10 mm | `assets/glandula_mamaria/glandula_15.svg` | AIDPI `#page=105` |

Orientação clínica na tela:

> Antes de medir, pinçar suavemente o tecido celular subcutâneo adjacente para diferenciar tecido mamário de tecido subcutâneo. Palpar em volta do mamilo e medir o diâmetro do nódulo mamário.

---

### 5.3. Formação do mamilo

Usado somente no **Capurro Somático**.

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `mamilo_0` | 0 | Apenas visível, sem aréola | `assets/mamilo/mamilo_0.svg` | AIDPI `#page=105` |
| `mamilo_5` | 5 | Mamilo nítido, aréola lisa, diâmetro menor que 7,5 mm | `assets/mamilo/mamilo_5.svg` | AIDPI `#page=105` |
| `mamilo_10` | 10 | Mamilo puntiforme, aréola maior que 7,5 mm, borda não elevada | `assets/mamilo/mamilo_10.svg` | AIDPI `#page=105` |
| `mamilo_15` | 15 | Mamilo puntiforme, aréola maior que 7,5 mm, borda elevada | `assets/mamilo/mamilo_15.svg` | AIDPI `#page=105` |

Orientação clínica na tela:

> Observar ambos os mamilos e medir o diâmetro da aréola. Verificar presença de aréola, pontilhado e elevação do bordo.

---

### 5.4. Textura da pele

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `pele_0` | 0 | Muito fina e gelatinosa | `assets/pele/pele_0.svg` | AIDPI `#page=105` e `#page=107` |
| `pele_5` | 5 | Fina e lisa | `assets/pele/pele_5.svg` | AIDPI `#page=105` |
| `pele_10` | 10 | Algo mais grossa, com discreta descamação superficial | `assets/pele/pele_10.svg` | AIDPI `#page=105` |
| `pele_15` | 15 | Grossa, com rugas superficiais e descamação em mãos e pés | `assets/pele/pele_15.svg` | AIDPI `#page=105` |
| `pele_20` | 20 | Grossa, apergaminhada/enrugada, com marcas profundas | `assets/pele/pele_20.svg` | AIDPI `#page=105` |

Orientação clínica na tela:

> Palpar e examinar antebraços, mãos, pernas e pés. Observar descamação no dorso das mãos/pés e presença/profundidade de rachaduras.

---

### 5.5. Pregas plantares / sulcos plantares

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `pregas_0` | 0 | Sem pregas | `assets/pregas_plantares/pregas_0.svg` | AIDPI `#page=105` e `#page=107` |
| `pregas_5` | 5 | Marcas mal definidas na metade anterior da planta | `assets/pregas_plantares/pregas_5.svg` | AIDPI `#page=105` |
| `pregas_10` | 10 | Marcas bem definidas na metade anterior e sulcos no terço anterior | `assets/pregas_plantares/pregas_10.svg` | AIDPI `#page=105` |
| `pregas_15` | 15 | Sulcos na metade anterior da planta | `assets/pregas_plantares/pregas_15.svg` | AIDPI `#page=105` |
| `pregas_20` | 20 | Sulcos em mais da metade anterior da planta | `assets/pregas_plantares/pregas_20.svg` | AIDPI `#page=105` |

Orientação clínica na tela:

> Observar as duas plantas dos pés e hiperestender a pele para diferenciar pregas de sulcos. Pregas tendem a desaparecer com extensão; sulcos permanecem marcados.

---

### 5.6. Sinal do xale

Usado somente no **Capurro Somático-Neurológico**.

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `xale_0` | 0 | Cotovelo alcança a linha axilar anterior do lado oposto | `assets/xale/xale_0.svg` | Caderno PR `#page=19` |
| `xale_6` | 6 | Cotovelo entre a linha axilar anterior do lado oposto e a linha média | `assets/xale/xale_6.svg` | Caderno PR `#page=19` |
| `xale_12` | 12 | Cotovelo ao nível da linha média | `assets/xale/xale_12.svg` | Caderno PR `#page=19` |
| `xale_16` | 16 | Cotovelo entre a linha média e a linha axilar anterior do mesmo lado | `assets/xale/xale_16.svg` | Caderno PR `#page=19` |

Orientação clínica na tela:

> Com o RN em decúbito dorsal, levar suavemente a mão/braço em direção ao ombro contralateral e observar a posição do cotovelo. Não forçar a articulação.

---

### 5.7. Posição da cabeça ao levantar o RN

Usado somente no **Capurro Somático-Neurológico**.

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `cabeca_0` | 0 | Cabeça totalmente deflexionada, ângulo cérvico-torácico aproximado de 270° | `assets/cabeca/cabeca_0.svg` | Caderno PR `#page=19` |
| `cabeca_4` | 4 | Ângulo cérvico-torácico entre 180° e 270° | `assets/cabeca/cabeca_4.svg` | Caderno PR `#page=19` |
| `cabeca_8` | 8 | Ângulo cérvico-torácico igual a 180° | `assets/cabeca/cabeca_8.svg` | Caderno PR `#page=19` |
| `cabeca_12` | 12 | Ângulo cérvico-torácico menor que 180° | `assets/cabeca/cabeca_12.svg` | Caderno PR `#page=19` |

Orientação clínica na tela:

> Avaliar o controle/tônus cervical ao levantar suavemente o RN, observando o ângulo entre cabeça e tronco.

---

## 6. Cálculo da idade gestacional

### 6.1. Pseudocódigo geral

```javascript
function calcularCapurro({ metodo, respostas, config }) {
  const metodoConfig = config.methods[metodo];

  if (!metodoConfig) {
    throw new Error('Método inválido');
  }

  const itensObrigatorios = metodoConfig.items;

  for (const item of itensObrigatorios) {
    if (respostas[item] === undefined || respostas[item] === null) {
      throw new Error(`Parâmetro obrigatório ausente: ${item}`);
    }
  }

  const somaPontos = itensObrigatorios.reduce((total, item) => {
    return total + Number(respostas[item]);
  }, 0);

  const idadeDias = somaPontos + metodoConfig.constant_days;
  const semanasCompletas = Math.floor(idadeDias / 7);
  const diasRestantes = idadeDias % 7;
  const semanasDecimal = Number((idadeDias / 7).toFixed(1));

  return {
    metodo,
    soma_pontos: somaPontos,
    idade_gestacional_dias: idadeDias,
    idade_gestacional_semanas_decimal: semanasDecimal,
    idade_gestacional_semanas_completas: semanasCompletas,
    idade_gestacional_dias_restantes: diasRestantes,
    idade_gestacional_label: `${semanasCompletas}+${diasRestantes}`
  };
}
```

### 6.2. Classificação da idade gestacional

```javascript
function classificarIdadeGestacional(idadeDias) {
  if (idadeDias < 37 * 7) {
    return 'Pré-termo';
  }

  if (idadeDias < 42 * 7) {
    return 'A termo';
  }

  return 'Pós-termo';
}
```

Critérios:

| Classificação | Critério |
|---|---|
| Pré-termo | menor que 37+0 semanas |
| A termo | 37+0 a 41+6 semanas |
| Pós-termo | 42+0 semanas ou mais |

---

## 7. Classificação PIG/AIG/GIG

Após calcular a idade gestacional, o app deve cruzar:

- sexo do RN,
- idade gestacional em semanas + dias,
- peso ao nascer,
- curva de referência escolhida.

Classificação:

| Classificação | Critério |
|---|---|
| PIG | Peso abaixo do percentil 10 para sexo e idade gestacional |
| AIG | Peso entre percentil 10 e percentil 90 |
| GIG | Peso acima do percentil 90 para sexo e idade gestacional |

### 7.1. Fonte padrão recomendada

Usar INTERGROWTH-21st como padrão internacional.

Implementação sugerida:

- Para IG de **24+0 a 32+6**, usar tabela INTERGROWTH Very Preterm Size at Birth References.
- Para IG de **33+0 a 42+6**, usar tabela INTERGROWTH Newborn Size Standards.
- Se a idade gestacional sair da faixa disponível, retornar erro controlado.

### 7.2. Estrutura de dados para tabela de percentis

```json
{
  "sex": "M",
  "ga_weeks": 40,
  "ga_days_extra": 0,
  "ga_total_days": 280,
  "p3_kg": 2.63,
  "p5_kg": 2.73,
  "p10_kg": 2.88,
  "p50_kg": 3.38,
  "p90_kg": 3.94,
  "p95_kg": 4.11,
  "p97_kg": 4.22,
  "source": "INTERGROWTH-21st Newborn Size Standards"
}
```

### 7.3. Função de classificação

```javascript
function classificarPesoPorIdadeGestacional({ pesoGramas, sexo, idadeDias, tabela }) {
  const pesoKg = pesoGramas / 1000;

  const ref = tabela.find(row =>
    row.sex === sexo && row.ga_total_days === idadeDias
  );

  if (!ref) {
    return {
      status: 'erro',
      message: 'Idade gestacional fora da faixa da curva disponível.'
    };
  }

  let classificacao;

  if (pesoKg < ref.p10_kg) {
    classificacao = 'PIG';
  } else if (pesoKg > ref.p90_kg) {
    classificacao = 'GIG';
  } else {
    classificacao = 'AIG';
  }

  return {
    status: 'ok',
    classificacao,
    peso_kg: Number(pesoKg.toFixed(3)),
    p10_kg: ref.p10_kg,
    p50_kg: ref.p50_kg,
    p90_kg: ref.p90_kg,
    referencia: ref.source
  };
}
```

---

## 8. Estimativa aproximada do percentil

Quando a tabela possuir P3, P5, P10, P50, P90, P95 e P97, o app pode estimar percentil por interpolação linear entre os pontos mais próximos.

```javascript
function estimarPercentilAproximado(pesoKg, ref) {
  const pontos = [
    { p: 3, valor: ref.p3_kg },
    { p: 5, valor: ref.p5_kg },
    { p: 10, valor: ref.p10_kg },
    { p: 50, valor: ref.p50_kg },
    { p: 90, valor: ref.p90_kg },
    { p: 95, valor: ref.p95_kg },
    { p: 97, valor: ref.p97_kg }
  ];

  if (pesoKg < ref.p3_kg) return '<P3';
  if (pesoKg > ref.p97_kg) return '>P97';

  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i];
    const b = pontos[i + 1];

    if (pesoKg >= a.valor && pesoKg <= b.valor) {
      const ratio = (pesoKg - a.valor) / (b.valor - a.valor);
      const percentil = a.p + ratio * (b.p - a.p);
      return `P${Math.round(percentil)}`;
    }
  }

  return 'Percentil não estimado';
}
```

---

## 9. Gráfico PIG/AIG/GIG

O app deve gerar um gráfico dinâmico usando os dados oficiais importados.

### Eixo X

Idade gestacional ao nascimento.

- Para muito prematuros: 24+0 a 32+6.
- Para padrão de recém-nascidos: 33+0 a 42+6.

### Eixo Y

Peso ao nascer em kg ou gramas.

### Linhas obrigatórias

- P10.
- P50.
- P90.

### Linhas opcionais

- P3.
- P5.
- P95.
- P97.

### Ponto do RN

Exibir o ponto do RN com:

```json
{
  "x": "40+2",
  "y": 3.240,
  "label": "RN avaliado"
}
```

### Imagem autoral ilustrativa do pacote

`assets/graficos/grafico_percentil_pig_aig_gig.svg`

Essa imagem é apenas um ícone/placeholder para representar a tela. O gráfico real deve ser renderizado com biblioteca como Recharts, Chart.js, ECharts, Highcharts ou SVG nativo.

---

## 10. Telas do aplicativo

### Tela 1 - Cadastro inicial

Campos:

- Identificação do RN.
- Sexo.
- Peso ao nascer.
- Data/hora do nascimento.
- Método desejado.

Botão: **Iniciar avaliação**.

### Tela 2 - Escolha do método

Cards:

1. **Capurro Somático**  
   Indicado quando se deseja estimar IG por 5 características físicas.

2. **Capurro Somático-Neurológico**  
   Indicado quando o RN permite avaliação neurológica segura e não há comprometimento neurológico aparente.

### Tela 3 - Avaliação dos parâmetros

Para cada parâmetro:

- Nome do item.
- Orientação clínica curta.
- Cards com imagem + achado + pontuação.
- Apenas uma opção pode ser selecionada por item.
- Exibir soma parcial de pontos no rodapé.

### Tela 4 - Resultado Capurro

Exibir:

- Método utilizado.
- Pontuação total.
- Idade gestacional em dias.
- Idade gestacional em semanas + dias.
- Idade gestacional decimal.
- Classificação: pré-termo, termo ou pós-termo.
- Alerta de margem de erro.

### Tela 5 - Peso x idade gestacional

Exibir:

- Peso ao nascer.
- Sexo.
- Curva utilizada.
- P10, P50, P90 de referência para a idade gestacional.
- Classificação PIG/AIG/GIG.
- Percentil aproximado.
- Gráfico com ponto do RN.

### Tela 6 - Relatório

Texto sugerido:

```text
Resultado da avaliação neonatal

Método: Capurro Somático
Pontuação total: 43 pontos
Idade gestacional estimada: 35 semanas e 2 dias
Idade gestacional decimal: 35,3 semanas
Classificação por idade gestacional: Pré-termo

Peso ao nascer: 2100 g
Sexo: Feminino
Curva utilizada: INTERGROWTH-21st
Classificação peso/idade gestacional: AIG
Percentil estimado: P45

Observação: O método de Capurro é uma estimativa clínica e deve ser correlacionado com DUM, ultrassonografia precoce, avaliação neonatal e protocolo institucional.
```

---

## 11. Regras de alerta clínico

| Situação | Alerta |
|---|---|
| IG estimada < 29+0 | Capurro pode não ser o método ideal para prematuridade extrema. Considerar New Ballard/protocolo institucional. |
| Peso < 1500 g | RN de muito baixo peso. Resultado deve ser interpretado com cautela e por profissional habilitado. |
| Peso próximo ao P10 ou P90 | A classificação pode mudar considerando a margem de erro da IG. |
| Sem sexo informado | Não é possível classificar PIG/AIG/GIG sem sexo. |
| Sem peso informado | Não é possível classificar PIG/AIG/GIG sem peso ao nascer. |
| IG fora da tabela | Curva de referência não disponível para essa idade gestacional. |
| Uso da versão neurológica em RN com alteração neurológica | Não recomendado; considerar outro método/protocolo. |

---

## 12. Arquivos de configuração inclusos no pacote

### 12.1. `capurro_config.json`

Contém:

- métodos,
- constante da fórmula,
- itens obrigatórios por método,
- opções de cada item,
- pontuação,
- caminho da imagem SVG.

### 12.2. `assets/manifest_capurro_assets.json`

Contém a lista de todos os assets autorais gerados para o app.

---

## 13. Critérios de aceite do projeto

O app será considerado funcional quando:

1. Permitir escolher entre Capurro Somático e Capurro Somático-Neurológico.
2. Exibir imagem, descrição e pontuação de cada opção.
3. Usar os itens corretos para cada método.
4. Somar pontos corretamente.
5. Aplicar a constante correta:
   - Somático: +204.
   - Somático-Neurológico: +200.
6. Retornar idade gestacional em dias, semanas decimais e semanas + dias.
7. Classificar pré-termo/termo/pós-termo.
8. Importar tabela de percentis INTERGROWTH por sexo e idade gestacional.
9. Classificar PIG/AIG/GIG usando P10 e P90.
10. Exibir percentil aproximado.
11. Exibir gráfico com o ponto do RN.
12. Mostrar alertas de cautela quando necessário.
13. Permitir configurar a pontuação final do sinal do xale conforme protocolo institucional.
14. Gerar relatório copiável/exportável.

---

## 14. Estrutura de pastas sugerida

```text
capurro-app/
  src/
    data/
      capurro_config.json
      intergrowth_birthweight_boys.json
      intergrowth_birthweight_girls.json
      intergrowth_verypreterm_boys.json
      intergrowth_verypreterm_girls.json
    assets/
      orelha/
      glandula_mamaria/
      mamilo/
      pele/
      pregas_plantares/
      xale/
      cabeca/
      graficos/
    services/
      capurroCalculator.ts
      growthClassifier.ts
      percentileEstimator.ts
    components/
      MethodSelector.tsx
      CapurroItemCard.tsx
      ResultPanel.tsx
      GrowthChart.tsx
      ClinicalAlert.tsx
```

---

## 15. Prompt direto para o desenvolvedor

Criar um aplicativo clínico responsivo para calcular idade gestacional neonatal pelo método de Capurro e classificar peso por idade gestacional.

O app deve usar o arquivo `capurro_config.json` como fonte de verdade para os métodos, itens, pontuações e imagens. Deve renderizar cada parâmetro em cards com imagem SVG, descrição do achado e pontuação. O usuário deve escolher uma opção por parâmetro. Para Capurro Somático, usar orelha, glândula mamária, mamilo, pele e pregas plantares, somar os pontos e aplicar `idade_dias = pontos + 204`. Para Capurro Somático-Neurológico, usar orelha, glândula mamária, pele, pregas plantares, sinal do xale e posição da cabeça, somar os pontos e aplicar `idade_dias = pontos + 200`.

O resultado deve ser mostrado em dias, semanas decimais e semanas + dias. Depois, o app deve receber peso ao nascer em gramas e sexo do RN, consultar tabela INTERGROWTH-21st por sexo e idade gestacional e classificar o peso como PIG, AIG ou GIG. PIG é abaixo do P10; AIG é entre P10 e P90; GIG é acima do P90. O app deve estimar percentil aproximado por interpolação entre percentis disponíveis e renderizar gráfico com P10, P50, P90 e ponto do RN.

O app deve exibir alertas quando a idade gestacional estimada for menor que 29 semanas, quando o peso for menor que 1500 g, quando peso estiver próximo de P10/P90, quando faltarem sexo/peso ou quando a idade gestacional estiver fora da curva disponível.

Usar os assets SVG inclusos neste pacote para representação visual autoral dos achados. Usar as imagens dos PDFs oficiais apenas como referência técnica, não como cópia direta, salvo se houver liberação/licença adequada.

---

## 16. Checklist de implementação

- [ ] Criar tela inicial com dados do RN.
- [ ] Criar seleção de método.
- [ ] Renderizar cards dos itens a partir de `capurro_config.json`.
- [ ] Validar preenchimento obrigatório.
- [ ] Implementar cálculo do Capurro Somático.
- [ ] Implementar cálculo do Capurro Somático-Neurológico.
- [ ] Implementar conversão dias -> semanas + dias.
- [ ] Implementar classificação pré-termo/termo/pós-termo.
- [ ] Importar tabelas INTERGROWTH.
- [ ] Implementar PIG/AIG/GIG.
- [ ] Implementar percentil aproximado.
- [ ] Implementar gráfico.
- [ ] Implementar relatório final.
- [ ] Criar testes unitários para soma dos pontos e fórmulas.
- [ ] Criar teste para RN no P10, P50 e P90.
- [ ] Criar mensagem de cautela clínica no rodapé do resultado.
