import os
import csv
import math
import random

SYMPTOM_COLUMNS = [
    'Polyuria', 'Polydipsia', 'sudden weight loss', 'weakness', 'Polyphagia',
    'Genital thrush', 'visual blurring', 'Itching', 'Irritability',
    'delayed healing', 'partial paresis', 'muscle stiffness', 'Alopecia', 'Obesity',
]

class StandardScaler:
    def __init__(self):
        self.mean = 0.0
        self.std = 1.0

    def fit(self, data):
        if not data:
            return
        self.mean = sum(data) / len(data)
        variance = sum((x - self.mean) ** 2 for x in data) / len(data)
        self.std = math.sqrt(variance) if variance > 0 else 1.0

    def transform(self, data):
        return [(x - self.mean) / self.std for x in data]

class LogisticRegression:
    def __init__(self, max_iter=1000, lr=0.1):
        self.max_iter = max_iter
        self.lr = lr
        self.weights = []
        self.bias = 0.0

    def sigmoid(self, z):
        if z >= 0:
            return 1.0 / (1.0 + math.exp(-z))
        else:
            return math.exp(z) / (1.0 + math.exp(z))

    def fit(self, X, y):
        n_samples = len(X)
        if n_samples == 0: return
        n_features = len(X[0])
        self.weights = [0.0] * n_features
        self.bias = 0.0

        for _ in range(self.max_iter):
            predictions = []
            for i in range(n_samples):
                z = sum(w * x for w, x in zip(self.weights, X[i])) + self.bias
                predictions.append(self.sigmoid(z))
            
            dw = [0.0] * n_features
            db = 0.0
            
            for i in range(n_samples):
                err = predictions[i] - y[i]
                for j in range(n_features):
                    dw[j] += err * X[i][j]
                db += err

            for j in range(n_features):
                self.weights[j] -= self.lr * (dw[j] / n_samples)
            self.bias -= self.lr * (db / n_samples)

    def predict_proba(self, X):
        probs = []
        for row in X:
            z = sum(w * x for w, x in zip(self.weights, row)) + self.bias
            p = self.sigmoid(z)
            probs.append([1.0 - p, p])
        return probs

    def predict(self, X):
        probs = self.predict_proba(X)
        return [1 if p[1] >= 0.5 else 0 for p in probs]

class DecisionTree:
    def __init__(self, max_depth=3):
        self.max_depth = max_depth
        self.tree = None

    def fit(self, X, y):
        self.tree = self._build_tree(X, y, depth=0)

    def _build_tree(self, X, y, depth):
        if not y:
            return {'class': 0, 'prob': 0.0}
        
        counts = {0: 0, 1: 0}
        for label in y: counts[label] += 1
        majority_class = 1 if counts[1] >= counts[0] else 0
        
        if depth >= self.max_depth or counts[0] == 0 or counts[1] == 0:
            return {'class': majority_class, 'prob': counts[1] / len(y)}

        best_gini = 1.0
        best_split = None
        n_features = len(X[0])
        
        for feature_idx in range(n_features):
            values = set(row[feature_idx] for row in X)
            for threshold in values:
                left_indices = [i for i in range(len(X)) if X[i][feature_idx] <= threshold]
                right_indices = [i for i in range(len(X)) if X[i][feature_idx] > threshold]
                
                if not left_indices or not right_indices:
                    continue
                
                def gini(indices):
                    if not indices: return 0
                    p1 = sum(y[i] for i in indices) / len(indices)
                    p0 = 1.0 - p1
                    return 1.0 - (p0**2 + p1**2)
                
                cost = (len(left_indices) * gini(left_indices) + len(right_indices) * gini(right_indices)) / len(y)
                if cost < best_gini:
                    best_gini = cost
                    best_split = {
                        'feature_idx': feature_idx,
                        'threshold': threshold,
                        'left_indices': left_indices,
                        'right_indices': right_indices
                    }

        if not best_split:
            return {'class': majority_class, 'prob': counts[1] / len(y)}

        left_X = [X[i] for i in best_split['left_indices']]
        left_y = [y[i] for i in best_split['left_indices']]
        right_X = [X[i] for i in best_split['right_indices']]
        right_y = [y[i] for i in best_split['right_indices']]
        
        return {
            'feature_idx': best_split['feature_idx'],
            'threshold': best_split['threshold'],
            'left': self._build_tree(left_X, left_y, depth + 1),
            'right': self._build_tree(right_X, right_y, depth + 1)
        }

    def _predict_row(self, row, node):
        if 'class' in node:
            return node
        if row[node['feature_idx']] <= node['threshold']:
            return self._predict_row(row, node['left'])
        else:
            return self._predict_row(row, node['right'])

    def predict_proba(self, X):
        probs = []
        for row in X:
            res = self._predict_row(row, self.tree)
            p = res['prob']
            probs.append([1.0 - p, p])
        return probs

class RandomForest:
    def __init__(self, n_estimators=10, max_depth=3):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.trees = []

    def fit(self, X, y):
        n_samples = len(X)
        for _ in range(self.n_estimators):
            indices = [random.randint(0, n_samples - 1) for _ in range(n_samples)]
            sample_X = [X[i] for i in indices]
            sample_y = [y[i] for i in indices]
            
            tree = DecisionTree(max_depth=self.max_depth)
            tree.fit(sample_X, sample_y)
            self.trees.append(tree)

    def predict_proba(self, X):
        tree_probs = [tree.predict_proba(X) for tree in self.trees]
        probs = []
        for i in range(len(X)):
            p = sum(tp[i][1] for tp in tree_probs) / self.n_estimators
            probs.append([1.0 - p, p])
        return probs

    def predict(self, X):
        probs = self.predict_proba(X)
        return [1 if p[1] >= 0.5 else 0 for p in probs]

def _generate_fallback_dataset(rows=500):
    random.seed(42)
    data = []
    for _ in range(rows):
        age = random.randint(20, 80)
        gender = random.choice(['Male', 'Female'])
        row = {'Age': age, 'Gender': gender}
        
        positive_score = 0
        for col in SYMPTOM_COLUMNS:
            val = 'Yes' if random.random() < 0.35 else 'No'
            row[col] = val
            if col in ['Polyuria', 'Polydipsia', 'Polyphagia', 'Obesity'] and val == 'Yes':
                positive_score += 1
                
        if age > 45:
            positive_score += 1
            
        row['class'] = 'Positive' if positive_score >= 3 else 'Negative'
        data.append(row)
    return data

def _load_dataset():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, 'data', 'diabetes_data_upload.csv'),
        os.path.join(base_dir, 'diabetes_data_upload.csv'),
        os.path.join(os.getcwd(), 'diabetes_data_upload.csv'),
    ]
    for path in candidates:
        if os.path.exists(path):
            data = []
            with open(path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
            return data
    print('[SISTEM] CSV tidak ditemukan, menggunakan dataset sintetis fallback.')
    return _generate_fallback_dataset()

def _preprocess(data):
    features = []
    labels = []
    
    feature_columns = ['Gender', 'Age_scaled'] + SYMPTOM_COLUMNS
    
    ages = [float(row.get('Age', 0)) for row in data]
    scaler = StandardScaler()
    scaler.fit(ages)
    
    for row in data:
        cls_val = str(row.get('class', '')).strip()
        labels.append(1 if cls_val.lower() == 'positive' else 0)
        
        gender_val = str(row.get('Gender', '')).strip()
        gender_encoded = 1 if gender_val.lower() == 'male' else 0
        
        age_scaled = scaler.transform([float(row.get('Age', 0))])[0]
        
        feature_row = [gender_encoded, age_scaled]
        for col in SYMPTOM_COLUMNS:
            val = str(row.get(col, '')).strip()
            feature_row.append(1 if val.lower() == 'yes' else 0)
            
        features.append(feature_row)
        
    return features, labels, scaler, feature_columns

class ModelService:
    def __init__(self):
        random.seed(42)
        data = _load_dataset()
        features, labels, self.scaler, self.feature_columns = _preprocess(data)

        combined = list(zip(features, labels))
        random.shuffle(combined)
        split_idx = int(len(combined) * 0.8)
        
        train_data = combined[:split_idx]
        x_train = [x for x, y in train_data]
        y_train = [y for x, y in train_data]

        self.logreg = LogisticRegression(max_iter=1000, lr=0.1)
        self.logreg.fit(x_train, y_train)

        self.rf = RandomForest(n_estimators=10, max_depth=5)
        self.rf.fit(x_train, y_train)

        print('=== [SISTEM] Model Logistic Regression & Random Forest Berhasil Dilatih! ===')

    def _prepare_input(self, data: dict):
        gender_val = str(data.get('Gender', '')).strip()
        gender_encoded = 1 if gender_val.lower() == 'male' else 0
        
        age_scaled = self.scaler.transform([float(data.get('Age', 0))])[0]
        
        feature_row = [gender_encoded, age_scaled]
        for col in SYMPTOM_COLUMNS:
            val = str(data.get(col, '')).strip()
            feature_row.append(1 if val.lower() == 'yes' else 0)
            
        return [feature_row]

    def predict(self, model_name: str, data: dict) -> dict:
        input_features = self._prepare_input(data)

        if model_name == 'randomforest':
            model = self.rf
            label = 'Random Forest'
        else:
            model = self.logreg
            label = 'Logistic Regression'

        pred = model.predict(input_features)
        prob = model.predict_proba(input_features)

        result = 'Positive' if pred[0] == 1 else 'Negative'
        probability = float(prob[0][1] if pred[0] == 1 else prob[0][0])

        return {
            'status': 'success',
            'model': label,
            'prediction': result,
            'probability': f'{probability * 100:.2f}%',
        }
