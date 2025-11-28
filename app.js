/**
 * app.js - Lógica Principal do Aplicativo AHP
 * Gerencia estado, navegação e interações do usuário
 */

// Estado global da aplicação
const appState = {
    currentStep: 1,
    objective: '',
    criteria: [],
    criteriaWeights: [], // Pesos manuais dos critérios (se definidos)
    useManualWeights: false, // Se true, usa pesos manuais ao invés de comparações
    alternatives: [],
    criteriaMatrix: [],
    alternativesMatrices: {}, // { criterionIndex: matrix }
    criteriaAnalysis: null,
    alternativesAnalysis: {}, // { criterionIndex: analysis }
    results: null,
    charts: {
        priorities: null,
        criteria: null
    }
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Event listeners
    document.getElementById('objective-input').addEventListener('input', (e) => {
        appState.objective = e.target.value;
    });

    document.getElementById('criteria-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCriterion();
    });

    document.getElementById('alternative-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addAlternative();
    });

    document.getElementById('save-project-btn').addEventListener('click', saveProject);
    document.getElementById('load-project-btn').addEventListener('click', openLoadModal);

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Criterion selector for alternatives judgments
    document.getElementById('current-criterion').addEventListener('change', (e) => {
        renderAlternativesComparisons(parseInt(e.target.value));
    });

    console.log('AHP Decisor Universal inicializado!');
}

// ============================================================
// NAVEGAÇÃO ENTRE ETAPAS
// ============================================================

function nextStep() {
    const currentStep = appState.currentStep;

    // Validações antes de avançar
    if (currentStep === 1) {
        if (!appState.objective.trim()) {
            showAlert('Por favor, defina o objetivo da decisão!', 'warning');
            return;
        }
    }

    if (currentStep === 2) {
        if (appState.criteria.length < 2) {
            showAlert('Adicione pelo menos 2 critérios!', 'warning');
            return;
        }
        
        // Se usar pesos manuais, validar soma
        if (appState.useManualWeights) {
            const total = appState.criteriaWeights.reduce((sum, w) => sum + w, 0);
            if (Math.abs(total - 100) > 0.1) {
                showAlert(`A soma dos pesos deve ser 100%! Atual: ${total.toFixed(1)}%`, 'warning');
                return;
            }
            // Normalizar pesos para análise (converter para decimal)
            appState.criteriaAnalysis = {
                priorities: appState.criteriaWeights.map(w => w / 100),
                lambdaMax: appState.criteria.length,
                ci: 0,
                cr: 0,
                isConsistent: true
            };
        } else {
            // Inicializar matriz de critérios para comparações
            initializeCriteriaMatrix();
        }
    }

    if (currentStep === 3) {
        if (appState.alternatives.length < 2) {
            showAlert('Adicione pelo menos 2 alternativas!', 'warning');
            return;
        }
        // Inicializar matrizes de alternativas
        initializeAlternativesMatrices();
        // Preparar interface de julgamentos
        prepareJudgmentsStep();
    }

    if (currentStep === 4) {
        // Validar se todos os julgamentos foram feitos
        if (!validateAllJudgments()) {
            return;
        }
    }

    // Avançar
    if (currentStep < 5) {
        appState.currentStep++;
        updateStepDisplay();
    }
}

function previousStep() {
    if (appState.currentStep > 1) {
        appState.currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    const step = appState.currentStep;

    // Atualizar progress bar
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        if (index + 1 <= step) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    // Mostrar/esconder seções
    document.querySelectorAll('.step-content').forEach((section, index) => {
        if (index + 1 === step) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// PASSO 2: GERENCIAMENTO DE CRITÉRIOS
// ============================================================

function toggleWeightMode() {
    const toggle = document.getElementById('manual-weights-toggle');
    const weightInput = document.getElementById('criteria-weight-input');
    const weightSummary = document.getElementById('criteria-weight-summary');
    
    appState.useManualWeights = toggle.checked;
    
    if (toggle.checked) {
        weightInput.style.display = 'block';
        weightSummary.style.display = 'block';
        
        // Se já existem critérios sem peso, pedir para adicionar
        if (appState.criteria.length > 0 && appState.criteriaWeights.length === 0) {
            showAlert('Agora você pode editar os critérios para definir seus pesos!', 'info');
        }
    } else {
        weightInput.style.display = 'none';
        weightSummary.style.display = 'none';
    }
    
    renderCriteriaList();
}

function addCriterion() {
    const input = document.getElementById('criteria-input');
    const weightInput = document.getElementById('criteria-weight-input');
    const value = input.value.trim();

    if (!value) {
        showAlert('Digite o nome do critério!', 'warning');
        return;
    }

    if (appState.criteria.length >= 10) {
        showAlert('Máximo de 10 critérios permitidos!', 'warning');
        return;
    }

    if (appState.criteria.includes(value)) {
        showAlert('Este critério já foi adicionado!', 'warning');
        return;
    }

    appState.criteria.push(value);
    
    // Se modo manual está ativo, adicionar peso
    if (appState.useManualWeights) {
        const weight = parseFloat(weightInput.value) || 0;
        appState.criteriaWeights.push(weight);
        weightInput.value = '';
        updateWeightSummary();
    }
    
    input.value = '';
    renderCriteriaList();
}

function removeCriterion(index) {
    appState.criteria.splice(index, 1);
    if (appState.useManualWeights) {
        appState.criteriaWeights.splice(index, 1);
        updateWeightSummary();
    }
    renderCriteriaList();
}

function updateCriterionWeight(index, newWeight) {
    appState.criteriaWeights[index] = parseFloat(newWeight) || 0;
    updateWeightSummary();
}

function updateWeightSummary() {
    const total = appState.criteriaWeights.reduce((sum, w) => sum + w, 0);
    const totalElement = document.getElementById('weight-total');
    const statusElement = document.getElementById('weight-status');
    
    totalElement.textContent = total.toFixed(1) + '%';
    
    if (Math.abs(total - 100) < 0.1) {
        totalElement.className = 'weight-total valid';
        statusElement.innerHTML = '✅ Perfeito!';
        statusElement.className = 'weight-status valid';
    } else if (total > 100) {
        totalElement.className = 'weight-total invalid';
        statusElement.innerHTML = '❌ Acima de 100%';
        statusElement.className = 'weight-status invalid';
    } else {
        totalElement.className = 'weight-total incomplete';
        statusElement.innerHTML = `⚠️ Faltam ${(100 - total).toFixed(1)}%`;
        statusElement.className = 'weight-status incomplete';
    }
}

function renderCriteriaList() {
    const container = document.getElementById('criteria-list');
    
    if (appState.criteria.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum critério adicionado ainda.</p>';
        return;
    }

    if (appState.useManualWeights) {
        // Modo com pesos
        container.innerHTML = appState.criteria.map((criterion, index) => {
            const weight = appState.criteriaWeights[index] || 0;
            return `
                <div class="item with-weight">
                    <span class="item-text">${index + 1}. ${criterion}</span>
                    <div class="item-weight">
                        <input type="number" 
                            class="weight-input-small" 
                            value="${weight}" 
                            min="0" 
                            max="100" 
                            step="0.1"
                            oninput="updateCriterionWeight(${index}, this.value)"
                            placeholder="Peso %">
                        <span class="weight-symbol">%</span>
                    </div>
                    <button class="btn-remove" onclick="removeCriterion(${index})">✖</button>
                </div>
            `;
        }).join('');
    } else {
        // Modo tradicional (sem pesos)
        container.innerHTML = appState.criteria.map((criterion, index) => `
            <div class="item">
                <span class="item-text">${index + 1}. ${criterion}</span>
                <button class="btn-remove" onclick="removeCriterion(${index})">✖</button>
            </div>
        `).join('');
    }
}

// ============================================================
// PASSO 3: GERENCIAMENTO DE ALTERNATIVAS
// ============================================================

function addAlternative() {
    const input = document.getElementById('alternative-input');
    const value = input.value.trim();

    if (!value) {
        showAlert('Digite o nome da alternativa!', 'warning');
        return;
    }

    if (appState.alternatives.length >= 10) {
        showAlert('Máximo de 10 alternativas permitidas!', 'warning');
        return;
    }

    if (appState.alternatives.includes(value)) {
        showAlert('Esta alternativa já foi adicionada!', 'warning');
        return;
    }

    appState.alternatives.push(value);
    input.value = '';
    renderAlternativesList();
}

function removeAlternative(index) {
    appState.alternatives.splice(index, 1);
    renderAlternativesList();
}

function renderAlternativesList() {
    const container = document.getElementById('alternatives-list');
    
    if (appState.alternatives.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhuma alternativa adicionada ainda.</p>';
        return;
    }

    container.innerHTML = appState.alternatives.map((alternative, index) => `
        <div class="item">
            <span class="item-text">${index + 1}. ${alternative}</span>
            <button class="btn-remove" onclick="removeAlternative(${index})">✖</button>
        </div>
    `).join('');
}

// ============================================================
// PASSO 4: JULGAMENTOS PAR A PAR
// ============================================================

function initializeCriteriaMatrix() {
    const n = appState.criteria.length;
    if (appState.criteriaMatrix.length !== n) {
        appState.criteriaMatrix = AHP.createEmptyMatrix(n);
    }
}

function initializeAlternativesMatrices() {
    const n = appState.alternatives.length;
    appState.criteria.forEach((_, critIndex) => {
        if (!appState.alternativesMatrices[critIndex]) {
            appState.alternativesMatrices[critIndex] = AHP.createEmptyMatrix(n);
        }
    });
}

function prepareJudgmentsStep() {
    // Atualizar objetivo display
    document.getElementById('objective-display-1').textContent = appState.objective;

    // Preencher selector de critérios
    const selector = document.getElementById('current-criterion');
    selector.innerHTML = appState.criteria.map((criterion, index) => 
        `<option value="${index}">${criterion}</option>`
    ).join('');

    // Se usar pesos manuais, esconder aba de comparação de critérios
    const criteriaTab = document.querySelector('[data-tab="criteria-judgments"]');
    const criteriaContent = document.getElementById('criteria-judgments');
    
    if (appState.useManualWeights) {
        criteriaTab.style.display = 'none';
        criteriaContent.style.display = 'none';
        // Ativar automaticamente a aba de alternativas
        switchTab('alternatives-judgments');
    } else {
        criteriaTab.style.display = 'block';
        // Renderizar comparações de critérios
        renderCriteriaComparisons();
    }
    
    // Sempre renderizar comparações de alternativas
    renderAlternativesComparisons(0);
}

function renderCriteriaComparisons() {
    const container = document.getElementById('criteria-comparisons');
    const n = appState.criteria.length;
    
    let html = '';

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            html += createComparisonSlider(
                `criteria-${i}-${j}`,
                appState.criteria[i],
                appState.criteria[j],
                appState.criteriaMatrix[i][j],
                true, // isCriteria
                i,
                j
            );
        }
    }

    container.innerHTML = html;
    updateCriteriaConsistency();
}

function renderAlternativesComparisons(criterionIndex) {
    const container = document.getElementById('alternatives-comparisons');
    const n = appState.alternatives.length;
    const matrix = appState.alternativesMatrices[criterionIndex];
    
    let html = '';

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            html += createComparisonSlider(
                `alternative-${criterionIndex}-${i}-${j}`,
                appState.alternatives[i],
                appState.alternatives[j],
                matrix[i][j],
                false, // isCriteria
                i,
                j,
                criterionIndex
            );
        }
    }

    container.innerHTML = html;
    updateAlternativesConsistency(criterionIndex);
}

function createComparisonSlider(id, elementA, elementB, currentValue, isCriteria, i, j, criterionIndex = null) {
    const sliderValue = AHP.saatyValueToSlider(currentValue);
    
    const onInputAttr = isCriteria 
        ? `onSliderInput(this, '${id}', ${i}, ${j}, true, '${elementA}', '${elementB}')`
        : `onSliderInput(this, '${id}', ${i}, ${j}, false, '${elementA}', '${elementB}', ${criterionIndex})`;
    
    return `
        <div class="comparison-item">
            <div class="comparison-labels">
                <span class="label-left">${elementA}</span>
                <span class="label-center">vs</span>
                <span class="label-right">${elementB}</span>
            </div>
            <div class="slider-container">
                <span class="slider-label-left">${elementA}</span>
                <input type="range" 
                    id="${id}" 
                    class="comparison-slider" 
                    min="-9" 
                    max="9" 
                    step="1" 
                    value="${sliderValue}"
                    oninput="${onInputAttr}"
                >
                <span class="slider-label-right">${elementB}</span>
            </div>
            <div class="slider-value">
                <span id="${id}-value">${formatSliderValue(sliderValue, elementA, elementB)}</span>
            </div>
        </div>
    `;
}

function onSliderInput(sliderElement, sliderId, i, j, isCriteria, elementA, elementB, criterionIndex = null) {
    const value = parseInt(sliderElement.value);
    const saatyValue = AHP.sliderToSaatyValue(value);
    
    if (isCriteria) {
        updateCriteriaComparison(i, j, saatyValue);
    } else {
        updateAlternativeComparison(criterionIndex, i, j, saatyValue);
    }
    
    // Atualizar display do valor
    document.getElementById(`${sliderId}-value`).textContent = 
        formatSliderValue(value, elementA, elementB);
}

function formatSliderValue(sliderValue, elementA, elementB) {
    const value = parseInt(sliderValue);
    
    if (value === 0) {
        return 'Igual importância (1:1)';
    } else if (value > 0) {
        const desc = AHP.getSaatyDescription(value);
        return `${elementA} é ${value}x mais importante (${desc})`;
    } else {
        const absValue = Math.abs(value);
        const desc = AHP.getSaatyDescription(absValue);
        return `${elementB} é ${absValue}x mais importante (${desc})`;
    }
}

function updateCriteriaComparison(i, j, value) {
    AHP.updateMatrix(appState.criteriaMatrix, i, j, value);
    updateCriteriaConsistency();
}

function updateAlternativeComparison(criterionIndex, i, j, value) {
    const matrix = appState.alternativesMatrices[criterionIndex];
    AHP.updateMatrix(matrix, i, j, value);
    updateAlternativesConsistency(criterionIndex);
}

function updateCriteriaConsistency() {
    const analysis = AHP.analyzeConsistency(appState.criteriaMatrix);
    appState.criteriaAnalysis = analysis;
    
    const container = document.getElementById('criteria-consistency');
    container.innerHTML = formatConsistencyInfo(analysis);
}

function updateAlternativesConsistency(criterionIndex) {
    const matrix = appState.alternativesMatrices[criterionIndex];
    const analysis = AHP.analyzeConsistency(matrix);
    appState.alternativesAnalysis[criterionIndex] = analysis;
    
    const container = document.getElementById('alternatives-consistency');
    container.innerHTML = formatConsistencyInfo(analysis);
}

function formatConsistencyInfo(analysis) {
    const crClass = analysis.isConsistent ? 'consistent' : 'inconsistent';
    const crStatus = analysis.isConsistent ? '✓ Consistente' : '⚠ Inconsistente';
    
    return `
        <div class="consistency-badge ${crClass}">
            <strong>Razão de Consistência (CR):</strong> ${AHP.formatCR(analysis.cr)}
            <span class="status">${crStatus}</span>
        </div>
        ${!analysis.isConsistent ? '<p class="warning-text">⚠️ CR > 0.10: Revise seus julgamentos para melhorar a consistência.</p>' : ''}
    `;
}

function validateAllJudgments() {
    // Verificar consistência dos critérios (apenas se não usar pesos manuais)
    if (!appState.useManualWeights && !appState.criteriaAnalysis.isConsistent) {
        showAlert('A comparação dos critérios está inconsistente (CR > 0.10). Por favor, revise seus julgamentos!', 'error');
        switchTab('criteria-judgments');
        return false;
    }

    // Verificar se todas as alternativas foram julgadas e estão consistentes
    for (let i = 0; i < appState.criteria.length; i++) {
        const analysis = appState.alternativesAnalysis[i];
        if (!analysis) {
            showAlert(`Complete os julgamentos para o critério: ${appState.criteria[i]}`, 'warning');
            document.getElementById('current-criterion').value = i;
            renderAlternativesComparisons(i);
            switchTab('alternatives-judgments');
            return false;
        }
        if (!analysis.isConsistent) {
            showAlert(`A comparação das alternativas para "${appState.criteria[i]}" está inconsistente (CR > 0.10). Por favor, revise!`, 'error');
            document.getElementById('current-criterion').value = i;
            renderAlternativesComparisons(i);
            switchTab('alternatives-judgments');
            return false;
        }
    }

    return true;
}

function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// ============================================================
// PASSO 5: CÁLCULO E EXIBIÇÃO DOS RESULTADOS
// ============================================================

function calculateResults() {
    if (!validateAllJudgments()) {
        return;
    }

    // Obter prioridades dos critérios
    const criteriaPriorities = appState.criteriaAnalysis.priorities;

    // Obter prioridades das alternativas para cada critério
    const alternativesPriorities = [];
    for (let i = 0; i < appState.criteria.length; i++) {
        alternativesPriorities.push(appState.alternativesAnalysis[i].priorities);
    }

    // Calcular prioridades globais
    const globalPriorities = AHP.calculateGlobalPriorities(
        criteriaPriorities,
        alternativesPriorities
    );

    // Preparar resultados
    appState.results = {
        criteriaPriorities,
        alternativesPriorities,
        globalPriorities,
        ranking: appState.alternatives.map((alt, index) => ({
            name: alt,
            priority: globalPriorities[index],
            index
        })).sort((a, b) => b.priority - a.priority)
    };

    // Avançar para tela de resultados
    nextStep();
    renderResults();
}

function renderResults() {
    renderRanking();
    renderPrioritiesChart();
    renderDetailedAnalysis();
    renderCriteriaChart();
}

function renderRanking() {
    const container = document.getElementById('ranking-list');
    const ranking = appState.results.ranking;

    container.innerHTML = ranking.map((item, position) => {
        const medal = position === 0 ? '🥇' : position === 1 ? '🥈' : position === 2 ? '🥉' : '';
        const percentage = (item.priority * 100).toFixed(2);
        const barWidth = percentage;

        return `
            <div class="ranking-item">
                <div class="ranking-position">${medal} ${position + 1}º</div>
                <div class="ranking-details">
                    <div class="ranking-name">${item.name}</div>
                    <div class="ranking-bar">
                        <div class="ranking-bar-fill" style="width: ${barWidth}%"></div>
                    </div>
                    <div class="ranking-score">${percentage}%</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPrioritiesChart() {
    // Destruir gráfico anterior se existir
    if (appState.charts.priorities) {
        appState.charts.priorities.destroy();
    }

    const ctx = document.getElementById('priorities-chart');
    const ranking = appState.results.ranking;

    appState.charts.priorities = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ranking.map(item => item.name),
            datasets: [{
                data: ranking.map(item => (item.priority * 100).toFixed(2)),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6384',
                    '#C9CBCF',
                    '#4BC0C0',
                    '#FF6384'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function renderDetailedAnalysis() {
    const container = document.getElementById('detailed-analysis');
    const alternatives = appState.alternatives;
    const criteria = appState.criteria;
    const criteriaPriorities = appState.results.criteriaPriorities;
    const alternativesPriorities = appState.results.alternativesPriorities;

    let html = '<table class="analysis-table"><thead><tr>';
    html += '<th>Alternativa</th>';
    criteria.forEach((criterion, i) => {
        html += `<th>${criterion}<br><small>(${(criteriaPriorities[i] * 100).toFixed(1)}%)</small></th>`;
    });
    html += '<th class="total-col">Prioridade Global</th></tr></thead><tbody>';

    alternatives.forEach((alt, altIndex) => {
        html += `<tr><td class="alt-name">${alt}</td>`;
        
        criteria.forEach((_, critIndex) => {
            const value = alternativesPriorities[critIndex][altIndex];
            const contribution = value * criteriaPriorities[critIndex];
            html += `<td>${(value * 100).toFixed(1)}%<br><small>(+${(contribution * 100).toFixed(1)}%)</small></td>`;
        });
        
        const globalPriority = appState.results.globalPriorities[altIndex];
        html += `<td class="total-col"><strong>${(globalPriority * 100).toFixed(2)}%</strong></td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderCriteriaChart() {
    // Destruir gráfico anterior se existir
    if (appState.charts.criteria) {
        appState.charts.criteria.destroy();
    }

    const ctx = document.getElementById('criteria-chart');
    const criteria = appState.criteria;
    const priorities = appState.results.criteriaPriorities;

    appState.charts.criteria = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: criteria,
            datasets: [{
                label: 'Peso do Critério (%)',
                data: priorities.map(p => (p * 100).toFixed(2)),
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// ============================================================
// SALVAR E CARREGAR PROJETOS
// ============================================================

function saveProject() {
    const projectName = prompt('Digite um nome para este projeto:', appState.objective || 'Meu Projeto AHP');
    
    if (!projectName) return;

    const project = {
        name: projectName,
        timestamp: new Date().toISOString(),
        data: {
            objective: appState.objective,
            criteria: appState.criteria,
            criteriaWeights: appState.criteriaWeights,
            useManualWeights: appState.useManualWeights,
            alternatives: appState.alternatives,
            criteriaMatrix: appState.criteriaMatrix,
            alternativesMatrices: appState.alternativesMatrices
        }
    };

    // Salvar no localStorage
    const projects = getProjects();
    projects[projectName] = project;
    localStorage.setItem('ahp-projects', JSON.stringify(projects));

    showAlert(`Projeto "${projectName}" salvo com sucesso!`, 'success');
}

function openLoadModal() {
    const projects = getProjects();
    const projectsList = document.getElementById('projects-list');

    if (Object.keys(projects).length === 0) {
        projectsList.innerHTML = '<p class="empty-message">Nenhum projeto salvo ainda.</p>';
    } else {
        projectsList.innerHTML = Object.values(projects).map(project => {
            const date = new Date(project.timestamp).toLocaleString('pt-BR');
            return `
                <div class="project-item">
                    <div class="project-info">
                        <div class="project-name">${project.name}</div>
                        <div class="project-date">${date}</div>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-primary btn-sm" onclick="loadProject('${project.name}')">Carregar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.name}')">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    document.getElementById('load-modal').style.display = 'block';
}

function closeLoadModal() {
    document.getElementById('load-modal').style.display = 'none';
}

function loadProject(projectName) {
    const projects = getProjects();
    const project = projects[projectName];

    if (!project) {
        showAlert('Projeto não encontrado!', 'error');
        return;
    }

    // Carregar dados
    appState.objective = project.data.objective;
    appState.criteria = project.data.criteria;
    appState.criteriaWeights = project.data.criteriaWeights || [];
    appState.useManualWeights = project.data.useManualWeights || false;
    appState.alternatives = project.data.alternatives;
    appState.criteriaMatrix = project.data.criteriaMatrix;
    appState.alternativesMatrices = project.data.alternativesMatrices;
    appState.currentStep = 1;

    // Atualizar interface
    document.getElementById('objective-input').value = appState.objective;
    document.getElementById('manual-weights-toggle').checked = appState.useManualWeights;
    
    if (appState.useManualWeights) {
        document.getElementById('criteria-weight-input').style.display = 'block';
        document.getElementById('criteria-weight-summary').style.display = 'block';
        updateWeightSummary();
    }
    
    renderCriteriaList();
    renderAlternativesList();
    updateStepDisplay();

    closeLoadModal();
    showAlert(`Projeto "${projectName}" carregado com sucesso!`, 'success');
}

function deleteProject(projectName) {
    if (!confirm(`Deseja realmente excluir o projeto "${projectName}"?`)) {
        return;
    }

    const projects = getProjects();
    delete projects[projectName];
    localStorage.setItem('ahp-projects', JSON.stringify(projects));

    showAlert(`Projeto "${projectName}" excluído!`, 'success');
    openLoadModal(); // Atualizar lista
}

function getProjects() {
    const data = localStorage.getItem('ahp-projects');
    return data ? JSON.parse(data) : {};
}

// ============================================================
// UTILIDADES
// ============================================================

function showAlert(message, type = 'info') {
    const alertClass = type === 'error' ? 'alert-error' : 
                       type === 'warning' ? 'alert-warning' :
                       type === 'success' ? 'alert-success' : 'alert-info';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);
}

function resetApp() {
    if (!confirm('Deseja iniciar uma nova análise? Todos os dados não salvos serão perdidos.')) {
        return;
    }

    // Destruir gráficos existentes
    if (appState.charts.priorities) {
        appState.charts.priorities.destroy();
        appState.charts.priorities = null;
    }
    if (appState.charts.criteria) {
        appState.charts.criteria.destroy();
        appState.charts.criteria = null;
    }

    // Resetar estado
    appState.currentStep = 1;
    appState.objective = '';
    appState.criteria = [];
    appState.criteriaWeights = [];
    appState.useManualWeights = false;
    appState.alternatives = [];
    appState.criteriaMatrix = [];
    appState.alternativesMatrices = {};
    appState.criteriaAnalysis = null;
    appState.alternativesAnalysis = {};
    appState.results = null;

    // Limpar interface
    document.getElementById('objective-input').value = '';
    document.getElementById('manual-weights-toggle').checked = false;
    document.getElementById('criteria-weight-input').style.display = 'none';
    document.getElementById('criteria-weight-summary').style.display = 'none';
    renderCriteriaList();
    renderAlternativesList();
    updateStepDisplay();

    showAlert('Nova análise iniciada!', 'success');
}

function toggleScaleReference() {
    const content = document.getElementById('scale-content');
    content.classList.toggle('show');
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('load-modal');
    if (event.target === modal) {
        closeLoadModal();
    }
}

