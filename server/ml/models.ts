import { FEATURE_COLUMNS, type FeatureName } from '../../src/types/auctioniq.ts';

export interface TrainingSample {
  features: Record<FeatureName, number>;
  soldPriceCr: number;
}

function toVector(features: Record<FeatureName, number>): number[] {
  return FEATURE_COLUMNS.map((col) => {
    const val = features[col];
    return Number.isFinite(val) ? val : 0;
  });
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivotRow][col])) {
        pivotRow = row;
      }
    }
    const temp = M[col];
    M[col] = M[pivotRow];
    M[pivotRow] = temp;

    const pivot = Math.abs(M[col][col]) < 1e-10 ? 1e-10 : M[col][col];
    for (let j = col; j <= n; j++) {
      M[col][j] /= pivot;
    }
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = M[row][col];
        for (let j = col; j <= n; j++) {
          M[row][j] -= factor * M[col][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

export class StandardLinearRegression {
  private means: number[] = [];
  private stds: number[] = [];
  private weights: number[] = [];
  private intercept = 0;

  fit(samples: TrainingSample[], ridgeAlpha = 8.0): void {
    const n = samples.length;
    const p = FEATURE_COLUMNS.length;
    const X = samples.map((s) => toVector(s.features));
    const y = samples.map((s) => s.soldPriceCr);

    this.means = new Array(p).fill(0);
    this.stds = new Array(p).fill(1);

    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += X[i][j];
      this.means[j] = sum / n;

      let sq = 0;
      for (let i = 0; i < n; i++) {
        const d = X[i][j] - this.means[j];
        sq += d * d;
      }
      const std = Math.sqrt(sq / n);
      this.stds[j] = std > 1e-8 ? std : 1;
    }

    const Z = X.map((row) => [
      1,
      ...row.map((val, j) => (val - this.means[j]) / this.stds[j]),
    ]);

    const dim = p + 1;
    const ZtZ: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));
    const Zty: number[] = new Array(dim).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < dim; j++) {
        Zty[j] += Z[i][j] * y[i];
        for (let k = 0; k < dim; k++) {
          ZtZ[j][k] += Z[i][j] * Z[i][k];
        }
      }
    }

    // L2 ridge penalty on feature coefficients (excluding intercept) to stabilize collinear features
    for (let j = 1; j < dim; j++) {
      ZtZ[j][j] += ridgeAlpha;
    }

    const solved = solveLinearSystem(ZtZ, Zty);
    this.intercept = solved[0];
    this.weights = solved.slice(1);
  }

  predict(features: Record<FeatureName, number>): number {
    const x = toVector(features);
    let pred = this.intercept;
    for (let j = 0; j < x.length; j++) {
      const z = (x[j] - this.means[j]) / this.stds[j];
      pred += z * this.weights[j];
    }
    return Number(Math.max(0.3, Math.min(27.0, pred)).toFixed(2));
  }
}

interface TreeNode {
  isLeaf: boolean;
  value?: number;
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

class DeterministicRng {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0;
  }
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export class RandomForestRegressor {
  private trees: TreeNode[] = [];
  private nEstimators: number;
  private maxDepth: number;
  private minSamplesLeaf: number;
  private maxFeatures: number;

  constructor(nEstimators = 40, maxDepth = 6, minSamplesLeaf = 2, maxFeatures = 6) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.minSamplesLeaf = minSamplesLeaf;
    this.maxFeatures = maxFeatures;
  }

  fit(samples: TrainingSample[], seed = 42): void {
    const rng = new DeterministicRng(seed);
    const X = samples.map((s) => toVector(s.features));
    const y = samples.map((s) => s.soldPriceCr);
    const n = X.length;

    this.trees = [];
    for (let t = 0; t < this.nEstimators; t++) {
      const bootIdx: number[] = [];
      for (let i = 0; i < n; i++) {
        bootIdx.push(Math.floor(rng.next() * n));
      }
      const tree = this.buildTree(X, y, bootIdx, 0, rng);
      this.trees.push(tree);
    }
  }

  private buildTree(
    X: number[][],
    y: number[],
    indices: number[],
    depth: number,
    rng: DeterministicRng
  ): TreeNode {
    const meanVal = indices.reduce((acc, idx) => acc + y[idx], 0) / indices.length;

    if (depth >= this.maxDepth || indices.length <= this.minSamplesLeaf * 2) {
      return { isLeaf: true, value: meanVal };
    }

    const p = FEATURE_COLUMNS.length;
    const candidateFeatures = Array.from({ length: p }, (_, i) => i);
    for (let i = candidateFeatures.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      const tmp = candidateFeatures[i];
      candidateFeatures[i] = candidateFeatures[j];
      candidateFeatures[j] = tmp;
    }
    const chosenFeatures = candidateFeatures.slice(0, this.maxFeatures);

    let bestScore = Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeft: number[] = [];
    let bestRight: number[] = [];

    for (const fIdx of chosenFeatures) {
      const vals = Array.from(new Set(indices.map((i) => X[i][fIdx]))).sort((a, b) => a - b);
      if (vals.length < 2) continue;

      const step = Math.max(1, Math.floor(vals.length / 12));
      for (let k = 0; k < vals.length - 1; k += step) {
        const threshold = (vals[k] + vals[k + 1]) / 2;
        const left: number[] = [];
        const right: number[] = [];
        let sumL = 0;
        let sumR = 0;

        for (const idx of indices) {
          if (X[idx][fIdx] <= threshold) {
            left.push(idx);
            sumL += y[idx];
          } else {
            right.push(idx);
            sumR += y[idx];
          }
        }

        if (left.length < this.minSamplesLeaf || right.length < this.minSamplesLeaf) {
          continue;
        }

        const meanL = sumL / left.length;
        const meanR = sumR / right.length;
        let sse = 0;
        for (const idx of left) {
          const d = y[idx] - meanL;
          sse += d * d;
        }
        for (const idx of right) {
          const d = y[idx] - meanR;
          sse += d * d;
        }

        if (sse < bestScore) {
          bestScore = sse;
          bestFeature = fIdx;
          bestThreshold = threshold;
          bestLeft = left;
          bestRight = right;
        }
      }
    }

    if (bestFeature === -1) {
      return { isLeaf: true, value: meanVal };
    }

    return {
      isLeaf: false,
      featureIdx: bestFeature,
      threshold: bestThreshold,
      left: this.buildTree(X, y, bestLeft, depth + 1, rng),
      right: this.buildTree(X, y, bestRight, depth + 1, rng),
    };
  }

  private predictTree(node: TreeNode, x: number[]): number {
    if (node.isLeaf || node.featureIdx === undefined || node.threshold === undefined) {
      return node.value ?? 0;
    }
    if (x[node.featureIdx] <= node.threshold) {
      return this.predictTree(node.left!, x);
    }
    return this.predictTree(node.right!, x);
  }

  predict(features: Record<FeatureName, number>): number {
    const x = toVector(features);
    let total = 0;
    for (const tree of this.trees) {
      total += this.predictTree(tree, x);
    }
    const pred = total / this.trees.length;
    return Number(Math.max(0.3, Math.min(27.0, pred)).toFixed(2));
  }
}
