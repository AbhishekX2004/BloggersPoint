import warnings
warnings.filterwarnings('ignore')

import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    Input,
    Dense,
    Embedding,
    LSTM,
    GRU,
    Dropout,
    GlobalMaxPooling1D,
    Bidirectional,
    MultiHeadAttention,
    LayerNormalization,
    Conv1D,
    concatenate,
)
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
from sklearn.preprocessing import MultiLabelBinarizer
from skmultilearn.model_selection import IterativeStratification
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    hamming_loss,
)
import pickle, json, re, emoji, nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from typing import List, Tuple, Any

for pack in ["punkt", "stopwords", "wordnet"]:
    try:
        nltk.data.find(f"tokenizers/{pack}")
    except LookupError:
        nltk.download(pack)


class BlogTaggingModel:
    def __init__(
        self,
        config_path: str = "blog_config.py",
        max_words: int = 20000,
        max_title_len: int = 60,
        max_content_len: int = 500,
        embedding_dim: int = 128,
        ensemble_weights: List[float] | None = None,
    ):
        self.config_path = config_path
        self.max_words = max_words
        self.max_title_len = max_title_len
        self.max_content_len = max_content_len
        self.embedding_dim = embedding_dim
        self.tokenizer = None
        self.mlb = None
        self.tfidf_vectorizer = None
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words("english"))
        self.lstm_model = None
        self.cnn_model = None
        self.gru_model = None
        self.rf_model = None
        self.available_tags: list[str] = []
        self.word_to_tag_mappings: dict[str, dict] = {}
        self.tag_synonyms: dict[str, list[str]] = {}
        self.domain_patterns: dict[str, re.Pattern] = {}
        self.load_config()
        self.build_preprocessing_maps()
        if ensemble_weights is None:
            ensemble_weights = [0.25, 0.25, 0.25, 0.25]
        self.ensemble_weights = (
            np.array(ensemble_weights, dtype="float32")
            / np.sum(ensemble_weights)
        )

    def load_config(self):
        try:
            import importlib.util

            spec = importlib.util.spec_from_file_location("blog_config", self.config_path)
            cfg = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(cfg)
            self.available_tags = getattr(cfg, "AVAILABLE_TAGS", [])
            mapping_names = [
                "PROGRAMMING_LANGUAGES",
                "COUNTRIES",
                "CONTINENTS",
                "SEVEN_WONDERS",
                "FRUITS",
                "VEGETABLES",
                "CUISINE",
                "CULTURE",
                "WILDLIFE",
                "PLANETS_STARS",
                "TECH_TERMS",
                "CAREER",
                "MOVIES_AND_ENTERTAINMENT",
                "MONEY_TERMS",
            ]
            for n in mapping_names:
                if hasattr(cfg, n):
                    self.word_to_tag_mappings[n] = getattr(cfg, n)
        except Exception:
            self.available_tags = []
            self.word_to_tag_mappings = {}

    def build_preprocessing_maps(self):
        self.word_to_tag_reverse: dict[str, str] = {}
        for m in self.word_to_tag_mappings.values():
            for k, v in m.items():
                ws = k if isinstance(k, list) else [k]
                for w in ws:
                    self.word_to_tag_reverse[w.lower()] = v
        self.domain_patterns = {
            "programming": re.compile(
                r"\b(code|coding|python|java|javascript|algorithm|framework|library|debug|git|github|software|development|web|api)\b",
                re.I,
            ),
            "food": re.compile(
                r"\b(food|recipe|cooking|chef|dish|meal|cuisine|kitchen|bake|nutrition)\b",
                re.I,
            ),
            "travel": re.compile(
                r"\b(travel|trip|vacation|tourism|destination|adventure)\b",
                re.I,
            ),
        }

    def preprocess_text(self, text: str) -> str:
        if not text:
            return ""
        txt = text.lower()
        txt = re.sub(r"<[^>]+>", "", txt)
        txt = re.sub(r"https?://\S+", "", txt)
        txt = emoji.demojize(txt, delimiters=(" :", ": "))
        tokens = word_tokenize(txt)
        clean = []
        for t in tokens:
            if t not in self.stop_words and len(t) > 2:
                clean.append(self.lemmatizer.lemmatize(t))
        return " ".join(clean)

    def build_lstm_model(self, num_tags: int) -> Model:
        ti = Input((self.max_title_len,))
        ci = Input((self.max_content_len,))
        emb = Embedding(self.max_words, self.embedding_dim, mask_zero=True)
        te = emb(ti)
        ce = emb(ci)
        ta = MultiHeadAttention(4, 32)(te, te)
        tn = LayerNormalization()(ta + te)
        tl = Bidirectional(LSTM(64, dropout=0.3, recurrent_dropout=0.3))(tn)
        ca = MultiHeadAttention(4, 32)(ce, ce)
        cn = LayerNormalization()(ca + ce)
        cl = Bidirectional(LSTM(64, dropout=0.3, recurrent_dropout=0.3))(cn)
        x = concatenate([Dense(128, activation="relu")(tl), Dense(64, activation="relu")(cl)])
        x = Dropout(0.5)(Dense(256, activation="relu")(x))
        x = Dropout(0.3)(Dense(128, activation="relu")(x))
        o = Dense(num_tags, activation="sigmoid")(x)
        m = Model([ti, ci], o)
        m.compile(
            optimizer="adam",
            loss=tf.keras.losses.BinaryFocalCrossentropy(),
            metrics=["accuracy"],
        )
        return m

    def build_cnn_model(self, num_tags: int) -> Model:
        ti = Input((self.max_title_len,))
        ci = Input((self.max_content_len,))
        emb = Embedding(self.max_words, self.embedding_dim)
        te = emb(ti)
        ce = emb(ci)
        tp3 = GlobalMaxPooling1D()(Conv1D(128, 3, activation="relu")(te))
        tp4 = GlobalMaxPooling1D()(Conv1D(128, 4, activation="relu")(te))
        tp5 = GlobalMaxPooling1D()(Conv1D(128, 5, activation="relu")(te))
        cp3 = GlobalMaxPooling1D()(Conv1D(64, 3, activation="relu")(ce))
        cp4 = GlobalMaxPooling1D()(Conv1D(64, 4, activation="relu")(ce))
        cp5 = GlobalMaxPooling1D()(Conv1D(64, 5, activation="relu")(ce))
        x = concatenate([tp3, tp4, tp5, cp3, cp4, cp5])
        x = Dropout(0.5)(Dense(256, activation="relu")(x))
        x = Dropout(0.3)(Dense(128, activation="relu")(x))
        o = Dense(num_tags, activation="sigmoid")(x)
        m = Model([ti, ci], o)
        m.compile(
            optimizer="adam",
            loss=tf.keras.losses.BinaryFocalCrossentropy(),
            metrics=["accuracy"],
        )
        return m

    def build_gru_model(self, num_tags: int) -> Model:
        ti = Input((self.max_title_len,))
        ci = Input((self.max_content_len,))
        emb = Embedding(self.max_words, self.embedding_dim, mask_zero=True)
        tl = Bidirectional(GRU(64, dropout=0.3, recurrent_dropout=0.3))(emb(ti))
        cl = Bidirectional(GRU(64, dropout=0.3, recurrent_dropout=0.3))(emb(ci))
        x = concatenate([tl, cl])
        x = Dropout(0.5)(Dense(256, activation="relu")(x))
        x = Dropout(0.3)(Dense(128, activation="relu")(x))
        o = Dense(num_tags, activation="sigmoid")(x)
        m = Model([ti, ci], o)
        m.compile(
            optimizer="adam",
            loss=tf.keras.losses.BinaryFocalCrossentropy(),
            metrics=["accuracy"],
        )
        return m

    def prepare_data(
        self, titles: List[str], contents: List[str], tags_list: List[List[str]]
    ) -> Tuple:
        pt = [self.preprocess_text(t) for t in titles]
        pc = [self.preprocess_text(c) for c in contents]
        self.tokenizer = Tokenizer(num_words=self.max_words, oov_token="<OOV>")
        self.tokenizer.fit_on_texts(pt + pc)
        xt = pad_sequences(
            self.tokenizer.texts_to_sequences(pt),
            maxlen=self.max_title_len,
            padding="post",
        )
        xc = pad_sequences(
            self.tokenizer.texts_to_sequences(pc),
            maxlen=self.max_content_len,
            padding="post",
        )
        comb = [f"{a} {b}" for a, b in zip(pt, pc)]
        self.tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words="english", ngram_range=(1, 3))
        xtfidf = self.tfidf_vectorizer.fit_transform(comb)
        if self.available_tags:
            tl = []
            for tgs in tags_list:
                f = [t for t in tgs if t in self.available_tags]
                tl.append(f if f else ["general"])
            tags_list = tl
        self.mlb = MultiLabelBinarizer()
        y = self.mlb.fit_transform(tags_list)
        return [xt, xc], xtfidf, y

    def _sample_weights(self, y: np.ndarray, class_weights: dict[int, float]) -> np.ndarray:
        sw = np.ones(y.shape[0], dtype="float32")
        for i in range(y.shape[0]):
            pos = np.where(y[i] == 1)[0]
            if pos.size:
                sw[i] = np.mean([class_weights[p] for p in pos])
        return sw

    def train_ensemble(
        self,
        titles: List[str],
        contents: List[str],
        tags_list: List[List[str]],
        validation_split: float = 0.2,
        epochs: int = 10,
        batch_size: int = 32,
    ):
        xn, xtfidf, y = self.prepare_data(titles, contents, tags_list)
        splitter = IterativeStratification(
            n_splits=2,
            order=1,
            sample_distribution_per_fold=[validation_split, 1 - validation_split],
        )
        tr_idx, v_idx = next(splitter.split(xn[0], y))
        xttr, xtv = xn[0][tr_idx], xn[0][v_idx]
        xctr, xcv = xn[1][tr_idx], xn[1][v_idx]
        ytr, yv = y[tr_idx], y[v_idx]
        xrftr, xrfv = xtfidf[tr_idx], xtfidf[v_idx]
        cnt = np.sum(ytr, axis=0)
        tot = ytr.shape[0]
        cw = {i: tot / (len(self.mlb.classes_) * c) for i, c in enumerate(cnt)}
        sw = self._sample_weights(ytr, cw)
        cb = [
            tf.keras.callbacks.EarlyStopping(patience=2, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(patience=1, factor=0.5, min_lr=1e-5),
        ]
        self.lstm_model = self.build_lstm_model(len(self.mlb.classes_))
        self.lstm_model.fit(
            [xttr, xctr],
            ytr,
            sample_weight=sw,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=([xtv, xcv], yv),
            callbacks=cb,
            verbose=0,
        )
        self.cnn_model = self.build_cnn_model(len(self.mlb.classes_))
        self.cnn_model.fit(
            [xttr, xctr],
            ytr,
            sample_weight=sw,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=([xtv, xcv], yv),
            callbacks=cb,
            verbose=0,
        )
        self.gru_model = self.build_gru_model(len(self.mlb.classes_))
        self.gru_model.fit(
            [xttr, xctr],
            ytr,
            sample_weight=sw,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=([xtv, xcv], yv),
            callbacks=cb,
            verbose=0,
        )
        self.rf_model = MultiOutputClassifier(RandomForestClassifier(n_estimators=200, random_state=42))
        self.rf_model.fit(xrftr.toarray(), ytr)
        vp = self._predict_batch([xtv, xcv], xrfv)
        thr = 0.25
        yb = (vp >= thr).astype(int)
        print("ExactMatchAcc:", accuracy_score(yv, yb))
        print("MicroP", precision_score(yv, yb, average="micro", zero_division=0))
        print("MicroR", recall_score(yv, yb, average="micro", zero_division=0))
        print("MicroF1", f1_score(yv, yb, average="micro", zero_division=0))
        print("Hamming", hamming_loss(yv, yb))

    def _rf_probs(self, v):
        res = []
        for p in self.rf_model.predict_proba(v):
            if p.shape[1] > 1:
                res.append(p[0, 1])
            else:
                res.append(0.01)
        return np.array(res)

    def _predict_batch(self, Xnn: list[np.ndarray], xtfidf):
        lt = self.lstm_model.predict(Xnn, verbose=0)
        cn = self.cnn_model.predict(Xnn, verbose=0)
        gr = self.gru_model.predict(Xnn, verbose=0)
        rf = np.vstack([self._rf_probs(xtfidf[i : i + 1].toarray()) for i in range(xtfidf.shape[0])])
        preds = (
            self.ensemble_weights[0] * lt
            + self.ensemble_weights[1] * cn
            + self.ensemble_weights[2] * gr
            + self.ensemble_weights[3] * rf
        )
        return np.clip(preds, 0, 1)

    def predict_ensemble(
        self,
        title: str,
        content: str,
        top_k: int = 5,
        threshold: float = 0.25,
    ) -> Any:
        if not all([self.lstm_model, self.cnn_model, self.gru_model, self.rf_model]):
            raise ValueError("Model not trained")
        tt = self.preprocess_text(title)
        ct = self.preprocess_text(content)
        xt = pad_sequences(
            self.tokenizer.texts_to_sequences([tt]),
            maxlen=self.max_title_len,
            padding="post",
        )
        xc = pad_sequences(
            self.tokenizer.texts_to_sequences([ct]),
            maxlen=self.max_content_len,
            padding="post",
        )
        rf_in = self.tfidf_vectorizer.transform([f"{tt} {ct}"])
        lp = self.lstm_model.predict([xt, xc], verbose=0)[0]
        cp = self.cnn_model.predict([xt, xc], verbose=0)[0]
        gp = self.gru_model.predict([xt, xc], verbose=0)[0]
        rp = self._rf_probs(rf_in.toarray())
        en = (
            self.ensemble_weights[0] * lp
            + self.ensemble_weights[1] * cp
            + self.ensemble_weights[2] * gp
            + self.ensemble_weights[3] * rp
        )
        idx = np.where(en >= threshold)[0]
        if idx.size == 0:
            idx = np.argsort(en)[-3:][::-1]
        pairs = sorted([(self.mlb.classes_[i], en[i]) for i in idx], key=lambda x: x[1], reverse=True)[:top_k]
        return [p[0] for p in pairs]

    def save_ensemble(self, path: str):
        self.lstm_model.save(f"{path}_lstm.keras")
        self.cnn_model.save(f"{path}_cnn.keras")
        self.gru_model.save(f"{path}_gru.keras")
        with open(f"{path}_rf.pkl", "wb") as f:
            pickle.dump(self.rf_model, f)
        with open(f"{path}_tokenizer.pkl", "wb") as f:
            pickle.dump(self.tokenizer, f)
        with open(f"{path}_mlb.pkl", "wb") as f:
            pickle.dump(self.mlb, f)
        with open(f"{path}_tfidf.pkl", "wb") as f:
            pickle.dump(self.tfidf_vectorizer, f)
        with open(f"{path}_config.json", "w") as f:
            json.dump(
                {
                    "max_words": self.max_words,
                    "max_title_len": self.max_title_len,
                    "max_content_len": self.max_content_len,
                    "embedding_dim": self.embedding_dim,
                    "available_tags": self.available_tags,
                    "config_path": self.config_path,
                    "ensemble_weights": self.ensemble_weights.tolist(),
                },
                f,
                indent=2,
            )

    def load_ensemble(self, path: str):
        with open(f"{path}_config.json") as f:
            cfg = json.load(f)
        self.__init__(
            cfg["config_path"],
            cfg["max_words"],
            cfg["max_title_len"],
            cfg["max_content_len"],
            cfg["embedding_dim"],
            cfg.get("ensemble_weights"),
        )
        self.lstm_model = tf.keras.models.load_model(f"{path}_lstm.keras")
        self.cnn_model = tf.keras.models.load_model(f"{path}_cnn.keras")
        self.gru_model = tf.keras.models.load_model(f"{path}_gru.keras")
        with open(f"{path}_rf.pkl", "rb") as f:
            self.rf_model = pickle.load(f)
        with open(f"{path}_tokenizer.pkl", "rb") as f:
            self.tokenizer = pickle.load(f)
        with open(f"{path}_mlb.pkl", "rb") as f:
            self.mlb = pickle.load(f)
        with open(f"{path}_tfidf.pkl", "rb") as f:
            self.tfidf_vectorizer = pickle.load(f)
