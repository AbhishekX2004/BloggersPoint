import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Embedding, LSTM, Dropout, GlobalMaxPooling1D, concatenate, MultiHeadAttention, LayerNormalization, Conv1D, MaxPooling1D, Flatten, GRU, Bidirectional
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
import numpy as np
import pandas as pd
import pickle
import json
from typing import List, Dict, Any, Tuple
import re
import emoji
import unicodedata
from collections import Counter, defaultdict
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
import warnings
warnings.filterwarnings('ignore')

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

class BlogTaggingModel:
    def __init__(self, config_path='blog_config.py', max_words=20000, max_title_len=60, max_content_len=500, embedding_dim=128):
        self.config_path = config_path
        self.max_words = max_words
        self.max_title_len = max_title_len
        self.max_content_len = max_content_len
        self.embedding_dim = embedding_dim
        
        # Core components
        self.tokenizer = None
        self.mlb = None
        self.tfidf_vectorizer = None
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Models for ensembling
        self.lstm_model = None
        self.cnn_model = None
        self.gru_model = None
        self.rf_model = None
        
        # Configuration mappings
        self.available_tags = []
        self.word_to_tag_mappings = {}
        self.tag_synonyms = {}
        self.domain_patterns = {}
        
        # Load configuration
        self.load_config()
        
        # preprocessing components
        self.build_preprocessing_maps()
    
    def load_config(self):
        """Load configuration from blog_config.py"""
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("blog_config", self.config_path)
            config = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(config)
            
            # Load available tags
            self.available_tags = getattr(config, 'AVAILABLE_TAGS', [])
            
            # Load all mapping dictionaries
            mapping_names = [
                'PROGRAMMING_LANGUAGES', 'COUNTRIES', 'CONTINENTS', 'SEVEN_WONDERS',
                'FRUITS', 'VEGETABLES', 'CUISINE', 'CULTURE', 'WILDLIFE',
                'PLANETS_STARS', 'TECH_TERMS', 'CAREER', 'MOVIES_AND_ENTERTAINMENT'
            ]
            
            for mapping_name in mapping_names:
                if hasattr(config, mapping_name):
                    mapping_dict = getattr(config, mapping_name)
                    self.word_to_tag_mappings[mapping_name] = mapping_dict
                    
        except Exception as e:
            print(f"Warning: Could not load config from {self.config_path}: {e}")
            print("Using default configuration...")
            self.available_tags = []
            self.word_to_tag_mappings = {}
    
    def build_preprocessing_maps(self):
        """Build comprehensive preprocessing maps from config"""
        # Create reverse mapping from words to tags
        self.word_to_tag_reverse = {}
        
        for category, mapping in self.word_to_tag_mappings.items():
            for word_list, tag in mapping.items():
                if isinstance(word_list, str):
                    word_list = [word_list]
                for word in word_list:
                    self.word_to_tag_reverse[word.lower()] = tag
        
        # Build domain-specific patterns
        self.domain_patterns = {
            'programming': re.compile(r'\b(code|coding|programming|python|java|javascript|html|css|sql|algorithm|function|variable|loop|api|framework|library|debug|git|github|software|development|web|app|mobile|frontend|backend|fullstack|devops|database|server|cloud|aws|azure|docker|kubernetes)\b', re.IGNORECASE),
            'technology': re.compile(r'\b(tech|technology|ai|artificial intelligence|machine learning|deep learning|neural network|blockchain|cryptocurrency|iot|vr|ar|virtual reality|augmented reality|robotics|automation|digital|innovation|startup|disruption)\b', re.IGNORECASE),
            'travel': re.compile(r'\b(travel|trip|vacation|holiday|tourism|destination|hotel|flight|passport|visa|backpack|adventure|explore|culture|cuisine|local|guide|itinerary|budget|solo|family)\b', re.IGNORECASE),
            'food': re.compile(r'\b(food|recipe|cooking|chef|restaurant|dish|meal|ingredient|flavor|taste|cuisine|kitchen|bake|fry|grill|healthy|diet|nutrition|organic|vegan|vegetarian)\b', re.IGNORECASE),
            'health': re.compile(r'\b(health|fitness|exercise|workout|gym|nutrition|diet|wellness|medical|doctor|hospital|medicine|treatment|therapy|mental health|stress|meditation|yoga|sleep|weight)\b', re.IGNORECASE),
            'business': re.compile(r'\b(business|entrepreneur|startup|company|marketing|sales|finance|investment|profit|revenue|strategy|management|leadership|team|productivity|innovation|growth|success)\b', re.IGNORECASE),
            'education': re.compile(r'\b(education|learning|school|university|course|study|student|teacher|professor|degree|certification|skill|knowledge|training|tutorial|academic|research|science)\b', re.IGNORECASE),
            'entertainment': re.compile(r'\b(movie|film|music|game|gaming|book|reading|art|culture|entertainment|celebrity|actor|singer|musician|artist|concert|festival|show|series|tv|streaming)\b', re.IGNORECASE)
        }
    
    def preprocess_text(self, text: str) -> str:
        """Text preprocessing with config-based mappings"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove URLs but keep domain information
        url_pattern = re.compile(r'https?://(?:www\.)?([^/\s]+)')
        urls = url_pattern.findall(text)
        for url in urls:
            if any(domain in url for domain in ['github', 'stackoverflow', 'medium', 'dev.to']):
                text = text.replace(url, 'programming_platform')
        text = re.sub(r'https?://\S+', '', text)
        
        # Handle emojis - convert to text but also extract sentiment
        emoji_sentiment = self.extract_emoji_sentiment(text)
        text = emoji.demojize(text, delimiters=(" :", ": "))
        
        # Extract and map technical terms, locations, etc.
        mapped_text = self.apply_config_mappings(text)
        
        # Tokenize and lemmatize
        tokens = word_tokenize(mapped_text)
        
        # Remove stopwords and apply lemmatization
        processed_tokens = []
        for token in tokens:
            if token not in self.stop_words and len(token) > 2:
                lemmatized = self.lemmatizer.lemmatize(token)
                processed_tokens.append(lemmatized)
        
        # Add emoji sentiment context
        if emoji_sentiment:
            processed_tokens.extend(emoji_sentiment)
        
        # Add domain context
        domain_context = self.extract_domain_context(text)
        processed_tokens.extend(domain_context)
        
        # Clean up and join
        text = ' '.join(processed_tokens)
        text = re.sub(r'[^\w\s:_-]', ' ', text)
        text = ' '.join(text.split())
        
        return text
    
    def extract_emoji_sentiment(self, text: str) -> List[str]:
        """Extract sentiment context from emojis"""
        positive_emojis = ['😄', '😊', '😍', '🎉', '👍', '❤️', '😁', '🤗', '😎', '✨', '🌟', '💯', '🔥', '🚀']
        negative_emojis = ['😢', '😞', '😰', '😱', '👎', '💔', '😡', '😠', '😤', '🤬', '💀', '⚠️']
        neutral_emojis = ['🤔', '😐', '😶', '🙃', '😇', '🤷', '💭', '📝', '📚', '💡']
        
        sentiment_context = []
        
        for emoji_char in text:
            if emoji_char in positive_emojis:
                sentiment_context.append('positive_emotion')
            elif emoji_char in negative_emojis:
                sentiment_context.append('negative_emotion')
            elif emoji_char in neutral_emojis:
                sentiment_context.append('neutral_emotion')
        
        return sentiment_context
    
    def apply_config_mappings(self, text: str) -> str:
        """Apply config-based word-to-tag mappings"""
        words = text.split()
        mapped_words = []
        
        for word in words:
            # Check if word maps to a specific tag
            if word in self.word_to_tag_reverse:
                mapped_tag = self.word_to_tag_reverse[word]
                mapped_words.append(f"{word} {mapped_tag.lower().replace(' ', '_')}")
            else:
                mapped_words.append(word)
        
        return ' '.join(mapped_words)
    
    def extract_domain_context(self, text: str) -> List[str]:
        """Extract domain-specific context"""
        context = []
        
        for domain, pattern in self.domain_patterns.items():
            if pattern.search(text):
                context.append(f"domain_{domain}")
        
        return context
    
    def build_lstm_model(self, num_tags: int) -> Model:
        """Build LSTM-based model"""
        title_input = Input(shape=(self.max_title_len,), name='title_input')
        content_input = Input(shape=(self.max_content_len,), name='content_input')
        
        # Shared embedding layer
        shared_embedding = Embedding(input_dim=self.max_words, 
                                   output_dim=self.embedding_dim,
                                   mask_zero=True)
        
        title_embedded = shared_embedding(title_input)
        content_embedded = shared_embedding(content_input)
        
        # Title processing with attention
        title_attention = MultiHeadAttention(num_heads=4, key_dim=32)(title_embedded, title_embedded)
        title_norm = LayerNormalization()(title_attention + title_embedded)
        title_lstm = Bidirectional(LSTM(64, dropout=0.3, recurrent_dropout=0.3))(title_norm)
        
        # Content processing with attention
        content_attention = MultiHeadAttention(num_heads=4, key_dim=32)(content_embedded, content_embedded)
        content_norm = LayerNormalization()(content_attention + content_embedded)
        content_lstm = Bidirectional(LSTM(64, dropout=0.3, recurrent_dropout=0.3))(content_norm)
        
        # Combine with different weights
        title_weighted = Dense(128, activation='relu')(title_lstm)
        content_weighted = Dense(64, activation='relu')(content_lstm)
        
        combined = concatenate([title_weighted, content_weighted])
        
        # Final layers
        dense1 = Dense(256, activation='relu')(combined)
        dropout1 = Dropout(0.5)(dense1)
        dense2 = Dense(128, activation='relu')(dropout1)
        dropout2 = Dropout(0.3)(dense2)
        
        output = Dense(num_tags, activation='sigmoid')(dropout2)
        
        model = Model(inputs=[title_input, content_input], outputs=output)
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        return model
    
    def build_cnn_model(self, num_tags: int) -> Model:
        """Build CNN-based model"""
        title_input = Input(shape=(self.max_title_len,), name='title_input')
        content_input = Input(shape=(self.max_content_len,), name='content_input')
        
        shared_embedding = Embedding(input_dim=self.max_words, 
                                   output_dim=self.embedding_dim)
        
        title_embedded = shared_embedding(title_input)
        content_embedded = shared_embedding(content_input)
        
        # Title CNN
        title_conv1 = Conv1D(128, 3, activation='relu')(title_embedded)
        title_conv2 = Conv1D(128, 4, activation='relu')(title_embedded)
        title_conv3 = Conv1D(128, 5, activation='relu')(title_embedded)
        
        title_pool1 = GlobalMaxPooling1D()(title_conv1)
        title_pool2 = GlobalMaxPooling1D()(title_conv2)
        title_pool3 = GlobalMaxPooling1D()(title_conv3)
        
        title_features = concatenate([title_pool1, title_pool2, title_pool3])
        
        # Content CNN
        content_conv1 = Conv1D(64, 3, activation='relu')(content_embedded)
        content_conv2 = Conv1D(64, 4, activation='relu')(content_embedded)
        content_conv3 = Conv1D(64, 5, activation='relu')(content_embedded)
        
        content_pool1 = GlobalMaxPooling1D()(content_conv1)
        content_pool2 = GlobalMaxPooling1D()(content_conv2)
        content_pool3 = GlobalMaxPooling1D()(content_conv3)
        
        content_features = concatenate([content_pool1, content_pool2, content_pool3])
        
        # Combine
        combined = concatenate([title_features, content_features])
        
        dense1 = Dense(256, activation='relu')(combined)
        dropout1 = Dropout(0.5)(dense1)
        dense2 = Dense(128, activation='relu')(dropout1)
        dropout2 = Dropout(0.3)(dense2)
        
        output = Dense(num_tags, activation='sigmoid')(dropout2)
        
        model = Model(inputs=[title_input, content_input], outputs=output)
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        return model
    
    def build_gru_model(self, num_tags: int) -> Model:
        """Build GRU-based model"""
        title_input = Input(shape=(self.max_title_len,), name='title_input')
        content_input = Input(shape=(self.max_content_len,), name='content_input')
        
        shared_embedding = Embedding(input_dim=self.max_words, 
                                   output_dim=self.embedding_dim,
                                   mask_zero=True)
        
        title_embedded = shared_embedding(title_input)
        content_embedded = shared_embedding(content_input)
        
        # Title GRU
        title_gru = Bidirectional(GRU(64, dropout=0.3, recurrent_dropout=0.3))(title_embedded)
        
        # Content GRU
        content_gru = Bidirectional(GRU(64, dropout=0.3, recurrent_dropout=0.3))(content_embedded)
        
        # Combine
        combined = concatenate([title_gru, content_gru])
        
        dense1 = Dense(256, activation='relu')(combined)
        dropout1 = Dropout(0.5)(dense1)
        dense2 = Dense(128, activation='relu')(dropout1)
        dropout2 = Dropout(0.3)(dense2)
        
        output = Dense(num_tags, activation='sigmoid')(dropout2)
        
        model = Model(inputs=[title_input, content_input], outputs=output)
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        return model
    
    def prepare_data(self, titles: List[str], contents: List[str], tags_list: List[List[str]]) -> Tuple:
        """Prepare data with preprocessing"""
        print("Applying preprocessing...")
        
        # Preprocessing
        processed_titles = [self.preprocess_text(title) for title in titles]
        processed_contents = [self.preprocess_text(content) for content in contents]
        
        # Combine for tokenizer
        all_texts = processed_titles + processed_contents
        
        # Tokenize
        self.tokenizer = Tokenizer(num_words=self.max_words, oov_token='<OOV>')
        self.tokenizer.fit_on_texts(all_texts)
        
        # Convert to sequences
        title_sequences = self.tokenizer.texts_to_sequences(processed_titles)
        content_sequences = self.tokenizer.texts_to_sequences(processed_contents)
        
        # Pad sequences
        X_title = pad_sequences(title_sequences, maxlen=self.max_title_len, padding='post')
        X_content = pad_sequences(content_sequences, maxlen=self.max_content_len, padding='post')
        
        # Prepare TF-IDF features for Random Forest
        combined_texts = [f"{title} {content}" for title, content in zip(processed_titles, processed_contents)]
        self.tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 3))
        X_tfidf = self.tfidf_vectorizer.fit_transform(combined_texts)
        
        # Filter tags to available tags only
        if self.available_tags:
            filtered_tags_list = []
            for tags in tags_list:
                filtered_tags = [tag for tag in tags if tag in self.available_tags]
                filtered_tags_list.append(filtered_tags if filtered_tags else ['general'])
            tags_list = filtered_tags_list
        
        # Prepare labels
        self.mlb = MultiLabelBinarizer()
        y = self.mlb.fit_transform(tags_list)
        
        return [X_title, X_content], X_tfidf, y
    
    def train_ensemble(self, titles: List[str], contents: List[str], tags_list: List[List[str]], 
                      validation_split: float = 0.2, epochs: int = 15, batch_size: int = 32):
        """Train ensemble of models"""
        print("Preparing data for ensemble training...")
        X_neural, X_tfidf, y = self.prepare_data(titles, contents, tags_list)
        
        print(f"Neural network input shapes: {X_neural[0].shape}, {X_neural[1].shape}")
        print(f"TF-IDF input shape: {X_tfidf.shape}")
        print(f"Labels shape: {y.shape}")
        print(f"Number of unique tags: {len(self.mlb.classes_)}")
        
        # Split data
        X_title_train, X_title_val, X_content_train, X_content_val, y_train, y_val = train_test_split(
            X_neural[0], X_neural[1], y, test_size=validation_split, random_state=42
        )
        
        X_tfidf_train, X_tfidf_val, _, _ = train_test_split(
            X_tfidf, y, test_size=validation_split, random_state=42
        )
        
        # Callbacks
        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2, min_lr=0.00001)
        ]
        
        # Train LSTM model
        print("Training LSTM model...")
        self.lstm_model = self.build_lstm_model(len(self.mlb.classes_))
        self.lstm_model.fit(
            [X_title_train, X_content_train], y_train,
            batch_size=batch_size, epochs=epochs,
            validation_data=([X_title_val, X_content_val], y_val),
            callbacks=callbacks, verbose=1
        )
        
        # Train CNN model
        print("Training CNN model...")
        self.cnn_model = self.build_cnn_model(len(self.mlb.classes_))
        self.cnn_model.fit(
            [X_title_train, X_content_train], y_train,
            batch_size=batch_size, epochs=epochs,
            validation_data=([X_title_val, X_content_val], y_val),
            callbacks=callbacks, verbose=1
        )
        
        # Train GRU model
        print("Training GRU model...")
        self.gru_model = self.build_gru_model(len(self.mlb.classes_))
        self.gru_model.fit(
            [X_title_train, X_content_train], y_train,
            batch_size=batch_size, epochs=epochs,
            validation_data=([X_title_val, X_content_val], y_val),
            callbacks=callbacks, verbose=1
        )
        
        # Train Random Forest model
        print("Training Random Forest model...")
        self.rf_model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
        self.rf_model.fit(X_tfidf_train.toarray(), y_train)
        
        print("Ensemble training completed!")
    
    def predict_ensemble(self, title: str, content: str, details: bool = False, 
                        top_k: int = 5, threshold: float = 0.25) -> Any:
        """Predict using ensemble of models"""
        if not all([self.lstm_model, self.cnn_model, self.gru_model, self.rf_model]):
            raise ValueError("Ensemble not fully trained!")
        
        # Preprocess
        title_processed = self.preprocess_text(title)
        content_processed = self.preprocess_text(content)
        
        # Prepare neural network inputs
        title_sequence = self.tokenizer.texts_to_sequences([title_processed])
        content_sequence = self.tokenizer.texts_to_sequences([content_processed])
        
        X_title = pad_sequences(title_sequence, maxlen=self.max_title_len, padding='post')
        X_content = pad_sequences(content_sequence, maxlen=self.max_content_len, padding='post')
        
        # Prepare TF-IDF input
        combined_text = f"{title_processed} {content_processed}"
        X_tfidf = self.tfidf_vectorizer.transform([combined_text])
        
        # Get predictions from all models
        lstm_pred = self.lstm_model.predict([X_title, X_content], verbose=0)[0]
        cnn_pred  = self.cnn_model.predict([X_title, X_content], verbose=0)[0]
        gru_pred  = self.gru_model.predict([X_title, X_content], verbose=0)[0]

        rf_raw_preds = self.rf_model.predict_proba(X_tfidf.toarray())

        rf_pred = []
        for i, prob in enumerate(rf_raw_preds):
            if prob[0].shape[0] < 2:
                print(f"!!! RF label {i} was trained on only one class — forcing probability = 0.0")
                rf_pred.append(0.0)
            else:
                rf_pred.append(prob[0][1])
        rf_pred = np.array(rf_pred)

        # print("lstm_pred:", type(lstm_pred), lstm_pred.shape, lstm_pred)
        # print("cnn_pred :", type(cnn_pred), cnn_pred.shape, cnn_pred)
        # print("gru_pred :", type(gru_pred), gru_pred.shape, gru_pred)
        # print("rf_pred  :", type(rf_pred), rf_pred.shape, rf_pred)

        
        # Ensemble predictions with weights
        # Neural networks get higher weight, RF provides diversity
        ensemble_pred = (0.3 * lstm_pred + 0.25 * cnn_pred + 0.25 * gru_pred + 0.2 * rf_pred)
        
        # Apply config-based post-processing
        ensemble_pred = self.apply_tag_constraints(ensemble_pred, title + " " + content)
        
        # Filter by threshold and get top-k
        tag_scores = []
        for i, score in enumerate(ensemble_pred):
            if score >= threshold:
                tag_scores.append((self.mlb.classes_[i], score))
        
        tag_scores.sort(key=lambda x: x[1], reverse=True)
        top_tags = tag_scores[:top_k]
        
        # Fallback if no tags above threshold
        if not top_tags:
            all_scores = list(zip(self.mlb.classes_, ensemble_pred))
            all_scores.sort(key=lambda x: x[1], reverse=True)
            top_tags = all_scores[:3]
        
        if details:
            return {
                'tags': [{'tag': tag, 'score': float(score)} for tag, score in top_tags],
                'model_predictions': {
                    'lstm': lstm_pred.tolist(),
                    'cnn': cnn_pred.tolist(),
                    'gru': gru_pred.tolist(),
                    'random_forest': rf_pred.tolist()
                },
                'ensemble_score': float(np.mean([score for _, score in top_tags])),
                'confidence': float(np.std([score for _, score in top_tags])),
                'preprocessing_applied': True
            }
        else:
            return [tag for tag, _ in top_tags]
    
    def apply_tag_constraints(self, predictions: np.ndarray, text: str) -> np.ndarray:
        """Apply config-based constraints to predictions"""
        if not self.available_tags:
            return predictions
        
        # Boost scores for tags that have strong word matches
        text_lower = text.lower()
        
        for i, tag in enumerate(self.mlb.classes_):
            if tag in self.available_tags:
                # Check if there are strong word matches for this tag
                boost_factor = 1.0
                
                # Check word mappings
                for word, mapped_tag in self.word_to_tag_reverse.items():
                    if mapped_tag == tag and word in text_lower:
                        boost_factor = 1.3
                        break
                
                # Check domain patterns
                for domain, pattern in self.domain_patterns.items():
                    if pattern.search(text_lower) and domain in tag.lower():
                        boost_factor = 1.2
                        break
                
                predictions[i] *= boost_factor
            else:
                # Penalize tags not in available_tags
                predictions[i] *= 0.1
        
        return predictions
    
    def save_ensemble(self, filepath: str):
        """Save the entire ensemble"""
        if not all([self.lstm_model, self.cnn_model, self.gru_model, self.rf_model]):
            raise ValueError("Ensemble not fully trained!")
        
        # Save neural network models
        self.lstm_model.save(f"{filepath}_lstm.keras")
        self.cnn_model.save(f"{filepath}_cnn.keras")
        self.gru_model.save(f"{filepath}_gru.keras")
        
        # Save Random Forest model
        with open(f"{filepath}_rf.pkl", 'wb') as f:
            pickle.dump(self.rf_model, f)
        
        # Save preprocessing objects
        with open(f"{filepath}_tokenizer.pkl", 'wb') as f:
            pickle.dump(self.tokenizer, f)
        
        with open(f"{filepath}_mlb.pkl", 'wb') as f:
            pickle.dump(self.mlb, f)
        
        with open(f"{filepath}_tfidf.pkl", 'wb') as f:
            pickle.dump(self.tfidf_vectorizer, f)
        
        # Save configuration
        config = {
            'max_words': self.max_words,
            'max_title_len': self.max_title_len,
            'max_content_len': self.max_content_len,
            'embedding_dim': self.embedding_dim,
            'available_tags': self.available_tags,
            'config_path': self.config_path
        }
        
        with open(f"{filepath}_config.json", 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"Ensemble saved to {filepath}")
    
    def load_ensemble(self, filepath: str):
        """Load the entire ensemble"""
        # Load configuration
        with open(f"{filepath}_config.json", 'r') as f:
            config = json.load(f)
        
        self.max_words = config['max_words']
        self.max_title_len = config['max_title_len']
        self.max_content_len = config['max_content_len']
        self.embedding_dim = config['embedding_dim']
        self.available_tags = config['available_tags']
        self.config_path = config.get('config_path', 'blog_config.py')
        
        # Reload config mappings
        self.load_config()
        self.build_preprocessing_maps()
        
        # Load models
        self.lstm_model = tf.keras.models.load_model(f"{filepath}_lstm.keras")
        self.cnn_model = tf.keras.models.load_model(f"{filepath}_cnn.keras")
        self.gru_model = tf.keras.models.load_model(f"{filepath}_gru.keras")
        
        with open(f"{filepath}_rf.pkl", 'rb') as f:
            self.rf_model = pickle.load(f)
        
        # Load preprocessing objects
        with open(f"{filepath}_tokenizer.pkl", 'rb') as f:
            self.tokenizer = pickle.load(f)
        
        with open(f"{filepath}_mlb.pkl", 'rb') as f:
            self.mlb = pickle.load(f)
        
        with open(f"{filepath}_tfidf.pkl", 'rb') as f:
            self.tfidf_vectorizer = pickle.load(f)
        
        print(f"Ensemble loaded from {filepath}")
