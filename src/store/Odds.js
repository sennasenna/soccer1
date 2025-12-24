import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const OddsStore = defineStore('odds', () => {
  return {}
})

// 导出 Converter 类供外部使用
export class Converter {
    constructor(expects) {
        this.expects = expects;
        const [h_expect, a_expect] = expects;
        this.max_goal = 10;
        const goals = Array.from({ length: this.max_goal + 1 }, (_, i) => i);

        // 计算泊松分布PMF
        const h_pmf = this.poissonPMF(goals, h_expect);
        // 最后一个元素设为1 - 前面所有元素的和（处理10球及以上的概率）
        h_pmf[h_pmf.length - 1] = 1 - h_pmf.slice(0, -1).reduce((a, b) => a + b, 0);

        const a_pmf = this.poissonPMF(goals, a_expect);
        a_pmf[a_pmf.length - 1] = 1 - a_pmf.slice(0, -1).reduce((a, b) => a + b, 0);

        // 构建概率矩阵 (外积)
        this.pm = this.outerProduct(h_pmf, a_pmf);

        // 调整概率矩阵的小数值
        const diff = 0.07 * h_expect * a_expect * Math.exp(-h_expect - a_expect);
        const minVal = Math.min(Math.abs(this.pm[0][0]), Math.abs(this.pm[0][1]), Math.abs(this.pm[1][0]), Math.abs(this.pm[1][1])) * 0.3;
        const finalDiff = Math.min(Math.max(diff, 0), minVal);

        this.pm[0][0] += finalDiff;
        this.pm[0][1] -= finalDiff;
        this.pm[1][0] -= finalDiff;
        this.pm[1][1] += finalDiff;
    }

    // 泊松分布概率质量函数
    poissonPMF(x, lambda) {
        return x.map(k => {
            if (k === 0) return Math.exp(-lambda);
            // 计算阶乘 k!
            let factorial = 1;
            for (let i = 1; i <= k; i++) {
                factorial *= i;
            }
            return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
        });
    }

    // 计算两个一维数组的外积（矩阵乘法）
    outerProduct(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            const row = [];
            for (let j = 0; j < b.length; j++) {
                row.push(a[i] * b[j]);
            }
            result.push(row);
        }
        return result;
    }

    // 计算矩阵对角线元素的和（指定偏移量）
    sumDiagonal(matrix, offset) {
        let sum = 0;
        const rows = matrix.length;
        const cols = matrix[0].length;

        for (let i = 0; i < rows; i++) {
            const j = i - offset;
            if (j >= 0 && j < cols) {
                sum += matrix[i][j];
            }
        }
        return sum;
    }

    // 计算下三角矩阵的和（包含指定偏移量）
    sumLowerTriangular(matrix, offset) {
        let sum = 0;
        const rows = matrix.length;
        const cols = matrix[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (j < i - offset) {
                    sum += matrix[i][j];
                }
            }
        }
        return sum;
    }

    // 计算上三角矩阵的和（包含指定偏移量）
    sumUpperTriangular(matrix, offset) {
        let sum = 0;
        const rows = matrix.length;
        const cols = matrix[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (j > i - offset) {
                    sum += matrix[i][j];
                }
            }
        }
        return sum;
    }

    // 反转矩阵行顺序（flipud）
    flipud(matrix) {
        return matrix.slice().reverse();
    }

    // 获取欧洲赔率
    getEuroOdds(h = 0) {
        if (Math.abs(h) >= this.max_goal - 1) {
            throw new Error('handicap too big');
        }

        const pm = this.pm;
        const p = [0, 0, 0];

        // 平局：对角线和
        p[1] = this.sumDiagonal(pm, h);
        // 主场胜：下三角和
        p[0] = this.sumLowerTriangular(pm, h - 1);
        // 客场胜：上三角和
        p[2] = this.sumUpperTriangular(pm, h + 1);

        // 转换为赔率
        return p.map(prob => 1 / prob);
    }

    // 获取亚洲盘口赔率
    getAsianOdds(h = null) {
        if (h === null) {
            h = this.expects[1] - this.expects[0];
            h = Math.round(h * 4) * 0.25;
        }

        const pm = this.pm;
        const h0 = Math.floor(h + 0.251); // 0.75盘口向上取整
        const h1 = h - h0;

        const H = this.sumLowerTriangular(pm, h0 - 1);
        const D = this.sumDiagonal(pm, h0);
        const A = this.sumUpperTriangular(pm, h0 + 1);

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
            throw new Error('handicap wrong');
        }

        // 归一化概率
        const sumP = p.reduce((a, b) => a + b, 0);
        p = p.map(prob => prob / sumP);

        // 返回 [盘口, 主队赔率, 客队赔率]
        return [h, 1 / p[0], 1 / p[1]];
    }

    // 获取大小球赔率
    getTotalOdds(g = null) {
        if (g === null) {
            g = this.expects[0] + this.expects[1];
            g = Math.round(g * 4) * 0.25;
        }

        const pm = this.flipud(this.pm);
        const n = pm.length;
        const floorG = Math.floor(g);
        let g0 = floorG - n + 1;
        const g1 = g - floorG;

        let p;
        if (g1 === 0) {
            const U = this.sumLowerTriangular(pm, g0 - 1); // 小
            const O = this.sumUpperTriangular(pm, g0 + 1); // 大
            p = [O, U];
        } else if (g1 === 0.25) {
            const U = this.sumLowerTriangular(pm, g0 - 1);
            const D = this.sumDiagonal(pm, g0);
            const O = this.sumUpperTriangular(pm, g0 + 1);
            p = [O, U + D / 2];
        } else if (g1 === 0.5) {
            const U = this.sumLowerTriangular(pm, g0);
            const O = this.sumUpperTriangular(pm, g0 + 1);
            p = [O, U];
        } else if (g1 === 0.75) {
            g0 = g0 + 1;
            const U = this.sumLowerTriangular(pm, g0 - 1);
            const D = this.sumDiagonal(pm, g0);
            const O = this.sumUpperTriangular(pm, g0 + 1);
            p = [O + D / 2, U];
        } else {
            throw new Error('goalline wrong');
        }

        // 归一化概率
        const sumP = p.reduce((a, b) => a + b, 0);
        p = p.map(prob => prob / sumP);

        // 返回 [大小球盘口, 大球赔率, 小球赔率]
        return [g, 1 / p[0], 1 / p[1]];
    }
}
