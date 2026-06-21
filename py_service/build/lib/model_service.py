import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

SYMPTOM_COLUMNS = [
    'Polyuria', 'Polydipsia', 'sudden weight loss', 'weakness', 'Polyphagia',
    'Genital thrush', 'visual blurring', 'Itching', 'Irritability',
    'delayed healing', 'partial paresis', 'muscle stiffness', 'Alopecia', 'Obesity',
]


def _generate_fallback_dataset(rows: int = 500) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    data = {
        'Age': rng.integers(20, 80, rows),
        'Gender': rng.choice(['Male', 'Female'], rows),
    }
    for col in SYMPTOM_COLUMNS:
        data[col] = rng.choice(['Yes', 'No'], rows, p=[0.35, 0.65])
    positive_score = (
        (data['Polyuria'] == 'Yes').astype(int)
        + (data['Polydipsia'] == 'Yes').astype(int)
        + (data['Polyphagia'] == 'Yes').astype(int)
        + (data['Obesity'] == 'Yes').astype(int)
        + (data['Age'] > 45).astype(int)
    )
    data['class'] = np.where(positive_score >= 3, 'Positive', 'Negative')
    return pd.DataFrame(data)


def _load_dataset() -> pd.DataFrame:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, 'data', 'diabetes_data_upload.csv'),
        os.path.join(base_dir, 'diabetes_data_upload.csv'),
        os.path.join(os.getcwd(), 'diabetes_data_upload.csv'),
    ]
    for path in candidates:
        if os.path.exists(path):
            return pd.read_csv(path)
    print('[SISTEM] CSV tidak ditemukan, menggunakan dataset sintetis fallback.')
    return _generate_fallback_dataset()


def _preprocess(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, StandardScaler, pd.Index]:
    processed = df.copy()
    processed['class'] = processed['class'].map({'Positive': 1, 'Negative': 0})
    processed['Gender'] = processed['Gender'].map({'Male': 1, 'Female': 0})

    yes_no_cols = [col for col in processed.columns if col not in ['Age', 'Gender', 'class']]
    for col in yes_no_cols:
        processed[col] = processed[col].map({'Yes': 1, 'No': 0})

    features = processed.drop('class', axis=1)
    labels = processed['class']

    scaler = StandardScaler()
    features = features.copy()
    features['Age_scaled'] = scaler.fit_transform(features[['Age']])
    features = features.drop('Age', axis=1)

    return features, labels, scaler, features.columns


class ModelService:
    def __init__(self):
        df = _load_dataset()
        features, labels, self.scaler, self.feature_columns = _preprocess(df)

        x_train, _, y_train, _ = train_test_split(
            features, labels, test_size=0.2, random_state=42, stratify=labels
        )

        self.logreg = LogisticRegression(max_iter=1000, random_state=42)
        self.logreg.fit(x_train, y_train)

        self.rf = RandomForestClassifier(n_estimators=100, random_state=42)
        self.rf.fit(x_train, y_train)

        print('=== [SISTEM] Model Logistic Regression & Random Forest Berhasil Dilatih! ===')

    def _prepare_input(self, data: dict) -> pd.DataFrame:
        input_df = pd.DataFrame([data])
        input_df['Age_scaled'] = self.scaler.transform(input_df[['Age']])
        input_df = input_df.drop('Age', axis=1)
        return input_df[self.feature_columns]

    def predict(self, model_name: str, data: dict) -> dict:
        input_df = self._prepare_input(data)

        if model_name == 'randomforest':
            model = self.rf
            label = 'Random Forest'
        else:
            model = self.logreg
            label = 'Logistic Regression'

        pred = model.predict(input_df)
        prob = model.predict_proba(input_df)

        result = 'Positive' if pred[0] == 1 else 'Negative'
        probability = float(prob[0][1] if pred[0] == 1 else prob[0][0])

        return {
            'status': 'success',
            'model': label,
            'prediction': result,
            'probability': f'{probability * 100:.2f}%',
        }
