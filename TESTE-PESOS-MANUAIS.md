# 🧪 Como Testar a Funcionalidade de Pesos Manuais

## ✅ Checklist de Testes

### Teste 1: Ativar e Desativar Modo Manual

1. Abra `index.html`
2. Vá para **Passo 2 (Critérios)**
3. ☑️ Marque a caixa "Definir pesos manualmente"
4. **Verificar**: Campo de peso deve aparecer
5. **Verificar**: Indicador de soma deve aparecer
6. ☐ Desmarque a caixa
7. **Verificar**: Campo de peso deve desaparecer
8. **Verificar**: Indicador deve desaparecer

**Resultado esperado**: ✅ Interface alterna corretamente

---

### Teste 2: Adicionar Critérios com Pesos

1. ☑️ Ative "Definir pesos manualmente"
2. Digite "Preço" + peso "40" → Adicionar
3. Digite "Qualidade" + peso "35" → Adicionar
4. Digite "Prazo" + peso "25" → Adicionar

**Verificar após cada adição**:
- Critério aparece na lista com campo editável
- Soma dos pesos atualiza em tempo real
- Ao chegar em 100%, indicador fica verde ✅

**Resultado esperado**: 
```
Soma dos pesos: 100.0% ✅ Perfeito!
```

---

### Teste 3: Validação de Soma

**Teste 3a: Soma < 100%**
1. Adicione: Preço (30%), Qualidade (40%)
2. **Verificar**: 
   - `Soma dos pesos: 70.0%`
   - Status: `⚠️ Faltam 30.0%`
   - Cor: Amarelo
3. Tente avançar (botão "Próximo")
4. **Verificar**: Alerta "A soma dos pesos deve ser 100%!"

**Teste 3b: Soma > 100%**
1. Adicione: Preço (50%), Qualidade (60%)
2. **Verificar**:
   - `Soma dos pesos: 110.0%`
   - Status: `❌ Acima de 100%`
   - Cor: Vermelho
3. Tente avançar
4. **Verificar**: Alerta de erro

**Teste 3c: Soma = 100%**
1. Ajuste os pesos para somar exatamente 100%
2. **Verificar**:
   - Status: `✅ Perfeito!`
   - Cor: Verde
3. Clique em "Próximo"
4. **Verificar**: Avança para Passo 3

---

### Teste 4: Editar Pesos na Lista

1. Adicione critérios com pesos quaisquer
2. Clique no campo de peso de um critério
3. Altere o valor
4. **Verificar**: Soma atualiza instantaneamente
5. Ajuste até soma = 100%
6. Avance para próxima etapa

**Resultado esperado**: ✅ Edição funciona e validação ocorre

---

### Teste 5: Remover Critérios

1. Adicione 3 critérios com pesos que somam 100%
2. Remova um critério (botão ✖)
3. **Verificar**: 
   - Critério removido
   - Soma recalculada
   - Status atualizado
4. **Verificar**: Não pode mais avançar (soma ≠ 100%)

**Resultado esperado**: ✅ Remoção funciona corretamente

---

### Teste 6: Pular Comparação de Critérios

1. Complete Passos 1 e 2 com pesos manuais (soma = 100%)
2. Adicione alternativas no Passo 3
3. Avance para **Passo 4 (Julgamentos)**
4. **Verificar**: 
   - Aba "Comparar Critérios" está OCULTA
   - Aba "Comparar Alternativas" está ATIVA
   - Você vai direto para comparação de alternativas

**Resultado esperado**: ✅ Economiza tempo pulando critérios

---

### Teste 7: Comparação Tradicional (Sem Pesos Manuais)

1. ☐ NÃO marque "Definir pesos manualmente"
2. Adicione critérios sem pesos
3. Adicione alternativas
4. Vá para Passo 4
5. **Verificar**:
   - Aba "Comparar Critérios" está VISÍVEL
   - Comparações par a par disponíveis
   - Sistema funciona como antes

**Resultado esperado**: ✅ Modo tradicional intacto

---

### Teste 8: Resultados com Pesos Manuais

1. Complete análise com pesos manuais
2. Vá até os resultados
3. **Verificar**:
   - Gráfico de "Pesos dos Critérios" mostra seus percentuais
   - Ranking calculado corretamente
   - Análise detalhada usa os pesos definidos

**Resultado esperado**: ✅ Resultados corretos

---

### Teste 9: Salvar e Carregar Projeto

1. Complete análise com pesos manuais (soma = 100%)
2. Vá até resultados
3. Clique "💾 Salvar Projeto"
4. Dê um nome: "Teste Pesos Manuais"
5. Inicie nova análise (🔄)
6. Clique "📂 Carregar Projeto"
7. Carregue "Teste Pesos Manuais"

**Verificar após carregar**:
- ☑️ Checkbox "Pesos manuais" está marcada
- Critérios aparecem com pesos corretos
- Soma = 100%
- Pode continuar de onde parou

**Resultado esperado**: ✅ Persistência funciona

---

### Teste 10: Nova Análise (Reset)

1. Complete uma análise com pesos manuais
2. Nos resultados, clique "🔄 Nova Análise"
3. Confirme reset

**Verificar**:
- Volta para Passo 1
- ☐ Checkbox desmarcada
- Campos de peso ocultos
- Estado limpo

**Resultado esperado**: ✅ Reset completo

---

### Teste 11: Responsividade Mobile

1. Abra no navegador
2. Pressione F12 (DevTools)
3. Ative modo dispositivo (Ctrl+Shift+M)
4. Selecione "iPhone 12" ou similar
5. Teste adicionar critérios com pesos

**Verificar**:
- Layout ajusta corretamente
- Campos não ficam cortados
- Tudo legível e usável
- Touch funciona nos inputs

**Resultado esperado**: ✅ Funciona em mobile

---

### Teste 12: Caso Completo End-to-End

**Cenário**: Escolher Fornecedor

**Passo 1**: Objetivo
- "Escolher Fornecedor de Componentes"

**Passo 2**: Critérios com Pesos Manuais
- ☑️ Ativar pesos manuais
- Preço: 50%
- Qualidade: 30%
- Prazo: 20%
- Total: 100% ✅

**Passo 3**: Alternativas
- Fornecedor A
- Fornecedor B
- Fornecedor C

**Passo 4**: Julgamentos
- Comparar alternativas para Preço
- Comparar alternativas para Qualidade
- Comparar alternativas para Prazo
- Garantir CR ≤ 0.10 para todos

**Passo 5**: Resultados
- **Verificar**:
  - Ranking das 3 alternativas
  - Gráfico mostra: Preço 50%, Qualidade 30%, Prazo 20%
  - Tabela detalhada mostra contribuições
  - Tudo matematicamente correto

**Resultado esperado**: ✅ Fluxo completo funciona perfeitamente

---

## 🎯 Casos Extremos (Edge Cases)

### Edge 1: Muitos Decimais
- Teste: Preço 33.3%, Qualidade 33.3%, Prazo 33.4%
- **Resultado**: ✅ Deve aceitar (soma = 100.0%)

### Edge 2: Zero e Negativos
- Teste: Tentar peso = 0 ou negativo
- **Resultado**: Campo aceita, mas soma nunca fica 100% corretamente

### Edge 3: Copiar/Colar Pesos
- Teste: Copiar peso de um campo e colar em outro
- **Resultado**: ✅ Deve funcionar normalmente

### Edge 4: 10 Critérios
- Teste: Adicionar 10 critérios, cada um com 10%
- **Resultado**: ✅ Deve aceitar e funcionar

### Edge 5: Alternar Modo Durante Edição
- Teste: Adicionar critérios sem peso → ativar modo → adicionar mais
- **Resultado**: ✅ Novos critérios devem ter campo de peso

---

## ✅ Checklist Final

Marque cada teste conforme completa:

- [ ] Teste 1: Ativar/Desativar
- [ ] Teste 2: Adicionar com Pesos
- [ ] Teste 3: Validação de Soma
- [ ] Teste 4: Editar Pesos
- [ ] Teste 5: Remover Critérios
- [ ] Teste 6: Pular Comparações
- [ ] Teste 7: Modo Tradicional
- [ ] Teste 8: Resultados
- [ ] Teste 9: Salvar/Carregar
- [ ] Teste 10: Reset
- [ ] Teste 11: Mobile
- [ ] Teste 12: End-to-End
- [ ] Edge Cases

---

## 🐛 Reportando Problemas

Se encontrar bugs:

1. **Descreva** o que aconteceu
2. **Passos** para reproduzir
3. **Esperado** vs **Obtido**
4. **Browser** e versão
5. **Screenshot** se possível

---

## ✨ Resultado Esperado Geral

Após todos os testes:

✅ Modo manual funciona perfeitamente  
✅ Modo tradicional continua funcionando  
✅ Validações estão corretas  
✅ Interface é intuitiva  
✅ Resultados são precisos  
✅ Persistência funciona  
✅ Responsivo em mobile  
✅ Zero bugs críticos  

---

**Bons testes! 🚀**

