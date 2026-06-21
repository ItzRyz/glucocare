/**
 * Pure TypeScript ML model service — no HTTP, no Python, no external calls.
 * Ported from api/model_service.py so the ML logic runs directly inside the
 * Next.js serverless function, eliminating the Flask HTTP proxy entirely.
 */

const SYMPTOM_COLUMNS = [
    'Polyuria', 'Polydipsia', 'sudden weight loss', 'weakness', 'Polyphagia',
    'Genital thrush', 'visual blurring', 'Itching', 'Irritability',
    'delayed healing', 'partial paresis', 'muscle stiffness', 'Alopecia', 'Obesity',
] as const;

// ---------------------------------------------------------------------------
// StandardScaler
// ---------------------------------------------------------------------------
class StandardScaler {
    mean = 0;
    std = 1;

    fit(data: number[]) {
        if (!data.length) return;
        this.mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((a, x) => a + (x - this.mean) ** 2, 0) / data.length;
        this.std = variance > 0 ? Math.sqrt(variance) : 1;
    }

    transform(data: number[]) {
        return data.map(x => (x - this.mean) / this.std);
    }
}

// ---------------------------------------------------------------------------
// Logistic Regression
// ---------------------------------------------------------------------------
class LogisticRegression {
    weights: number[] = [];
    bias = 0;

    private sigmoid(z: number) {
        return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
    }

    fit(X: number[][], y: number[], maxIter = 1000, lr = 0.1) {
        const n = X.length;
        if (!n) return;
        const f = X[0].length;
        this.weights = new Array(f).fill(0);
        this.bias = 0;

        for (let iter = 0; iter < maxIter; iter++) {
            const preds = X.map(row =>
                this.sigmoid(row.reduce((s, xi, j) => s + this.weights[j] * xi, 0) + this.bias)
            );

            const dw = new Array(f).fill(0);
            let db = 0;
            for (let i = 0; i < n; i++) {
                const err = preds[i] - y[i];
                for (let j = 0; j < f; j++) dw[j] += err * X[i][j];
                db += err;
            }
            for (let j = 0; j < f; j++) this.weights[j] -= lr * (dw[j] / n);
            this.bias -= lr * (db / n);
        }
    }

    predictProba(X: number[][]) {
        return X.map(row => {
            const z = row.reduce((s, xi, j) => s + this.weights[j] * xi, 0) + this.bias;
            const p = this.sigmoid(z);
            return [1 - p, p];
        });
    }

    predict(X: number[][]) {
        return this.predictProba(X).map(p => (p[1] >= 0.5 ? 1 : 0));
    }
}

// ---------------------------------------------------------------------------
// Decision Tree (for Random Forest)
// ---------------------------------------------------------------------------
type TreeNode =
    | { class: number; prob: number }
    | { featureIdx: number; threshold: number; left: TreeNode; right: TreeNode };

function gini(indices: number[], y: number[]) {
    if (!indices.length) return 0;
    const p1 = indices.reduce((s, i) => s + y[i], 0) / indices.length;
    return 1 - (p1 ** 2 + (1 - p1) ** 2);
}

function buildTree(X: number[][], y: number[], depth: number, maxDepth: number): TreeNode {
    const counts = y.reduce((c, v) => { c[v] = (c[v] ?? 0) + 1; return c; }, {} as Record<number, number>);
    const majority = (counts[1] ?? 0) >= (counts[0] ?? 0) ? 1 : 0;

    if (depth >= maxDepth || !(counts[0] ?? 0) || !(counts[1] ?? 0)) {
        return { class: majority, prob: (counts[1] ?? 0) / y.length };
    }

    let bestGini = 1;
    let bestSplit: { featureIdx: number; threshold: number; left: number[]; right: number[] } | null = null;

    for (let fi = 0; fi < X[0].length; fi++) {
        const values = new Set(X.map(row => row[fi]));
        for (const threshold of values) {
            const left = X.map((_, i) => i).filter(i => X[i][fi] <= threshold);
            const right = X.map((_, i) => i).filter(i => X[i][fi] > threshold);
            if (!left.length || !right.length) continue;
            const cost = (left.length * gini(left, y) + right.length * gini(right, y)) / y.length;
            if (cost < bestGini) { bestGini = cost; bestSplit = { featureIdx: fi, threshold, left, right }; }
        }
    }

    if (!bestSplit) return { class: majority, prob: (counts[1] ?? 0) / y.length };

    return {
        featureIdx: bestSplit.featureIdx,
        threshold: bestSplit.threshold,
        left: buildTree(bestSplit.left.map(i => X[i]), bestSplit.left.map(i => y[i]), depth + 1, maxDepth),
        right: buildTree(bestSplit.right.map(i => X[i]), bestSplit.right.map(i => y[i]), depth + 1, maxDepth),
    };
}

function predictRow(node: TreeNode, row: number[]): number {
    if ('class' in node) return node.prob;
    return row[node.featureIdx] <= node.threshold
        ? predictRow(node.left, row)
        : predictRow(node.right, row);
}

// ---------------------------------------------------------------------------
// Random Forest
// ---------------------------------------------------------------------------
class RandomForest {
    trees: TreeNode[] = [];

    fit(X: number[][], y: number[], nEstimators = 10, maxDepth = 5, seed = 42) {
        let rng = seed;
        const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return Math.abs(rng) / 0x7fffffff; };

        for (let t = 0; t < nEstimators; t++) {
            const indices = Array.from({ length: X.length }, () => Math.floor(rand() * X.length));
            const sX = indices.map(i => X[i]);
            const sy = indices.map(i => y[i]);
            this.trees.push(buildTree(sX, sy, 0, maxDepth));
        }
    }

    predictProba(X: number[][]) {
        return X.map(row => {
            const p = this.trees.reduce((s, tree) => s + predictRow(tree, row), 0) / this.trees.length;
            return [1 - p, p];
        });
    }

    predict(X: number[][]) {
        return this.predictProba(X).map(p => (p[1] >= 0.5 ? 1 : 0));
    }
}

// ---------------------------------------------------------------------------
// Synthetic Dataset (fallback when no CSV available)
// ---------------------------------------------------------------------------
function generateDataset(rows = 500): Array<Record<string, string>> {
    let rng = 42;
    const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return Math.abs(rng) / 0x7fffffff; };
    const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
    const choice = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

    return Array.from({ length: rows }, () => {
        const age = randInt(20, 80);
        const gender = choice(['Male', 'Female']);
        const row: Record<string, string> = { Age: String(age), Gender: gender };
        let positiveScore = 0;

        for (const col of SYMPTOM_COLUMNS) {
            const val = rand() < 0.35 ? 'Yes' : 'No';
            row[col] = val;
            if (['Polyuria', 'Polydipsia', 'Polyphagia', 'Obesity'].includes(col) && val === 'Yes') positiveScore++;
        }
        if (age > 45) positiveScore++;
        row['class'] = positiveScore >= 3 ? 'Positive' : 'Negative';
        return row;
    });
}

// ---------------------------------------------------------------------------
// Preprocessing
// ---------------------------------------------------------------------------
function preprocess(data: Array<Record<string, string>>) {
    const ages = data.map(r => parseFloat(r['Age'] ?? '0'));
    const scaler = new StandardScaler();
    scaler.fit(ages);

    const features: number[][] = [];
    const labels: number[] = [];

    for (const row of data) {
        labels.push(String(row['class'] ?? '').toLowerCase() === 'positive' ? 1 : 0);
        const gender = String(row['Gender'] ?? '').toLowerCase() === 'male' ? 1 : 0;
        const ageScaled = scaler.transform([parseFloat(row['Age'] ?? '0')])[0];
        const symptoms = SYMPTOM_COLUMNS.map(col => (String(row[col] ?? '').toLowerCase() === 'yes' ? 1 : 0));
        features.push([gender, ageScaled, ...symptoms]);
    }

    return { features, labels, scaler };
}

// ---------------------------------------------------------------------------
// Model Service singleton (trained once per Lambda warm start)
// ---------------------------------------------------------------------------
export interface PredictionResult {
    status: string;
    model: string;
    prediction: string;
    probability: string;
}

let _logreg: LogisticRegression | null = null;
let _rf: RandomForest | null = null;
let _scaler: StandardScaler | null = null;

function ensureTrained() {
    if (_logreg && _rf && _scaler) return;

    const data = generateDataset(500);
    const { features, labels, scaler } = preprocess(data);
    _scaler = scaler;

    // 80/20 train/test split using seeded shuffle
    const combined = features.map((f, i) => ({ f, l: labels[i] }));
    let rng = 42;
    for (let i = combined.length - 1; i > 0; i--) {
        rng = (rng * 1664525 + 1013904223) & 0xffffffff;
        const j = Math.abs(rng) % (i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    const splitIdx = Math.floor(combined.length * 0.8);
    const xTrain = combined.slice(0, splitIdx).map(d => d.f);
    const yTrain = combined.slice(0, splitIdx).map(d => d.l);

    _logreg = new LogisticRegression();
    _logreg.fit(xTrain, yTrain);

    _rf = new RandomForest();
    _rf.fit(xTrain, yTrain);
}

function prepareInput(data: Record<string, unknown>): number[][] {
    ensureTrained();
    const gender = String(data['Gender'] ?? '').toLowerCase() === 'male' ? 1 : 0;
    const ageScaled = _scaler!.transform([parseFloat(String(data['Age'] ?? '0'))])[0];
    const symptoms = SYMPTOM_COLUMNS.map(col => (String(data[col] ?? '').toLowerCase() === 'yes' ? 1 : 0));
    return [[gender, ageScaled, ...symptoms]];
}

export function predict(modelName: 'randomforest' | 'logisticregression', data: Record<string, unknown>): PredictionResult {
    ensureTrained();
    const input = prepareInput(data);

    const model = modelName === 'randomforest' ? _rf! : _logreg!;
    const label = modelName === 'randomforest' ? 'Random Forest' : 'Logistic Regression';

    const [pred] = model.predict(input);
    const [proba] = model.predictProba(input);

    const result = pred === 1 ? 'Positive' : 'Negative';
    const probability = pred === 1 ? proba[1] : proba[0];

    return {
        status: 'success',
        model: label,
        prediction: result,
        probability: `${(probability * 100).toFixed(2)}%`,
    };
}
