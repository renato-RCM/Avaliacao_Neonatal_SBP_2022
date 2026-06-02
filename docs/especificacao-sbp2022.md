# Documentação técnica - App Apgar + Capurro + PIG/AIG/GIG - SBP 2022

**Versão:** 2.0 - atualização SBP 2022  
**Objetivo:** especificar um aplicativo para registrar Boletim de Apgar ampliado, estimar idade gestacional neonatal pelo método de Capurro e classificar o recém-nascido pelo peso ao nascer em relação à idade gestacional, conforme recomendações da Sociedade Brasileira de Pediatria de 2022 para reanimação neonatal e classificação do RN pequeno para idade gestacional.

> **Uso clínico:** o aplicativo deve ser apresentado como ferramenta de apoio à avaliação profissional. O resultado não substitui avaliação médica/enfermagem neonatal, DUM confiável, ultrassonografia precoce ou protocolo institucional.

---

## 0. Conferência dos requisitos enviados

### Requisitos solicitados

| Requisito | Status no pacote atualizado | Observação |
|---|---|---|
| Apgar | **Incluído nesta versão 2.0** | Inclui pontuação 0, 1 e 2 para os 5 sinais, cálculo por minuto, regra de repetição até 20 minutos quando necessário e registro de manobras de reanimação. |
| Capurro | **Já estava incluído** | Mantidos Capurro Somático e Capurro Somático-Neurológico, com imagens autorais, pontuações e fórmulas. |
| Peso ao nascer × idade gestacional pelo Capurro | **Já estava incluído e foi ajustado** | A IG calculada pelo Capurro alimenta a classificação de peso/IG. |
| Classificação PIG/AIG/GIG | **Incluída e revisada conforme SBP 2022** | PIG abaixo do P10; AIG entre P10 e P90; GIG acima do P90. |
| Base nas diretrizes/documentos SBP 2022 | **Incluída nesta versão 2.0** | Incluídas as Diretrizes SBP 2022 de Reanimação Neonatal e o Documento Científico SBP 2022 sobre PIG. |
| Imagem para cada item e cada pontuação | **Incluída** | Existem SVGs autorais para Capurro e para Apgar. Links externos oficiais ficam como referência técnica, não como imagem copiada. |

### Ajuste importante para alinhamento com SBP 2022

No requisito foi usado o termo “curva de crescimento intrauterino”. Para manter o projeto tecnicamente alinhado com o Documento Científico da SBP de 2022 sobre PIG, a especificação deve usar o termo **curva/referência de tamanho ao nascimento** para classificar peso ao nascer por idade gestacional. A SBP informa que, na ausência de referência nacional, recomenda-se **INTERGROWTH-21st para 33 a 42 semanas** e **Fenton & Kim para menores de 33 semanas**, alertando que curvas de crescimento intrauterino/fetal não são a melhor opção para avaliar tamanho ao nascimento.

---

## 1. Escopo do aplicativo

O aplicativo deve permitir:

1. Registrar dados mínimos do recém-nascido.
2. Registrar **Boletim de Apgar ampliado** nos minutos 1, 5, 10, 15 e 20, quando aplicável.
3. Calcular o Apgar de cada minuto a partir de 5 sinais clínicos.
4. Registrar procedimentos de reanimação associados ao Apgar ampliado.
5. Escolher o método de cálculo da idade gestacional:
   - Capurro Somático.
   - Capurro Somático-Neurológico.
6. Exibir cada parâmetro de Apgar e Capurro com imagem, descrição e pontuação.
7. Calcular a idade gestacional estimada em dias, semanas decimais e semanas + dias.
8. Classificar a idade gestacional em pré-termo, termo ou pós-termo.
9. Inserir peso ao nascer e sexo.
10. Cruzar peso + sexo + idade gestacional com referência de tamanho ao nascimento.
11. Classificar em PIG, AIG ou GIG.
12. Exibir percentil aproximado e gráfico.
13. Gerar relatório simples do resultado.

---

## 2. Fontes oficiais e referências visuais

### 2.0. Sociedade Brasileira de Pediatria - fontes obrigatórias para esta versão

1. **Diretrizes 2022 da Sociedade Brasileira de Pediatria - Reanimação do recém-nascido ≥34 semanas em sala de parto**  
   URL: `https://www.sbp.com.br/fileadmin/user_upload/sbp/2022/maio/20/DiretrizesSBP-Reanimacao-RNigualMaior34semanas-MAIO2022.pdf`  
   Uso no projeto:
   - Boletim de Apgar ampliado.
   - Regra de registro no 1º e 5º minuto.
   - Repetição a cada 5 minutos até 20 minutos se Apgar < 7 no 5º minuto.
   - Observação de que o Apgar não define a necessidade de reanimação; serve para documentação clínica e resposta às manobras.
   - Registro das manobras: O2 suplementar, VPP com máscara, VPP com cânula, CPAP nasal, massagem cardíaca, adrenalina/expansor.

2. **Diretrizes 2022 da Sociedade Brasileira de Pediatria - Reanimação do recém-nascido <34 semanas em sala de parto**  
   URL: `https://www.sbp.com.br/fileadmin/user_upload/sbp/2022/maio/20/DiretrizesSBP-Reanimacao-RNmenor34semanas-MAIO2022.pdf`  
   Uso no projeto:
   - Mesma estrutura de Boletim de Apgar ampliado.
   - Apoio para prematuros menores de 34 semanas.

3. **Documento Científico SBP - Pequeno para idade gestacional, além do período neonatal: O que o pediatra precisa saber? Nº 33, 22 de dezembro de 2022**  
   URL: `https://www.sbp.com.br/fileadmin/user_upload/23772c-DC_PIG_AlemPeriodoNeonatal.pdf`  
   Uso no projeto:
   - Critério PIG por peso ao nascimento abaixo do percentil 10 para idade gestacional.
   - Escolha da referência: INTERGROWTH-21st para 33 a 42 semanas e Fenton & Kim para menores de 33 semanas.
   - Alerta de que curvas fetais/intrauterinas não são a melhor opção para avaliar tamanho ao nascimento.


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

5. **Para RN com idade gestacional menor que 33 semanas, conforme SBP 2022, usar Fenton & Kim 2013**:
   - Calculadoras e recursos: `https://live-ucalgary.ucalgary.ca/resource/preterm-growth-chart/calculators-apps`
   - Artigo-base: Fenton TR, Kim JH. *A systematic review and meta-analysis to revise the Fenton growth chart for preterm infants*. BMC Pediatrics. 2013;13:59.

> Observação técnica: manter os links do INTERGROWTH Very Preterm apenas como referência complementar, mas a configuração padrão SBP 2022 deste projeto deve escolher Fenton & Kim para IG <33 semanas.

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
| Apgar 1º minuto | objeto/pontuação | sim | Pontuação dos 5 sinais clínicos no 1º minuto. |
| Apgar 5º minuto | objeto/pontuação | sim | Pontuação dos 5 sinais clínicos no 5º minuto. |
| Apgar 10/15/20 minutos | objeto/pontuação | condicional | Obrigatório se Apgar <7 no 5º minuto ou conforme protocolo institucional. |
| Método de Capurro | enum | sim | `capurro_somatico` ou `capurro_somatoneurologico`. |
| Data/hora de nascimento | data/hora | não | Útil para relatório. |
| Avaliador | texto | não | Profissional que realizou o exame. |

### Validações iniciais

- Peso deve ser maior que 300 g e menor que 7000 g.
- Sexo deve ser informado para classificação PIG/AIG/GIG.
- Não permitir cálculo se algum parâmetro obrigatório do método escolhido estiver ausente.
- Exibir alerta quando a idade gestacional estimada for menor que 29 semanas: Capurro não é ideal para prematuridade extrema; considerar New Ballard ou protocolo institucional.

---

## 4A. Boletim de Apgar ampliado - SBP 2022

O módulo de Apgar deve ser independente do módulo de Capurro. Ele avalia a condição clínica do RN por minuto de vida, enquanto o Capurro estima idade gestacional.

### 4A.1. Minutos de registro

Campos obrigatórios mínimos:

- 1º minuto.
- 5º minuto.

Campos condicionais:

- 10º minuto.
- 15º minuto.
- 20º minuto.

Regra clínica de exibição:

```text
Se Apgar do 5º minuto < 7, habilitar e recomendar registro a cada 5 minutos até 20 minutos de vida.
```

Regra de segurança:

```text
O Apgar não deve ser usado para decidir o início de reanimação neonatal. As condutas de reanimação devem seguir avaliação imediata de vitalidade, frequência cardíaca, respiração e diretrizes institucionais/SBP.
```

### 4A.2. Pontuação do Apgar

Cada sinal recebe 0, 1 ou 2 pontos. A soma total em cada minuto varia de 0 a 10.

```text
apgar_total_minuto = frequência_cardíaca + respiração + tônus_muscular + irritabilidade_reflexa + cor
valor mínimo = 0
valor máximo = 10
```

### 4A.3. Sinais, pontuações e imagens

#### Frequência cardíaca

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `apgar_fc_0` | 0 | Ausente | `assets/apgar/frequencia_cardiaca_0.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_fc_1` | 1 | Menor que 100 bpm | `assets/apgar/frequencia_cardiaca_1.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_fc_2` | 2 | Maior que 100 bpm | `assets/apgar/frequencia_cardiaca_2.svg` | SBP ≥34 semanas, Anexo 4 |

#### Respiração

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `apgar_resp_0` | 0 | Ausente | `assets/apgar/respiracao_0.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_resp_1` | 1 | Irregular | `assets/apgar/respiracao_1.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_resp_2` | 2 | Regular ou choro forte | `assets/apgar/respiracao_2.svg` | SBP ≥34 semanas, Anexo 4 |

#### Tônus muscular

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `apgar_tonus_0` | 0 | Flacidez total | `assets/apgar/tonus_0.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_tonus_1` | 1 | Alguma flexão | `assets/apgar/tonus_1.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_tonus_2` | 2 | Movimentos ativos | `assets/apgar/tonus_2.svg` | SBP ≥34 semanas, Anexo 4 |

#### Irritabilidade reflexa / resposta ao estímulo tátil

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `apgar_reflexo_0` | 0 | Sem resposta | `assets/apgar/reflexo_0.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_reflexo_1` | 1 | Careta | `assets/apgar/reflexo_1.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_reflexo_2` | 2 | Choro ou movimento de retirada | `assets/apgar/reflexo_2.svg` | SBP ≥34 semanas, Anexo 4 |

#### Cor

| Código | Pontos | Achado | Imagem autoral do pacote | Referência visual externa |
|---|---:|---|---|---|
| `apgar_cor_0` | 0 | Cianose ou palidez | `assets/apgar/cor_0.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_cor_1` | 1 | Corpo róseo com extremidades cianóticas | `assets/apgar/cor_1.svg` | SBP ≥34 semanas, Anexo 4 |
| `apgar_cor_2` | 2 | Corpo e extremidades róseos | `assets/apgar/cor_2.svg` | SBP ≥34 semanas, Anexo 4 |

### 4A.4. Registro de reanimação no Apgar ampliado

Para cada minuto registrado, o app deve permitir marcar as intervenções realizadas:

- O2 suplementar.
- VPP com máscara.
- VPP com cânula.
- CPAP nasal.
- Massagem cardíaca.
- Adrenalina/Expansor.

Essas informações devem aparecer no relatório final, separadas da pontuação do Apgar.

### 4A.5. Pseudocódigo do Apgar

```javascript
function calcularApgarMinuto(respostas) {
  const itens = [
    'frequencia_cardiaca',
    'respiracao',
    'tonus_muscular',
    'irritabilidade_reflexa',
    'cor'
  ];

  for (const item of itens) {
    if (respostas[item] === undefined || respostas[item] === null) {
      throw new Error(`Sinal obrigatório ausente: ${item}`);
    }

    if (![0, 1, 2].includes(Number(respostas[item]))) {
      throw new Error(`Pontuação inválida para: ${item}`);
    }
  }

  const total = itens.reduce((soma, item) => soma + Number(respostas[item]), 0);

  return {
    total,
    interpretacao_operacional: total < 7 ? 'Apgar menor que 7: manter documentação seriada conforme protocolo.' : 'Apgar igual ou maior que 7.'
  };
}

function precisaRegistrarApgarAte20(apgar5min) {
  return apgar5min < 7;
}
```

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

### 7.1. Fonte padrão recomendada conforme SBP 2022

A configuração padrão do app deve seguir a recomendação do Documento Científico SBP 2022 sobre PIG:

- Para IG de **33+0 a 42+6**, usar **INTERGROWTH-21st Newborn Size Standards**.
- Para IG **menor que 33+0**, usar **Fenton & Kim 2013**.
- Se a idade gestacional sair da faixa disponível, retornar erro controlado.
- Não nomear esta tela como “curva de crescimento intrauterino” quando a finalidade for classificar tamanho ao nascimento; usar “referência de tamanho ao nascimento” ou “peso ao nascer por idade gestacional”.

Implementação sugerida:

```text
Se IG >= 33+0 e IG <= 42+6: usar INTERGROWTH-21st.
Se IG < 33+0: usar Fenton & Kim.
Se IG fora da referência: bloquear classificação automática e exibir alerta.
```

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

### Tela 2 - Boletim de Apgar ampliado

Para cada minuto habilitado, exibir os 5 sinais do Apgar com cards 0, 1 e 2:

- Frequência cardíaca.
- Respiração.
- Tônus muscular.
- Irritabilidade reflexa/resposta ao estímulo tátil.
- Cor.

Minutos obrigatórios: 1 e 5.

Se Apgar do 5º minuto for menor que 7, habilitar 10, 15 e 20 minutos.

Também permitir marcar os procedimentos realizados naquele minuto:

- O2 suplementar.
- VPP com máscara.
- VPP com cânula.
- CPAP nasal.
- Massagem cardíaca.
- Adrenalina/Expansor.

### Tela 3 - Escolha do método Capurro

Cards:

1. **Capurro Somático**  
   Indicado quando se deseja estimar IG por 5 características físicas.

2. **Capurro Somático-Neurológico**  
   Indicado quando o RN permite avaliação neurológica segura e não há comprometimento neurológico aparente.

### Tela 4 - Avaliação dos parâmetros do Capurro

Para cada parâmetro:

- Nome do item.
- Orientação clínica curta.
- Cards com imagem + achado + pontuação.
- Apenas uma opção pode ser selecionada por item.
- Exibir soma parcial de pontos no rodapé.

### Tela 5 - Resultado Capurro

Exibir:

- Método utilizado.
- Pontuação total.
- Idade gestacional em dias.
- Idade gestacional em semanas + dias.
- Idade gestacional decimal.
- Classificação: pré-termo, termo ou pós-termo.
- Alerta de margem de erro.

### Tela 6 - Peso x idade gestacional

Exibir:

- Peso ao nascer.
- Sexo.
- Curva utilizada.
- P10, P50, P90 de referência para a idade gestacional.
- Classificação PIG/AIG/GIG.
- Percentil aproximado.
- Gráfico com ponto do RN.

### Tela 7 - Relatório

Texto sugerido:

```text
Resultado da avaliação neonatal

Apgar 1º minuto: 8
Apgar 5º minuto: 9
Apgar seriado 10/15/20 min: não aplicável
Procedimentos registrados: nenhum

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
| Apgar do 5º minuto < 7 | Habilitar registro a cada 5 minutos até 20 minutos. |
| Usuário tenta usar Apgar para decidir reanimação | Exibir aviso: Apgar é documentação clínica; reanimação deve seguir avaliação imediata e diretrizes SBP/protocolo institucional. |

---

## 12. Arquivos de configuração inclusos no pacote

### 12.1. `capurro_config.json`

Contém:

- módulo Apgar,
- minutos de registro,
- sinais do Apgar,
- pontuação 0/1/2 de cada sinal,
- procedimentos de reanimação para documentação,
- métodos de Capurro,
- constante da fórmula,
- itens obrigatórios por método,
- opções de cada item,
- pontuação,
- caminho da imagem SVG,
- regra SBP 2022 para seleção da referência de peso por idade gestacional.

### 12.2. `assets/manifest_capurro_assets.json`

Contém a lista de todos os assets autorais gerados para o app.

---

## 13. Critérios de aceite do projeto

O app será considerado funcional quando:

1. Permitir registrar Apgar no 1º e 5º minuto.
2. Habilitar 10, 15 e 20 minutos quando Apgar do 5º minuto for menor que 7.
3. Calcular Apgar por minuto somando 5 sinais de 0 a 2 pontos.
4. Permitir registrar procedimentos do Apgar ampliado.
5. Permitir escolher entre Capurro Somático e Capurro Somático-Neurológico.
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

Criar um aplicativo clínico responsivo para registrar Boletim de Apgar ampliado, calcular idade gestacional neonatal pelo método de Capurro e classificar peso por idade gestacional conforme SBP 2022.

O app deve usar o arquivo `capurro_config.json` como fonte de verdade para Apgar, métodos de Capurro, itens, pontuações, imagens e regra de escolha da referência de crescimento/tamanho ao nascimento. Deve renderizar cada parâmetro em cards com imagem SVG, descrição do achado e pontuação. O usuário deve escolher uma opção por parâmetro. Para Capurro Somático, usar orelha, glândula mamária, mamilo, pele e pregas plantares, somar os pontos e aplicar `idade_dias = pontos + 204`. Para Capurro Somático-Neurológico, usar orelha, glândula mamária, pele, pregas plantares, sinal do xale e posição da cabeça, somar os pontos e aplicar `idade_dias = pontos + 200`.

O resultado deve ser mostrado em dias, semanas decimais e semanas + dias. O app deve registrar o Apgar no 1º e 5º minuto e habilitar 10, 15 e 20 minutos quando o Apgar do 5º minuto for menor que 7, com documentação das manobras de reanimação. O Apgar não deve ser usado como gatilho de decisão para reanimação; ele deve documentar a condição do RN e a resposta às manobras conforme SBP 2022.

Depois, o app deve receber peso ao nascer em gramas e sexo do RN, selecionar a referência conforme SBP 2022 — INTERGROWTH-21st para 33+0 a 42+6 e Fenton & Kim para menores de 33 semanas — e classificar o peso como PIG, AIG ou GIG. PIG é abaixo do P10; AIG é entre P10 e P90; GIG é acima do P90. O app deve estimar percentil aproximado por interpolação entre percentis disponíveis e renderizar gráfico com P10, P50, P90 e ponto do RN.

O app deve exibir alertas quando a idade gestacional estimada for menor que 29 semanas, quando o peso for menor que 1500 g, quando peso estiver próximo de P10/P90, quando faltarem sexo/peso ou quando a idade gestacional estiver fora da curva disponível.

Usar os assets SVG inclusos neste pacote para representação visual autoral dos achados. Usar as imagens dos PDFs oficiais apenas como referência técnica, não como cópia direta, salvo se houver liberação/licença adequada.

---

## 16. Checklist de implementação

- [ ] Criar tela inicial com dados do RN.
- [ ] Criar módulo Apgar ampliado.
- [ ] Implementar pontuação 0/1/2 dos 5 sinais do Apgar.
- [ ] Implementar cálculo do Apgar total por minuto.
- [ ] Habilitar 10/15/20 minutos quando Apgar 5º minuto < 7.
- [ ] Registrar manobras de reanimação no Apgar ampliado.
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
