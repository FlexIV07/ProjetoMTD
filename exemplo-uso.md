# 📘 Exemplo de Uso: Compra de Carro

Este documento demonstra como usar o **AHP Decisor Universal** com um exemplo prático.

## 🎯 Cenário

João precisa comprar um carro e está em dúvida entre três modelos. Ele quer tomar uma decisão estruturada considerando vários fatores importantes.

## 📝 Passo 1: Definir o Objetivo

**Objetivo**: Comprar um Carro Novo

## 📊 Passo 2: Definir os Critérios

João identifica 4 critérios importantes para ele:

1. **Preço** - Quanto o carro custa
2. **Consumo** - Eficiência de combustível
3. **Segurança** - Recursos de segurança e classificações
4. **Conforto** - Espaço interno e recursos de conforto

## 🎲 Passo 3: Definir as Alternativas

Três carros estão sendo considerados:

1. **Sedan Econômico**
2. **SUV Compacto**
3. **Hatch Premium**

## ⚖️ Passo 4: Julgamentos Par a Par

### Comparação dos Critérios

João faz as seguintes comparações em relação ao objetivo:

| Comparação | Julgamento | Valor |
|------------|------------|-------|
| Preço vs Consumo | Preço é moderadamente mais importante | 3 |
| Preço vs Segurança | Igual importância | 1 |
| Preço vs Conforto | Preço é fortemente mais importante | 5 |
| Consumo vs Segurança | Segurança é moderadamente mais importante | 1/3 |
| Consumo vs Conforto | Consumo é moderadamente mais importante | 3 |
| Segurança vs Conforto | Segurança é fortemente mais importante | 5 |

**Resultado da Análise de Consistência:**
- CR = 0.0523 ✅ (Consistente - CR < 0.10)

**Pesos dos Critérios:**
- Preço: 40%
- Segurança: 35%
- Consumo: 15%
- Conforto: 10%

### Comparação das Alternativas por Critério

#### Em relação ao Preço:

| Comparação | Julgamento | Valor |
|------------|------------|-------|
| Sedan vs SUV | Sedan é fortemente mais barato | 5 |
| Sedan vs Hatch | Sedan é moderadamente mais barato | 3 |
| SUV vs Hatch | Hatch é moderadamente mais barato | 1/3 |

**Prioridades Locais:**
- Sedan Econômico: 63.7%
- Hatch Premium: 25.8%
- SUV Compacto: 10.5%

#### Em relação ao Consumo:

| Comparação | Julgamento | Valor |
|------------|------------|-------|
| Sedan vs SUV | Sedan é muito fortemente mais econômico | 7 |
| Sedan vs Hatch | Sedan é moderadamente mais econômico | 3 |
| SUV vs Hatch | Hatch é fortemente mais econômico | 1/5 |

**Prioridades Locais:**
- Sedan Econômico: 67.9%
- Hatch Premium: 23.9%
- SUV Compacto: 8.2%

#### Em relação à Segurança:

| Comparação | Julgamento | Valor |
|------------|------------|-------|
| Sedan vs SUV | SUV é moderadamente mais seguro | 1/3 |
| Sedan vs Hatch | Igual segurança | 1 |
| SUV vs Hatch | SUV é fortemente mais seguro | 5 |

**Prioridades Locais:**
- SUV Compacto: 58.8%
- Sedan Econômico: 24.3%
- Hatch Premium: 16.9%

#### Em relação ao Conforto:

| Comparação | Julgamento | Valor |
|------------|------------|-------|
| Sedan vs SUV | SUV é moderadamente mais confortável | 1/3 |
| Sedan vs Hatch | Sedan é levemente mais confortável | 2 |
| SUV vs Hatch | SUV é fortemente mais confortável | 5 |

**Prioridades Locais:**
- SUV Compacto: 59.5%
- Sedan Econômico: 27.7%
- Hatch Premium: 12.8%

## 🏆 Passo 5: Resultados

### Ranking Final (Prioridades Globais)

🥇 **1º Lugar: Sedan Econômico - 43.8%**
- Melhor em: Preço, Consumo
- Ponto forte: Excelente custo-benefício

🥈 **2º Lugar: SUV Compacto - 31.4%**
- Melhor em: Segurança, Conforto
- Ponto forte: Segurança e espaço

🥉 **3º Lugar: Hatch Premium - 24.8%**
- Performance equilibrada
- Ponto forte: Versatilidade

### Análise Detalhada

| Alternativa | Preço (40%) | Consumo (15%) | Segurança (35%) | Conforto (10%) | **TOTAL** |
|-------------|-------------|---------------|-----------------|----------------|-----------|
| Sedan Econômico | 25.5% | 10.2% | 8.5% | 2.8% | **43.8%** |
| SUV Compacto | 4.2% | 1.2% | 20.6% | 6.0% | **31.4%** |
| Hatch Premium | 10.3% | 3.6% | 5.9% | 1.3% | **24.8%** |

### Interpretação

1. **Sedan Econômico** venceu principalmente porque:
   - Preço e Consumo são critérios que João valoriza muito (55% do peso total)
   - O Sedan é significativamente melhor nesses critérios

2. **SUV Compacto** ficou em segundo porque:
   - Excele em Segurança (35% de peso)
   - Mas perde muito no critério Preço

3. **Hatch Premium** ficou em último porque:
   - Performance "mediana" em todos os critérios
   - Não se destaca fortemente em nenhum critério de alto peso

## 💡 Conclusão

Com base na análise AHP, João deve **comprar o Sedan Econômico**, pois este melhor atende às suas prioridades considerando todos os critérios importantes e seus respectivos pesos.

## 🔄 E se as Prioridades Mudarem?

Se João decidir que Segurança é o critério mais importante (por exemplo, se ele tiver filhos pequenos), os resultados podem mudar completamente. Basta refazer as comparações dos critérios no aplicativo!

---

**Este é apenas um exemplo**. Seus próprios critérios, alternativas e julgamentos serão diferentes. O AHP Decisor Universal se adapta a qualquer cenário de decisão!

