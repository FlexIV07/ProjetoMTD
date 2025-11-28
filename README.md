# 🎯 AHP Decisor Universal

Um aplicativo web completo e intuitivo para tomada de decisões complexas utilizando o **Método AHP (Analytic Hierarchy Process)**.

## 📋 Sobre o Projeto

O AHP Decisor Universal é uma ferramenta genérica que implementa o método de análise hierárquica para auxiliar na tomada de decisões estruturadas. O aplicativo guia o usuário através de um processo passo a passo, desde a definição do objetivo até a obtenção de um ranking final das alternativas.

## ✨ Funcionalidades

### 🎯 Processo Estruturado em 5 Etapas

1. **Definição do Objetivo** - Descreva claramente o que deseja decidir
2. **Critérios de Avaliação** - Adicione os fatores importantes (2-10 critérios)
3. **Alternativas** - Liste as opções disponíveis (2-10 alternativas)
4. **Julgamentos Par a Par** - Compare elementos usando a Escala de Saaty
5. **Resultados e Análise** - Visualize o ranking e análise detalhada

### ⚖️ Comparações Par a Par Intuitivas

- **Interface com sliders interativos** usando a Escala de Saaty (1-9)
- **Comparação de critérios** em relação ao objetivo OU **pesos manuais diretos** 🆕
- **Comparação de alternativas** para cada critério
- **Feedback visual em tempo real** do valor atribuído

### 📊 Cálculos Automáticos AHP

- Cálculo de **vetores de prioridade** (método da média geométrica)
- **Verificação automática de consistência** (CI e CR)
- Alertas quando **CR > 0.10** (julgamentos inconsistentes)
- **Síntese global** das prioridades
- Bloqueio de avanço até consistência adequada

### 🏆 Resultados Completos

- **Ranking visual** das alternativas com barras de progresso
- **Gráficos interativos** (pizza e barras) usando Chart.js
- **Análise detalhada** mostrando performance em cada critério
- **Tabela de contribuições** ponderadas por critério
- **Visualização dos pesos** de cada critério

### 💾 Gerenciamento de Projetos

- **Salvar projetos** com nome personalizado
- **Carregar projetos salvos** do localStorage
- **Lista de projetos** com data e hora
- **Excluir projetos** antigos
- **Persistência local** - dados não são perdidos ao fechar o navegador

### 🆕 Pesos Manuais de Critérios (NOVO!)

- **Toggle para ativar** modo de pesos manuais
- **Definir percentuais diretamente** ao invés de comparar
- **Indicador visual** de soma dos pesos em tempo real
- **Validação automática** para garantir soma = 100%
- **Economiza tempo** ao pular comparações de critérios
- **Ideal quando** você já sabe a importância relativa exata

### 🎨 Design Moderno

- Interface limpa e profissional
- Design **responsivo** para desktop, tablet e mobile
- Tema **universal** sem referências específicas
- Animações suaves e transições
- Feedback visual claro para todas as ações

## 🚀 Como Usar

### Instalação

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` em um navegador moderno
3. Não requer servidor web - funciona localmente!

### Uso Básico

1. **Defina seu objetivo**: "Comprar um carro novo", "Escolher um fornecedor", etc.
2. **Adicione critérios**: Preço, Qualidade, Prazo, Localização, etc.
   - **Opção A** 🆕: Ative "Pesos manuais" e defina percentuais (ex: Preço 40%, Qualidade 35%)
   - **Opção B**: Use comparações par a par tradicionais
3. **Adicione alternativas**: As opções que você está considerando
4. **Faça os julgamentos**:
   - Compare os critérios entre si (se não usou pesos manuais)
   - Compare as alternativas para cada critério
   - Use o slider para definir a importância relativa
5. **Analise os resultados**: Veja o ranking e a análise detalhada

### Escala de Saaty

| Valor | Significado |
|-------|-------------|
| 1 | Igual importância |
| 3 | Importância moderada |
| 5 | Importância forte |
| 7 | Importância muito forte |
| 9 | Importância extrema |
| 2, 4, 6, 8 | Valores intermediários |

> **Nota**: O slider permite comparar em ambas as direções. Mova para a esquerda ou direita para indicar qual elemento é mais importante.

## 📐 Método AHP

### Cálculos Implementados

1. **Vetor de Prioridades**: Calculado usando o método da média geométrica
   ```
   w_i = (∏ a_ij)^(1/n) / Σ(∏ a_kj)^(1/n)
   ```

2. **Índice de Consistência (CI)**:
   ```
   CI = (λmax - n) / (n - 1)
   ```

3. **Razão de Consistência (CR)**:
   ```
   CR = CI / RI
   ```
   - CR ≤ 0.10 → Consistente
   - CR > 0.10 → Inconsistente (revisar julgamentos)

4. **Prioridade Global**:
   ```
   P_i = Σ (w_j × a_ij)
   ```
   Onde:
   - `P_i` = prioridade global da alternativa i
   - `w_j` = peso do critério j
   - `a_ij` = prioridade local da alternativa i no critério j

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com variáveis CSS
- **JavaScript (ES6+)** - Lógica da aplicação
- **Chart.js** - Visualizações gráficas
- **LocalStorage API** - Persistência de dados

## 📁 Estrutura de Arquivos

```
AHP-Decisor-Universal/
│
├── index.html          # Estrutura HTML do aplicativo
├── styles.css          # Estilos e design responsivo
├── app.js              # Lógica principal e gerenciamento de estado
├── ahp.js              # Módulo de cálculos AHP
└── README.md           # Este arquivo
```

## 🎯 Casos de Uso

- **Decisões de compra**: Escolher produtos, serviços ou fornecedores
- **Seleção de projetos**: Priorizar investimentos ou iniciativas
- **Recursos Humanos**: Avaliar candidatos ou funcionários
- **Planejamento estratégico**: Escolher estratégias ou caminhos
- **Decisões pessoais**: Escolha de carreira, moradia, viagens, etc.
- **Avaliação de alternativas** em qualquer contexto de decisão complexa

## ⚠️ Requisitos

- Navegador moderno com suporte a:
  - ES6+ JavaScript
  - CSS Grid e Flexbox
  - LocalStorage API
  - Canvas API (para gráficos)

## 🔒 Privacidade

- **100% local**: Todos os dados ficam no seu navegador
- **Sem servidor**: Não há transmissão de dados para servidores externos
- **Sem rastreamento**: Não coletamos nenhuma informação
- **Offline-first**: Funciona sem conexão à internet (após carregar)

## 🐛 Solução de Problemas

### Os gráficos não aparecem
- Verifique se o Chart.js foi carregado corretamente
- Certifique-se de ter conexão à internet para carregar o CDN

### Alertas de inconsistência
- Revise seus julgamentos na matriz indicada
- CR > 0.10 indica que suas comparações têm contradições
- Tente ser mais consistente nas avaliações

### Dados perdidos
- Os projetos são salvos no localStorage do navegador
- Limpar cache/cookies pode apagar os projetos salvos
- Salve projetos importantes antes de limpar dados do navegador

## 📚 Referências e Documentação Adicional

### Método AHP
- Saaty, T. L. (1980). *The Analytic Hierarchy Process*. McGraw-Hill.
- Saaty, T. L. (2008). *Decision making with the analytic hierarchy process*. International Journal of Services Sciences, 1(1), 83-98.

### Documentação do Projeto
- `NOVIDADE-PESOS-MANUAIS.md` - Guia completo da funcionalidade de pesos manuais 🆕
- `GUIA-RAPIDO.md` - Referência rápida para uso imediato
- `COMO-USAR.txt` - Manual detalhado passo a passo
- `exemplo-uso.md` - Caso prático completo resolvido
- `ARQUITETURA.md` - Documentação técnica para desenvolvedores
- `ESTRUTURA-DO-PROJETO.md` - Organização dos arquivos
- `RESUMO-IMPLEMENTACAO.md` - Status e features implementadas

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional e comercial.

## 👨‍💻 Desenvolvimento

Desenvolvido como uma ferramenta genérica e universal para aplicação do Método AHP em qualquer contexto de tomada de decisão.

---

**Desenvolvido com 💜 para facilitar decisões complexas**

