/**
 * AHP.js - Módulo de Cálculos do Método AHP (Analytic Hierarchy Process)
 * Implementa todos os cálculos necessários para o método AHP
 */

class AHP {
    /**
     * Índice de Consistência Aleatória (RI) para matrizes de diferentes tamanhos
     */
    static RI = {
        1: 0.00,
        2: 0.00,
        3: 0.58,
        4: 0.90,
        5: 1.12,
        6: 1.24,
        7: 1.32,
        8: 1.41,
        9: 1.45,
        10: 1.49
    };

    /**
     * Calcula o vetor de prioridades a partir de uma matriz de comparação par a par
     * Usa o método do autovetor (eigenvector method)
     * @param {Array<Array<number>>} matrix - Matriz de comparação
     * @returns {Array<number>} - Vetor de prioridades normalizadas
     */
    static calculatePriorityVector(matrix) {
        const n = matrix.length;
        if (n === 0) return [];

        // Método da média geométrica (aproximação do autovetor principal)
        const priorities = [];
        
        for (let i = 0; i < n; i++) {
            let product = 1;
            for (let j = 0; j < n; j++) {
                product *= matrix[i][j];
            }
            // Raiz n-ésima do produto
            priorities[i] = Math.pow(product, 1 / n);
        }

        // Normalizar
        const sum = priorities.reduce((acc, val) => acc + val, 0);
        return priorities.map(p => p / sum);
    }

    /**
     * Calcula o maior autovalor (λmax) da matriz
     * @param {Array<Array<number>>} matrix - Matriz de comparação
     * @param {Array<number>} priorityVector - Vetor de prioridades
     * @returns {number} - Lambda max
     */
    static calculateLambdaMax(matrix, priorityVector) {
        const n = matrix.length;
        let lambdaMax = 0;

        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                sum += matrix[i][j] * priorityVector[j];
            }
            lambdaMax += sum / priorityVector[i];
        }

        return lambdaMax / n;
    }

    /**
     * Calcula o Índice de Consistência (CI)
     * @param {number} lambdaMax - Lambda max
     * @param {number} n - Tamanho da matriz
     * @returns {number} - Consistency Index
     */
    static calculateCI(lambdaMax, n) {
        if (n <= 1) return 0;
        return (lambdaMax - n) / (n - 1);
    }

    /**
     * Calcula a Razão de Consistência (CR)
     * @param {number} ci - Consistency Index
     * @param {number} n - Tamanho da matriz
     * @returns {number} - Consistency Ratio
     */
    static calculateCR(ci, n) {
        if (n <= 2) return 0;
        const ri = this.RI[n] || this.RI[10];
        return ci / ri;
    }

    /**
     * Analisa a consistência de uma matriz de comparação
     * @param {Array<Array<number>>} matrix - Matriz de comparação
     * @returns {Object} - Objeto com prioridades, CI, CR e status de consistência
     */
    static analyzeConsistency(matrix) {
        const n = matrix.length;
        
        if (n === 0) {
            return {
                priorities: [],
                lambdaMax: 0,
                ci: 0,
                cr: 0,
                isConsistent: true
            };
        }

        const priorities = this.calculatePriorityVector(matrix);
        const lambdaMax = this.calculateLambdaMax(matrix, priorities);
        const ci = this.calculateCI(lambdaMax, n);
        const cr = this.calculateCR(ci, n);

        return {
            priorities,
            lambdaMax,
            ci,
            cr,
            isConsistent: cr <= 0.10 || n <= 2
        };
    }

    /**
     * Cria uma matriz de comparação vazia (identidade)
     * @param {number} n - Tamanho da matriz
     * @returns {Array<Array<number>>} - Matriz identidade
     */
    static createEmptyMatrix(n) {
        const matrix = [];
        for (let i = 0; i < n; i++) {
            matrix[i] = [];
            for (let j = 0; j < n; j++) {
                matrix[i][j] = 1; // Inicializa com 1 (igual importância)
            }
        }
        return matrix;
    }

    /**
     * Atualiza a matriz de comparação com um julgamento
     * @param {Array<Array<number>>} matrix - Matriz de comparação
     * @param {number} i - Índice do primeiro elemento
     * @param {number} j - Índice do segundo elemento
     * @param {number} value - Valor do julgamento (escala de Saaty)
     */
    static updateMatrix(matrix, i, j, value) {
        matrix[i][j] = value;
        matrix[j][i] = 1 / value; // Propriedade de reciprocidade
    }

    /**
     * Calcula as prioridades globais das alternativas
     * @param {Array<number>} criteriaPriorities - Vetor de prioridades dos critérios
     * @param {Array<Array<number>>} alternativesPriorities - Matriz de prioridades das alternativas para cada critério
     * @returns {Array<number>} - Vetor de prioridades globais
     */
    static calculateGlobalPriorities(criteriaPriorities, alternativesPriorities) {
        const numAlternatives = alternativesPriorities[0].length;
        const globalPriorities = new Array(numAlternatives).fill(0);

        for (let alt = 0; alt < numAlternatives; alt++) {
            for (let crit = 0; crit < criteriaPriorities.length; crit++) {
                globalPriorities[alt] += criteriaPriorities[crit] * alternativesPriorities[crit][alt];
            }
        }

        return globalPriorities;
    }

    /**
     * Converte valor da escala de Saaty para número
     * @param {number} sliderValue - Valor do slider (-9 a 9, excluindo 0)
     * @returns {number} - Valor na escala de Saaty
     */
    static sliderToSaatyValue(sliderValue) {
        if (sliderValue === 0) return 1;
        if (sliderValue > 0) return sliderValue;
        return 1 / Math.abs(sliderValue);
    }

    /**
     * Converte valor da escala de Saaty para posição do slider
     * @param {number} saatyValue - Valor na escala de Saaty
     * @returns {number} - Valor do slider
     */
    static saatyValueToSlider(saatyValue) {
        if (saatyValue === 1) return 0;
        if (saatyValue > 1) return saatyValue;
        return -1 / saatyValue;
    }

    /**
     * Valida se uma matriz está completa (sem valores padrão)
     * @param {Array<Array<number>>} matrix - Matriz de comparação
     * @returns {boolean} - True se a matriz está completa
     */
    static isMatrixComplete(matrix) {
        const n = matrix.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                // Verifica se foi feito julgamento (diferente de 1)
                if (matrix[i][j] === 1 && i !== j) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Formata um número para exibição (2 casas decimais)
     * @param {number} value - Valor a ser formatado
     * @returns {string} - Valor formatado
     */
    static formatNumber(value) {
        return (value * 100).toFixed(2) + '%';
    }

    /**
     * Formata CR para exibição
     * @param {number} cr - Consistency Ratio
     * @returns {string} - CR formatado
     */
    static formatCR(cr) {
        return cr.toFixed(4);
    }

    /**
     * Retorna a descrição textual de um valor da escala de Saaty
     * @param {number} value - Valor na escala de Saaty
     * @returns {string} - Descrição textual
     */
    static getSaatyDescription(value) {
        const absValue = Math.abs(value);
        
        if (value === 0 || value === 1) return "Igual importância";
        
        const descriptions = {
            1: "Igual importância",
            2: "Entre igual e moderada",
            3: "Importância moderada",
            4: "Entre moderada e forte",
            5: "Importância forte",
            6: "Entre forte e muito forte",
            7: "Importância muito forte",
            8: "Entre muito forte e extrema",
            9: "Importância extrema"
        };

        const desc = descriptions[Math.abs(absValue)] || "Importância";
        
        if (absValue === value) {
            return desc;
        } else {
            return desc + " (inverso)";
        }
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AHP;
}

