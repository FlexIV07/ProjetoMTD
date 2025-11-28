# 🏗️ Arquitetura Técnica - AHP Decisor Universal

## 📐 Visão Geral da Arquitetura

O aplicativo segue uma arquitetura **MVC-like** simplificada para aplicações web vanilla:

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│                  (View / Template)                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      app.js                             │
│                 (Controller / State)                    │
│  - Gerenciamento de estado global                      │
│  - Navegação entre etapas                              │
│  - Event handlers                                       │
│  - Renderização dinâmica                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      ahp.js                             │
│                   (Model / Logic)                       │
│  - Cálculos matemáticos AHP                            │
│  - Algoritmos de consistência                          │
│  - Transformações de dados                             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    styles.css                           │
│                (Presentation Layer)                     │
│  - Design system com CSS Variables                     │
│  - Layouts responsivos                                 │
│  - Animações e transições                              │
└─────────────────────────────────────────────────────────┘
```

## 📦 Módulos e Responsabilidades

### 1. index.html (View)
**Responsabilidade**: Estrutura e template da interface

- Define a estrutura HTML semântica
- Cinco seções principais (steps 1-5)
- Progress bar de navegação
- Modais e overlays
- Integração com bibliotecas externas (Chart.js)

**Padrões utilizados**:
- HTML5 semântico (`<section>`, `<header>`, `<main>`)
- Data attributes para binding (`data-step`, `data-tab`)
- IDs únicos para elementos dinâmicos

### 2. app.js (Controller)
**Responsabilidade**: Gerenciamento de estado e lógica de UI

#### Estado Global (appState)
```javascript
{
    currentStep: Number,           // Etapa atual (1-5)
    objective: String,             // Objetivo da decisão
    criteria: Array<String>,       // Lista de critérios
    alternatives: Array<String>,   // Lista de alternativas
    criteriaMatrix: Array<Array>,  // Matriz de comparação dos critérios
    alternativesMatrices: Object,  // Matrizes por critério
    criteriaAnalysis: Object,      // Análise de consistência
    alternativesAnalysis: Object,  // Análises por critério
    results: Object                // Resultados finais
}
```

#### Principais Funções

**Navegação**:
- `nextStep()` - Avança etapa com validação
- `previousStep()` - Retrocede etapa
- `updateStepDisplay()` - Atualiza UI da navegação

**Gerenciamento de Dados**:
- `addCriterion()` / `removeCriterion()`
- `addAlternative()` / `removeAlternative()`
- `renderCriteriaList()` / `renderAlternativesList()`

**Julgamentos**:
- `renderCriteriaComparisons()` - Cria sliders para critérios
- `renderAlternativesComparisons()` - Cria sliders para alternativas
- `onSliderInput()` - Handler de mudança de valor
- `updateCriteriaComparison()` / `updateAlternativeComparison()`

**Persistência**:
- `saveProject()` - Salva no localStorage
- `loadProject()` - Carrega do localStorage
- `deleteProject()` - Remove do localStorage

**Resultados**:
- `calculateResults()` - Orquestra cálculo final
- `renderResults()` - Renderiza todas as visualizações
- `renderRanking()` - Cria ranking visual
- `renderPrioritiesChart()` - Gráfico de pizza
- `renderDetailedAnalysis()` - Tabela detalhada
- `renderCriteriaChart()` - Gráfico de barras

### 3. ahp.js (Model)
**Responsabilidade**: Implementação pura do método AHP

#### Classe AHP (Static Methods)

**Constantes**:
```javascript
static RI = {1: 0, 2: 0, 3: 0.58, ...}  // Random Index
```

**Cálculos Core**:
- `calculatePriorityVector(matrix)` - Método da média geométrica
- `calculateLambdaMax(matrix, vector)` - Maior autovalor
- `calculateCI(lambdaMax, n)` - Consistency Index
- `calculateCR(ci, n)` - Consistency Ratio
- `analyzeConsistency(matrix)` - Análise completa

**Operações de Matriz**:
- `createEmptyMatrix(n)` - Cria matriz identidade
- `updateMatrix(matrix, i, j, value)` - Atualiza com reciprocidade
- `isMatrixComplete(matrix)` - Valida completude

**Síntese**:
- `calculateGlobalPriorities(criteria, alternatives)` - Prioridades finais

**Utilidades**:
- `sliderToSaatyValue(value)` - Converte slider para escala
- `saatyValueToSlider(value)` - Converte escala para slider
- `getSaatyDescription(value)` - Descrição textual
- `formatNumber(value)` - Formatação de percentual
- `formatCR(cr)` - Formatação de CR

### 4. styles.css (Presentation)
**Responsabilidade**: Design system e estilos visuais

#### Design Tokens (CSS Variables)
```css
:root {
    /* Colors */
    --primary-color: #4F46E5;
    --success-color: #10B981;
    
    /* Spacing */
    --spacing-md: 1rem;
    --spacing-xl: 2rem;
    
    /* Shadows */
    --shadow-lg: ...;
    
    /* Transitions */
    --transition-normal: 300ms ease;
}
```

#### Organização
1. **Reset e variáveis globais**
2. **Layout (Container, Header, Main)**
3. **Components (Buttons, Forms, Cards)**
4. **Progress bar**
5. **Comparison sliders**
6. **Results visualization**
7. **Modals**
8. **Responsive breakpoints**
9. **Animations**
10. **Print styles**

## 🔄 Fluxo de Dados

### 1. Entrada de Dados
```
User Input → Event Handler → appState Update → Re-render
```

### 2. Comparações Par a Par
```
Slider Change → onSliderInput() → 
AHP.sliderToSaatyValue() → 
updateMatrix() → 
AHP.analyzeConsistency() → 
Update UI with CR
```

### 3. Cálculo Final
```
calculateResults() →
  AHP.analyzeConsistency(criteriaMatrix) →
  AHP.analyzeConsistency(alternativesMatrices[i]) →
  AHP.calculateGlobalPriorities() →
  Generate Ranking →
  Render Charts
```

### 4. Persistência
```
saveProject() → 
JSON.stringify(appState) → 
localStorage.setItem() →
Success Alert

loadProject() →
localStorage.getItem() →
JSON.parse() →
appState = data →
Re-render All
```

## 🧮 Algoritmos Implementados

### 1. Vetor de Prioridades (Média Geométrica)

```javascript
// Para cada linha i da matriz
for i in 1..n:
    product = 1
    for j in 1..n:
        product *= matrix[i][j]
    priority[i] = product^(1/n)

// Normalizar
sum = Σ priority[i]
for i in 1..n:
    priority[i] = priority[i] / sum
```

**Complexidade**: O(n²)

### 2. Lambda Max (Autovalor Principal)

```javascript
for i in 1..n:
    sum = 0
    for j in 1..n:
        sum += matrix[i][j] * priority[j]
    lambdaMax += sum / priority[i]

lambdaMax = lambdaMax / n
```

**Complexidade**: O(n²)

### 3. Índice de Consistência

```javascript
CI = (λmax - n) / (n - 1)
```

**Complexidade**: O(1)

### 4. Razão de Consistência

```javascript
CR = CI / RI[n]
isConsistent = CR ≤ 0.10
```

**Complexidade**: O(1)

### 5. Prioridades Globais

```javascript
for each alternative i:
    globalPriority[i] = 0
    for each criterion j:
        globalPriority[i] += 
            criteriaPriority[j] * 
            alternativesPriority[j][i]
```

**Complexidade**: O(n * m) onde n = alternativas, m = critérios

## 🎨 Design Patterns Utilizados

### 1. Module Pattern
- `AHP` como classe estática
- Encapsulamento de lógica matemática

### 2. Observer Pattern (Simplificado)
- Event listeners para mudanças de estado
- Re-renderização reativa

### 3. Strategy Pattern
- Diferentes estratégias de renderização por tipo de conteúdo
- `renderCriteria` vs `renderAlternatives`

### 4. Factory Pattern
- `createComparisonSlider()` - Cria elementos de comparação
- `createEmptyMatrix()` - Fabrica matrizes

### 5. Singleton Pattern
- `appState` como único estado global
- `localStorage` como único ponto de persistência

## 📊 Estrutura de Dados

### Matrix (Comparação Par a Par)
```javascript
// Matriz nxn simétrica com reciprocidade
[
  [1,   3,   5  ],  // a₁₁=1, a₁₂=3,  a₁₃=5
  [1/3, 1,   3  ],  // a₂₁=⅓, a₂₂=1,  a₂₃=3
  [1/5, 1/3, 1  ]   // a₃₁=⅕, a₃₂=⅓,  a₃₃=1
]
```

**Propriedades**:
- Diagonal principal = 1
- Simetria: `a[i][j] = 1 / a[j][i]`
- Tamanho: n × n onde n ≤ 10

### Analysis Object
```javascript
{
    priorities: [0.65, 0.25, 0.10],  // Vetor normalizado
    lambdaMax: 3.05,                  // Autovalor principal
    ci: 0.025,                        // Consistency Index
    cr: 0.043,                        // Consistency Ratio
    isConsistent: true                // CR ≤ 0.10
}
```

### Results Object
```javascript
{
    criteriaPriorities: [0.4, 0.35, 0.15, 0.1],
    alternativesPriorities: [
        [0.64, 0.26, 0.10],  // Critério 1
        [0.68, 0.24, 0.08],  // Critério 2
        // ...
    ],
    globalPriorities: [0.438, 0.314, 0.248],
    ranking: [
        {name: "Alt 1", priority: 0.438, index: 0},
        {name: "Alt 2", priority: 0.314, index: 1},
        {name: "Alt 3", priority: 0.248, index: 2}
    ]
}
```

## 🔐 Segurança e Validações

### Validações Implementadas

1. **Entrada de Dados**:
   - Texto não vazio
   - Limite de 10 itens (critérios/alternativas)
   - Não permite duplicatas
   - Mínimo de 2 itens

2. **Navegação**:
   - Não avança sem dados válidos
   - Valida consistência antes de calcular
   - Bloqueia se CR > 0.10

3. **Cálculos**:
   - Verifica matrizes completas
   - Valida divisão por zero
   - Garante reciprocidade

4. **LocalStorage**:
   - Validação de JSON
   - Try-catch em operações
   - Verificação de disponibilidade

### Sanitização
- Escaping de HTML em renderização dinâmica
- Validação de inputs
- Prevenção de XSS

## 📈 Performance

### Otimizações

1. **Renderização**:
   - Batch updates com innerHTML
   - Renderização condicional (steps)
   - CSS animations via GPU

2. **Cálculos**:
   - Cache de análises de consistência
   - Cálculo incremental
   - Evita recálculo desnecessário

3. **Storage**:
   - JSON compactado
   - Lazy loading de projetos
   - Garbage collection implícita

### Limites

- Máximo 10 critérios × 10 alternativas
- Comparações par a par: n(n-1)/2
- Para 10 critérios: 45 comparações
- Para 10 alternativas × 10 critérios: 450 comparações
- **Total máximo**: 495 comparações

**Complexidade Total**: O(c² + a²·c) onde c=critérios, a=alternativas

## 🧪 Testabilidade

### Pontos de Teste Recomendados

1. **Cálculos AHP** (`ahp.js`):
   - Teste unitário de cada método
   - Validação de reciprocidade
   - Verificação de normalização
   - Testes com matrizes conhecidas

2. **Estado** (`app.js`):
   - Transições de estado
   - Validações de input
   - Persistência localStorage

3. **UI** (`integration`):
   - Navegação entre etapas
   - Renderização de sliders
   - Exibição de alertas

## 🚀 Extensibilidade

### Pontos de Extensão

1. **Novos Métodos de Cálculo**:
   - Implementar em `ahp.js`
   - Manter interface consistente

2. **Visualizações**:
   - Adicionar novos tipos de gráficos
   - Exportação de dados (PDF, Excel)

3. **Persistência**:
   - Backend API
   - Cloud storage
   - Export/import JSON

4. **UI**:
   - Temas customizáveis
   - Multilíngue (i18n)
   - Acessibilidade (ARIA)

## 📚 Dependências Externas

### Chart.js v4.4.0
- **Uso**: Visualização de gráficos (pizza e barras)
- **CDN**: jsdelivr.net
- **Licença**: MIT
- **Alternativa**: Pode ser substituído por D3.js ou Plotly

### Nenhuma outra dependência!
- Vanilla JavaScript ES6+
- CSS puro (sem preprocessadores)
- HTML5 nativo

## 🎯 Decisões Arquiteturais

### Por que Vanilla JavaScript?
✅ Zero dependências = zero vulnerabilidades  
✅ Tamanho mínimo (~50KB total)  
✅ Performance máxima  
✅ Compatibilidade universal  
✅ Fácil manutenção  

### Por que localStorage?
✅ Persistência imediata  
✅ Sem necessidade de backend  
✅ Privacidade total (local-only)  
✅ API simples  
❌ Limitação: ~5-10MB  

### Por que Single Page?
✅ Experiência fluida  
✅ Sem recarregamentos  
✅ Estado mantido na memória  
✅ Animações suaves  

## 🔮 Melhorias Futuras

1. **Backend opcional**:
   - API REST para compartilhamento
   - Colaboração em tempo real
   - Histórico de versões

2. **Análise avançada**:
   - Análise de sensibilidade
   - Gráficos de contribuição
   - Comparação de cenários

3. **Export**:
   - PDF profissional
   - Excel com fórmulas
   - Apresentação PowerPoint

4. **UX**:
   - Wizard mais interativo
   - Tour guiado para novos usuários
   - Templates pré-configurados

5. **Mobile**:
   - PWA (Progressive Web App)
   - App nativo (React Native)
   - Sincronização entre dispositivos

---

**Documentação técnica mantida para desenvolvedores**

