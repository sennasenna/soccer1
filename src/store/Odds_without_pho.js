import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const OddsStore1 = defineStore('odds', () => {
  return {}
})

// 导出 Converter 类供外部使用
export class Converter1 {
    /**
     * Constructor
     * @param {Array} expects - Expected goals for home and away teams [homeExpect, awayExpect]
     */
    constructor(expects) {
        this.expects = expects;
        this.maxGoal = 10;
        this.goals = Array.from({ length: this.maxGoal + 1 }, (_, i) => i);

        // Calculate probability matrix using Poisson distribution
        this.pm = this._createProbabilityMatrix();
    }

    /**
     * Create probability matrix using Poisson distribution
     * @returns {Array} 2D array representing the probability matrix
     */
    _createProbabilityMatrix() {
        const [h_expect, a_expect] = this.expects;

        // Calculate Poisson PMF for home and away goals
        const h_pmf = this._poissonPMF(this.goals, h_expect);
        const a_pmf = this._poissonPMF(this.goals, a_expect);

        // Adjust last element to ensure sum to 1
        h_pmf[h_pmf.length - 1] = 1 - h_pmf.slice(0, -1).reduce((a, b) => a + b, 0);
        a_pmf[a_pmf.length - 1] = 1 - a_pmf.slice(0, -1).reduce((a, b) => a + b, 0);

        // Create outer product matrix (h_pmf.reshape(-1, 1) * a_pmf.reshape(1, -1))
        const pm = [];
        for (let i = 0; i < h_pmf.length; i++) {
            const row = [];
            for (let j = 0; j < a_pmf.length; j++) {
                row.push(h_pmf[i] * a_pmf[j]);
            }
            pm.push(row);
        }

        return pm;
    }

    /**
     * Calculate Poisson Probability Mass Function with high precision
     * @param {Array} k - Array of integers for which to calculate PMF
     * @param {number} lambda - Expected value (mean) of the Poisson distribution
     * @returns {Array} PMF values for each k
     */
    _poissonPMF(k, lambda) {
        // Pre-calculate factorials for better performance and precision
        const factorials = [1]; // factorials[0] = 0! = 1
        for (let i = 1; i <= Math.max(...k); i++) {
            factorials[i] = factorials[i - 1] * i;
        }

        // Pre-calculate e^(-lambda)
        const expNegLambda = Math.exp(-lambda);

        return k.map(x => {
            if (lambda === 0) {
                return x === 0 ? 1 : 0;
            }

            // Calculate lambda^x using iterative multiplication for better precision
            let lambdaPower = 1;
            for (let i = 1; i <= x; i++) {
                lambdaPower *= lambda;
            }

            // Poisson PMF formula: (e^(-λ) * λ^x) / x!
            return (expNegLambda * lambdaPower) / factorials[x];
        });
    }

    /**
     * Calculate European odds
     * @param {number} h - Handicap value
     * @returns {Array} European odds for home, draw, away
     */
    getEuroOdds(h = 0) {
        if (Math.abs(h) >= this.maxGoal - 1) {
            throw new Error('handicap too big');
        }

        const pm = this.pm;
        const p = [0, 0, 0];

        // Calculate draw probability (diagonal)
        p[1] = this._sumDiagonal(pm, h);

        // Calculate home win probability (lower triangle)
        p[0] = this._sumLowerTriangle(pm, h - 1);

        // Calculate away win probability (upper triangle)
        p[2] = this._sumUpperTriangle(pm, h + 1);

        // Return odds (1/p)
        return p.map(prob => 1 / prob);
    }

    /**
     * Calculate Asian handicap odds
     * @param {number|null} h - Handicap value, if null it will be calculated
     * @returns {Array} Handicap value followed by home and away odds
     */
    getAsianOdds(h = null) {
        if (h === null) {
            // Calculate handicap based on expected goals
            h = this.expects[1] - this.expects[0];
            h = Math.round(h * 4) * 0.25;
        }

        const pm = this.pm;
        const h0 = Math.floor(h + 0.251); // Special rounding for 0.75 handicap
        const h1 = h - h0;

        // Calculate probabilities
        const H = this._sumLowerTriangle(pm, h0 - 1);
        const D = this._sumDiagonal(pm, h0);
        const A = this._sumUpperTriangle(pm, h0 + 1);

        let p;

        if (h1 === 0) {
            p = [H, A];
        } else if (h1 === 0.25) {
            p = [H + D / 2, A];
        } else if (h1 === 0.5) {
            p = [H + D, A];
        } else if (h1 === -0.25) {
            p = [H, A + D / 2];
        } else {
            throw new Error('get_asian_odds does not supported this handicap!');
        }

        // Normalize probabilities
        const sumP = p.reduce((a, b) => a + b, 0);
        p = p.map(prob => prob / sumP);

        // Return handicap and odds
        return [h, ...p.map(prob => 1 / prob)];
    }

    /**
     * Calculate total goals (over/under) odds
     * @param {number|null} g - Goals line, if null it will be calculated
     * @returns {Array} Goals line followed by over and under odds
     */
    getTotalOdds(g = null) {
        if (g === null) {
            // Calculate goals line based on expected goals
            g = this.expects[0] + this.expects[1];
            g = Math.round(g * 4) * 0.25;
        }

        // Flip the matrix vertically
        const pm = this._flipMatrix(this.pm);
        const n = pm.length;
        const floorG = Math.floor(g);
        const g0 = floorG - n + 1;
        const g1 = g - floorG;

        let U, D, O, p;

        if (g1 === 0) {
            U = this._sumLowerTriangle(pm, g0 - 1); // under
            O = this._sumUpperTriangle(pm, g0 + 1); // over
            p = [O, U];
        } else if (g1 === 0.25) {
            U = this._sumLowerTriangle(pm, g0 - 1);
            D = this._sumDiagonal(pm, g0); // diagonal
            O = this._sumUpperTriangle(pm, g0 + 1);
            p = [O, U + D / 2];
        } else if (g1 === 0.5) {
            U = this._sumLowerTriangle(pm, g0);
            O = this._sumUpperTriangle(pm, g0 + 1);
            p = [O, U];
        } else if (g1 === 0.75) {
            const adjustedG0 = g0 + 1;
            U = this._sumLowerTriangle(pm, adjustedG0 - 1);
            D = this._sumDiagonal(pm, adjustedG0);
            O = this._sumUpperTriangle(pm, adjustedG0 + 1);
            p = [O + D / 2, U];
        } else {
            throw new Error('not supported!');
        }

        // Normalize probabilities
        const sumP = p.reduce((a, b) => a + b, 0);
        p = p.map(prob => prob / sumP);

        // Return goals line and odds
        return [g, ...p.map(prob => 1 / prob)];
    }

    /**
     * Helper method to sum diagonal elements with offset
     * @param {Array} matrix - 2D array
     * @param {number} offset - Diagonal offset
     * @returns {number} Sum of diagonal elements
     */
    _sumDiagonal(matrix, offset) {
        let sum = 0;
        for (let i = 0; i < matrix.length; i++) {
            const j = i + offset;
            if (j >= 0 && j < matrix[i].length) {
                sum += matrix[i][j];
            }
        }
        return sum;
    }

    /**
     * Helper method to sum lower triangle elements (including diagonal)
     * @param {Array} matrix - 2D array
     * @param {number} offset - Diagonal offset
     * @returns {number} Sum of lower triangle elements
     */
    _sumLowerTriangle(matrix, offset) {
        let sum = 0;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (j <= i + offset) {
                    sum += matrix[i][j];
                }
            }
        }
        return sum;
    }

    /**
     * Helper method to sum upper triangle elements (including diagonal)
     * @param {Array} matrix - 2D array
     * @param {number} offset - Diagonal offset
     * @returns {number} Sum of upper triangle elements
     */
    _sumUpperTriangle(matrix, offset) {
        let sum = 0;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (j >= i + offset) {
                    sum += matrix[i][j];
                }
            }
        }
        return sum;
    }

    /**
     * Helper method to flip matrix vertically
     * @param {Array} matrix - 2D array
     * @returns {Array} Flipped matrix
     */
    _flipMatrix(matrix) {
        // Create a deep copy to avoid modifying the original
        const copy = matrix.map(row => [...row]);
        return copy.reverse();
    }
}