/**
 * app.js - Lógica Principal do Aplicativo AHP
 * Gerencia estado, navegação e interações do usuário
 */

// Estado global da aplicação
const appState = {
    currentStep: 1,
    objective: '',
    criteria: [],
    alternatives: [],
    criteriaMatrix: [],
    alternativesMatrices: {}, // { criterionIndex: matrix }
    criteriaAnalysis: null,
    alternativesAnalysis: {}, // { criterionIndex: analysis }
    results: null,
    charts: {
        priorities: null,
        criteria: null,
        tornado: null,
        sensitivityLines: null
    },
    sensitivityWeights: [] // Pesos temporários para análise de sensibilidade
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
        // Inicializar matriz de critérios para comparações AHP
        initializeCriteriaMatrix();
    }

    if (currentStep === 3) {
        if (appState.alternatives.length < 2) {
            showAlert('Adicione pelo menos 2 alternativas!', 'warning');
            return;
        }
        // Inicializar matrizes de alternativas para comparações AHP
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

function addCriterion() {
    const input = document.getElementById('criteria-input');
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
    input.value = '';
    renderCriteriaList();
}

function removeCriterion(index) {
    appState.criteria.splice(index, 1);
    renderCriteriaList();
}

function renderCriteriaList() {
    const container = document.getElementById('criteria-list');
    
    if (appState.criteria.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum critério adicionado ainda.</p>';
        return;
    }

    container.innerHTML = appState.criteria.map((criterion, index) => `
        <div class="item">
            <span class="item-text">${index + 1}. ${criterion}</span>
            <button class="btn-remove" onclick="removeCriterion(${index})">✖</button>
        </div>
    `).join('');
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

    // Renderizar comparações (método AHP puro - sempre via comparações)
    renderCriteriaComparisons();
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
    
    // Determinar o ID do indicador de consistência baseado no tipo
    const consistencyIndicatorId = isCriteria 
        ? 'criteria-inline-cr' 
        : `alternatives-inline-cr-${criterionIndex}`;
    
    return `
        <div class="comparison-item">
            <div class="comparison-item-header">
                <div class="comparison-labels">
                    <span class="label-left">${elementA}</span>
                    <span class="label-center">vs</span>
                    <span class="label-right">${elementB}</span>
                </div>
                <div class="inline-consistency-badge" id="${consistencyIndicatorId}">
                    <span class="cr-label">CR:</span>
                    <span class="cr-value">--</span>
                </div>
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
    
    // Atualizar todos os badges inline de consistência nos itens de comparação
    updateInlineConsistencyBadges('criteria-inline-cr', analysis);
}

function updateAlternativesConsistency(criterionIndex) {
    const matrix = appState.alternativesMatrices[criterionIndex];
    const analysis = AHP.analyzeConsistency(matrix);
    appState.alternativesAnalysis[criterionIndex] = analysis;
    
    const container = document.getElementById('alternatives-consistency');
    container.innerHTML = formatConsistencyInfo(analysis);
    
    // Atualizar todos os badges inline de consistência nos itens de comparação
    updateInlineConsistencyBadges(`alternatives-inline-cr-${criterionIndex}`, analysis);
}

function updateInlineConsistencyBadges(badgeId, analysis) {
    // Encontrar todos os badges com o mesmo ID (um por comparison-item)
    const badges = document.querySelectorAll(`#${badgeId}`);
    
    badges.forEach(badge => {
        const crValueElement = badge.querySelector('.cr-value');
        const crClass = analysis.isConsistent ? 'consistent' : 'inconsistent';
        
        if (crValueElement) {
            crValueElement.textContent = AHP.formatCR(analysis.cr);
            
            // Remover classes anteriores e adicionar a nova
            badge.classList.remove('consistent', 'inconsistent');
            badge.classList.add(crClass);
            
            // Adicionar ícone de status
            const iconSpan = badge.querySelector('.cr-status-icon');
            const icon = analysis.isConsistent ? '✅' : '⚠️';
            
            if (iconSpan) {
                iconSpan.textContent = icon;
            } else {
                // Criar ícone se não existir
                const newIcon = document.createElement('span');
                newIcon.className = 'cr-status-icon';
                newIcon.textContent = icon;
                badge.appendChild(newIcon);
            }
        }
    });
}

function formatConsistencyInfo(analysis) {
    const crClass = analysis.isConsistent ? 'consistent' : 'inconsistent';
    const crStatus = analysis.isConsistent ? '✅ Consistente' : '❌ Inconsistente';
    const n = analysis.priorities.length;
    
    // Calcular percentual de "qualidade" da consistência
    const crPercentage = analysis.cr <= 0 ? 100 : Math.max(0, Math.min(100, (1 - analysis.cr / 0.10) * 100));
    
    return `
        <div class="consistency-inline-grid">
            <div class="consistency-inline-metric">
                <span class="inline-label">λmax:</span>
                <span class="inline-value">${analysis.lambdaMax.toFixed(3)}</span>
            </div>
            
            <div class="consistency-inline-metric">
                <span class="inline-label">CI:</span>
                <span class="inline-value">${analysis.ci.toFixed(4)}</span>
            </div>
            
            <div class="consistency-inline-metric highlight">
                <span class="inline-label">CR:</span>
                <span class="inline-value ${crClass}">${AHP.formatCR(analysis.cr)}</span>
            </div>
            
            <div class="consistency-inline-metric status-inline">
                <span class="inline-status ${crClass}">${crStatus}</span>
            </div>
        </div>
        
        <div class="consistency-bar-container">
            <div class="consistency-bar-full">
                <div class="consistency-bar-fill ${crClass}" style="width: ${crPercentage}%"></div>
            </div>
            <span class="consistency-bar-label">Qualidade: ${crPercentage.toFixed(0)}%</span>
        </div>
        
        ${!analysis.isConsistent ? `
            <div class="consistency-alert-compact">
                <span class="alert-icon">⚠️</span>
                <span class="alert-text">
                    <strong>Inconsistente!</strong> CR = ${AHP.formatCR(analysis.cr)} > 0.10. 
                    Revise as comparações para melhorar a coerência lógica.
                </span>
            </div>
        ` : `
            <div class="consistency-success-compact">
                <span class="success-icon">✅</span>
                <span class="success-text">
                    <strong>Consistente!</strong> CR = ${AHP.formatCR(analysis.cr)} ≤ 0.10. 
                    Julgamentos logicamente coerentes.
                </span>
            </div>
        `}
    `;
}

function validateAllJudgments() {
    // Método AHP: SEMPRE validar consistência das comparações
    
    // Verificar consistência dos critérios
    if (!appState.criteriaAnalysis) {
        showAlert('Complete as comparações dos critérios!', 'warning');
        switchTab('criteria-judgments');
        return false;
    }
    
    if (!appState.criteriaAnalysis.isConsistent) {
        showAlert(`❌ INCONSISTÊNCIA DETECTADA nos Critérios!\n\nCR = ${AHP.formatCR(appState.criteriaAnalysis.cr)} (máximo permitido: 0.10)\n\nO método AHP exige consistência lógica nas comparações. Por favor, revise seus julgamentos para garantir coerência.`, 'error');
        switchTab('criteria-judgments');
        return false;
    }

    // Verificar consistência das alternativas
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
            showAlert(`❌ INCONSISTÊNCIA DETECTADA nas Alternativas!\n\nCritério: "${appState.criteria[i]}"\nCR = ${AHP.formatCR(analysis.cr)} (máximo permitido: 0.10)\n\nO método AHP exige consistência lógica nas comparações. Por favor, revise seus julgamentos.`, 'error');
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
    // Resultados principais
    renderRanking();
    renderPrioritiesChart();
    renderDetailedAnalysis();
    renderCriteriaChart();
    
    // Inicializar análise de sensibilidade
    initializeSensitivityAnalysis();
    
    // Event listeners para tabs de resultados
    document.querySelectorAll('.results-tabs .tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchResultsTab(tabName);
        });
    });
}

function switchResultsTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.results-tabs .tab-button').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Atualizar conteúdo
    const mainTab = document.getElementById('results-main');
    const sensitivityTab = document.getElementById('results-sensitivity');
    
    if (tabName === 'results-main') {
        mainTab.classList.add('active');
        sensitivityTab.classList.remove('active');
    } else {
        mainTab.classList.remove('active');
        sensitivityTab.classList.add('active');
    }
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
    appState.alternatives = project.data.alternatives;
    appState.criteriaMatrix = project.data.criteriaMatrix;
    appState.alternativesMatrices = project.data.alternativesMatrices;
    appState.currentStep = 1;

    // Atualizar interface
    document.getElementById('objective-input').value = appState.objective;
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
    if (appState.charts.tornado) {
        appState.charts.tornado.destroy();
        appState.charts.tornado = null;
    }
    if (appState.charts.sensitivityLines) {
        appState.charts.sensitivityLines.destroy();
        appState.charts.sensitivityLines = null;
    }

    // Resetar estado
    appState.currentStep = 1;
    appState.objective = '';
    appState.criteria = [];
    appState.alternatives = [];
    appState.criteriaMatrix = [];
    appState.alternativesMatrices = {};
    appState.criteriaAnalysis = null;
    appState.alternativesAnalysis = {};
    appState.results = null;

    // Limpar interface
    document.getElementById('objective-input').value = '';
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

// ============================================================
// ANÁLISE DE SENSIBILIDADE
// ============================================================

function initializeSensitivityAnalysis() {
    // Inicializar pesos temporários com os pesos originais
    appState.sensitivityWeights = [...appState.results.criteriaPriorities];
    
    // Renderizar componentes
    renderSensitivitySliders();
    renderSensitivityRanking();
    renderTornadoChart();
    renderSensitivityLinesSetup();
    renderCriticalPoints();
}

function renderSensitivitySliders() {
    const container = document.getElementById('sensitivity-sliders');
    const weights = appState.sensitivityWeights;
    
    let html = '';
    appState.criteria.forEach((criterion, index) => {
        const percentage = (weights[index] * 100).toFixed(1);
        html += `
            <div class="sensitivity-slider-item">
                <div class="sensitivity-slider-header">
                    <span class="criterion-name">${criterion}</span>
                    <span class="criterion-weight" id="sens-weight-${index}">${percentage}%</span>
                </div>
                <input type="range" 
                    id="sens-slider-${index}"
                    class="sensitivity-slider" 
                    min="0" 
                    max="100" 
                    step="0.5" 
                    value="${percentage}"
                    oninput="updateSensitivityWeight(${index}, this.value)">
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateSensitivityWeight(index, value) {
    const newValue = parseFloat(value) / 100;
    appState.sensitivityWeights[index] = newValue;
    
    // Atualizar display
    document.getElementById(`sens-weight-${index}`).textContent = value + '%';
    
    // Normalizar pesos (ajustar outros proporcionalmente)
    normalizeSensitivityWeights(index);
    
    // Atualizar gráficos
    renderSensitivityRanking();
    updateSensitivityTotal();
}

function normalizeSensitivityWeights(changedIndex) {
    const total = appState.sensitivityWeights.reduce((sum, w) => sum + w, 0);
    
    // Normalizar para que soma = 1
    if (total > 0 && Math.abs(total - 1) > 0.001) {
        const factor = 1 / total;
        appState.sensitivityWeights = appState.sensitivityWeights.map((w, i) => {
            // Aplicar fator de normalização
            return w * factor;
        });
        
        // Atualizar todos os sliders e displays
        appState.criteria.forEach((_, i) => {
            const percentage = (appState.sensitivityWeights[i] * 100).toFixed(1);
            const slider = document.getElementById(`sens-slider-${i}`);
            const display = document.getElementById(`sens-weight-${i}`);
            if (slider) slider.value = percentage;
            if (display) display.textContent = percentage + '%';
        });
    }
}

function updateSensitivityTotal() {
    const total = appState.sensitivityWeights.reduce((sum, w) => sum + w, 0);
    const totalElement = document.getElementById('sensitivity-total');
    const percentage = (total * 100).toFixed(1);
    
    totalElement.textContent = percentage + '%';
    
    if (Math.abs(total - 1) < 0.01) {
        totalElement.className = 'weight-total valid';
    } else {
        totalElement.className = 'weight-total incomplete';
    }
}

function renderSensitivityRanking() {
    const container = document.getElementById('sensitivity-ranking');
    
    // Recalcular prioridades globais com novos pesos
    const alternativesPriorities = [];
    for (let i = 0; i < appState.criteria.length; i++) {
        alternativesPriorities.push(appState.alternativesAnalysis[i].priorities);
    }
    
    const newGlobalPriorities = AHP.calculateGlobalPriorities(
        appState.sensitivityWeights,
        alternativesPriorities
    );
    
    // Criar ranking
    const ranking = appState.alternatives.map((alt, index) => ({
        name: alt,
        priority: newGlobalPriorities[index],
        originalPriority: appState.results.globalPriorities[index],
        change: newGlobalPriorities[index] - appState.results.globalPriorities[index]
    })).sort((a, b) => b.priority - a.priority);
    
    container.innerHTML = ranking.map((item, position) => {
        const medal = position === 0 ? '🥇' : position === 1 ? '🥈' : position === 2 ? '🥉' : '';
        const percentage = (item.priority * 100).toFixed(2);
        const change = (item.change * 100).toFixed(2);
        const changeClass = item.change > 0 ? 'positive' : item.change < 0 ? 'negative' : 'neutral';
        const changeSymbol = item.change > 0 ? '↑' : item.change < 0 ? '↓' : '→';
        
        return `
            <div class="ranking-item sensitivity-ranking-item">
                <div class="ranking-position">${medal} ${position + 1}º</div>
                <div class="ranking-details">
                    <div class="ranking-name">${item.name}</div>
                    <div class="ranking-bar">
                        <div class="ranking-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="ranking-score">
                        ${percentage}%
                        <span class="ranking-change ${changeClass}">
                            ${changeSymbol} ${Math.abs(parseFloat(change))}%
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTornadoChart() {
    if (appState.charts.tornado) {
        appState.charts.tornado.destroy();
    }
    
    const ctx = document.getElementById('tornado-chart');
    const baseWeights = appState.results.criteriaPriorities;
    const variation = 0.2; // ±20%
    
    // Calcular impacto para cada critério
    const impacts = [];
    
    appState.criteria.forEach((criterion, critIndex) => {
        // Calcular prioridade com peso aumentado
        const weightsUp = [...baseWeights];
        weightsUp[critIndex] = Math.min(baseWeights[critIndex] * (1 + variation), 1);
        const totalUp = weightsUp.reduce((sum, w) => sum + w, 0);
        const normalizedUp = weightsUp.map(w => w / totalUp);
        
        // Calcular prioridade com peso diminuído
        const weightsDown = [...baseWeights];
        weightsDown[critIndex] = Math.max(baseWeights[critIndex] * (1 - variation), 0);
        const totalDown = weightsDown.reduce((sum, w) => sum + w, 0);
        const normalizedDown = weightsDown.map(w => w / totalDown);
        
        // Calcular prioridades das alternativas
        const alternativesPriorities = [];
        for (let i = 0; i < appState.criteria.length; i++) {
            alternativesPriorities.push(appState.alternativesAnalysis[i].priorities);
        }
        
        const prioritiesUp = AHP.calculateGlobalPriorities(normalizedUp, alternativesPriorities);
        const prioritiesDown = AHP.calculateGlobalPriorities(normalizedDown, alternativesPriorities);
        
        // Calcular máximo impacto (maior mudança entre todas alternativas)
        let maxImpact = 0;
        for (let i = 0; i < appState.alternatives.length; i++) {
            const impact = Math.abs(prioritiesUp[i] - prioritiesDown[i]);
            maxImpact = Math.max(maxImpact, impact);
        }
        
        impacts.push({
            criterion,
            impact: maxImpact * 100 // Em percentual
        });
    });
    
    // Ordenar por impacto
    impacts.sort((a, b) => b.impact - a.impact);
    
    appState.charts.tornado = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: impacts.map(i => i.criterion),
            datasets: [{
                label: 'Impacto da Variação (±20%)',
                data: impacts.map(i => i.impact.toFixed(2)),
                backgroundColor: impacts.map((_, i) => {
                    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
                    return colors[i % colors.length];
                })
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Impacto: ' + context.parsed.x + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Variação Máxima no Ranking (%)'
                    }
                }
            }
        }
    });
}

function renderSensitivityLinesSetup() {
    const selector = document.getElementById('sensitivity-criterion-select');
    selector.innerHTML = appState.criteria.map((criterion, index) => 
        `<option value="${index}">${criterion}</option>`
    ).join('');
    
    renderSensitivityLines();
}

function renderSensitivityLines() {
    if (appState.charts.sensitivityLines) {
        appState.charts.sensitivityLines.destroy();
    }
    
    const ctx = document.getElementById('sensitivity-lines-chart');
    const critIndex = parseInt(document.getElementById('sensitivity-criterion-select').value);
    const baseWeights = appState.results.criteriaPriorities;
    
    // Gerar pontos de variação (0% a 100% para o critério selecionado)
    const points = [];
    for (let w = 0; w <= 100; w += 5) {
        points.push(w);
    }
    
    // Calcular prioridades para cada ponto
    const alternativesPriorities = [];
    for (let i = 0; i < appState.criteria.length; i++) {
        alternativesPriorities.push(appState.alternativesAnalysis[i].priorities);
    }
    
    const datasets = appState.alternatives.map((alt, altIndex) => {
        const data = points.map(weightPercent => {
            const newWeights = [...baseWeights];
            newWeights[critIndex] = weightPercent / 100;
            
            // Normalizar outros pesos
            const remaining = 1 - newWeights[critIndex];
            const oldRemaining = baseWeights.reduce((sum, w, i) => 
                i === critIndex ? sum : sum + w, 0);
            
            if (oldRemaining > 0) {
                for (let i = 0; i < newWeights.length; i++) {
                    if (i !== critIndex) {
                        newWeights[i] = baseWeights[i] * (remaining / oldRemaining);
                    }
                }
            }
            
            const globalPriorities = AHP.calculateGlobalPriorities(newWeights, alternativesPriorities);
            return (globalPriorities[altIndex] * 100).toFixed(2);
        });
        
        return {
            label: alt,
            data,
            borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][altIndex % 5],
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
        };
    });
    
    appState.charts.sensitivityLines = new Chart(ctx, {
        type: 'line',
        data: {
            labels: points,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: `Peso de "${appState.criteria[critIndex]}" (%)`
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Prioridade Global (%)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function renderCriticalPoints() {
    const container = document.getElementById('critical-points');
    
    // Identificar pontos críticos onde o ranking muda
    const baseWeights = appState.results.criteriaPriorities;
    const criticalInfo = [];
    
    appState.criteria.forEach((criterion, critIndex) => {
        // Tentar encontrar ponto de inversão entre top 2
        const topTwo = appState.results.ranking.slice(0, 2);
        
        // Simular variação do peso
        let inversionPoint = null;
        for (let w = 0; w <= 100; w += 1) {
            const newWeights = [...baseWeights];
            newWeights[critIndex] = w / 100;
            
            // Normalizar
            const remaining = 1 - newWeights[critIndex];
            const oldRemaining = baseWeights.reduce((sum, weight, i) => 
                i === critIndex ? sum : sum + weight, 0);
            
            if (oldRemaining > 0) {
                for (let i = 0; i < newWeights.length; i++) {
                    if (i !== critIndex) {
                        newWeights[i] = baseWeights[i] * (remaining / oldRemaining);
                    }
                }
            }
            
            const alternativesPriorities = [];
            for (let i = 0; i < appState.criteria.length; i++) {
                alternativesPriorities.push(appState.alternativesAnalysis[i].priorities);
            }
            
            const globalPriorities = AHP.calculateGlobalPriorities(newWeights, alternativesPriorities);
            
            // Verificar se houve inversão
            const alt1Index = topTwo[0].index;
            const alt2Index = topTwo[1].index;
            
            if (globalPriorities[alt1Index] < globalPriorities[alt2Index]) {
                inversionPoint = w;
                break;
            }
        }
        
        if (inversionPoint) {
            criticalInfo.push({
                criterion,
                currentWeight: (baseWeights[critIndex] * 100).toFixed(1),
                inversionPoint: inversionPoint.toFixed(1),
                change: Math.abs(inversionPoint - baseWeights[critIndex] * 100).toFixed(1),
                winner: topTwo[1].name,
                loser: topTwo[0].name
            });
        }
    });
    
    if (criticalInfo.length === 0) {
        container.innerHTML = `
            <div class="info-message" style="background: var(--success-light);">
                ✅ <strong>Decisão Robusta!</strong><br>
                Não foram encontrados pontos críticos de inversão nas variações testadas.
                A alternativa vencedora mantém sua posição em cenários variados.
            </div>
        `;
    } else {
        let html = `
            <p class="help-text">
                ⚠️ Pontos onde pequenas mudanças nos pesos podem alterar o ranking:
            </p>
        `;
        
        criticalInfo.forEach(info => {
            html += `
                <div class="critical-point-card">
                    <h4>🎯 ${info.criterion}</h4>
                    <div class="critical-point-details">
                        <div class="critical-point-item">
                            <span class="label">Peso Atual:</span>
                            <span class="value">${info.currentWeight}%</span>
                        </div>
                        <div class="critical-point-item">
                            <span class="label">Ponto de Inversão:</span>
                            <span class="value critical">${info.inversionPoint}%</span>
                        </div>
                        <div class="critical-point-item">
                            <span class="label">Margem:</span>
                            <span class="value">±${info.change}%</span>
                        </div>
                        <div class="critical-point-impact">
                            Se "${info.criterion}" alcançar ${info.inversionPoint}%, 
                            <strong>${info.winner}</strong> ultrapassará <strong>${info.loser}</strong>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
}

