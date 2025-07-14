import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Embedding, LSTM, Dropout, GlobalMaxPooling1D, concatenate, MultiHeadAttention, LayerNormalization
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import pandas as pd
import pickle
import json
from typing import List, Dict, Any
import re
import emoji
import unicodedata
from collections import Counter

class BlogTaggingModel:
    def __init__(self, max_words=15000, max_title_len=50, max_content_len=400, embedding_dim=128):
        self.max_words = max_words
        self.max_title_len = max_title_len
        self.max_content_len = max_content_len
        self.embedding_dim = embedding_dim
        self.tokenizer = None
        self.mlb = None
        self.model = None
        self.tfidf_vectorizer = None
        
    def preprocess_text(self, text):
        """Clean and preprocess text while preserving emojis"""
        # Convert to lowercase (but preserve emojis)
        text = text.lower()
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        
        # Convert emojis to text descriptions
        # This creates tokens like ":thumbs_up:" which can be learned by the model
        text = emoji.demojize(text, delimiters=(" :", ": "))
        
        # Keep alphanumeric, spaces, and emoji-related characters
        # This regex preserves emoji text representations and basic punctuation
        text = re.sub(r'[^\w\s:_-]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def extract_emojis(self, text):
        """Extract emojis from text for additional context"""
        # Extract actual emoji characters
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags (iOS)
            "\U00002702-\U000027B0"  # dingbats
            "\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE
        )
        
        emojis = emoji_pattern.findall(text)
        return emojis
    
    def enhance_text_with_emoji_context(self, text):
        """Enhance text with emoji context for better understanding"""
        # Extract emojis before preprocessing
        emojis = self.extract_emojis(text)
        
        # Convert emojis to descriptive text
        emoji_descriptions = []
        for em in emojis:
            try:
                # Get emoji description
                desc = emoji.demojize(em, delimiters=(" ", " "))
                # Clean up the description
                desc = desc.replace(":", "").replace("_", " ")
                emoji_descriptions.append(desc)
            except:
                pass
        
        # Add emoji context to text
        if emoji_descriptions:
            emoji_context = " ".join(emoji_descriptions)
            enhanced_text = f"{text} {emoji_context}"
        else:
            enhanced_text = text
            
        return enhanced_text
    
    def extract_keywords(self, text, num_keywords=20):
        """Extract important keywords using TF-IDF"""
        if self.tfidf_vectorizer is None:
            return []
        
        try:
            tfidf_matrix = self.tfidf_vectorizer.transform([text])
            feature_names = self.tfidf_vectorizer.get_feature_names_out()
            tfidf_scores = tfidf_matrix.toarray()[0]
            
            # Get top keywords
            keyword_scores = list(zip(feature_names, tfidf_scores))
            keyword_scores.sort(key=lambda x: x[1], reverse=True)
            
            return [keyword for keyword, score in keyword_scores[:num_keywords] if score > 0]
        except:
            return []
    
    def build_model(self, num_tags):
        """Build improved neural network model with separate title and content processing"""
        
        # Title input - shorter sequence, higher weight
        title_input = Input(shape=(self.max_title_len,), name='title_input')
        title_embedding = Embedding(input_dim=self.max_words, 
                                   output_dim=self.embedding_dim,
                                   input_length=self.max_title_len,
                                   name='title_embedding')(title_input)
        
        # Content input - longer sequence  
        content_input = Input(shape=(self.max_content_len,), name='content_input')
        content_embedding = Embedding(input_dim=self.max_words, 
                                     output_dim=self.embedding_dim,
                                     input_length=self.max_content_len,
                                     name='content_embedding')(content_input)
        
        # Process title - more focus on capturing key concepts
        title_attention = MultiHeadAttention(num_heads=4, key_dim=32)(title_embedding, title_embedding)
        title_norm = LayerNormalization()(title_attention + title_embedding)
        title_lstm = LSTM(128, dropout=0.2, recurrent_dropout=0.2)(title_norm)
        title_dense = Dense(128, activation='relu')(title_lstm)
        
        # Process content - broader context understanding
        content_attention = MultiHeadAttention(num_heads=4, key_dim=32)(content_embedding, content_embedding)
        content_norm = LayerNormalization()(content_attention + content_embedding)
        content_lstm = LSTM(96, dropout=0.2, recurrent_dropout=0.2)(content_norm)
        content_dense = Dense(96, activation='relu')(content_lstm)
        
        # Combine title and content with weighted importance
        # Title gets higher weight (2x) as it's more indicative of main topic
        title_weighted = Dense(128, activation='relu', name='title_weighted')(title_dense)
        content_weighted = Dense(64, activation='relu', name='content_weighted')(content_dense)
        
        # Concatenate weighted features
        combined = concatenate([title_weighted, content_weighted])
        
        # Final processing layers
        combined_dense1 = Dense(256, activation='relu')(combined)
        combined_dropout1 = Dropout(0.5)(combined_dense1)
        
        combined_dense2 = Dense(128, activation='relu')(combined_dropout1)
        combined_dropout2 = Dropout(0.3)(combined_dense2)
        
        # Output layer
        output = Dense(num_tags, activation='sigmoid', name='tag_output')(combined_dropout2)
        
        model = Model(inputs=[title_input, content_input], outputs=output)
        
        # Use custom weighted loss to emphasize title importance
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def prepare_data(self, titles, contents, tags_list):
        """Prepare data for training with separate title and content processing"""
        
        # Enhance text with emoji context before preprocessing
        enhanced_titles = [self.enhance_text_with_emoji_context(title) for title in titles]
        enhanced_contents = [self.enhance_text_with_emoji_context(content) for content in contents]
        
        # Process titles and contents separately
        processed_titles = [self.preprocess_text(title) for title in enhanced_titles]
        processed_contents = [self.preprocess_text(content) for content in enhanced_contents]
        
        # Combine all text for tokenizer training (but keep separate for actual training)
        all_texts = processed_titles + processed_contents
        
        # Tokenize - fit on all text to get comprehensive vocabulary
        # Use char_level=False to handle emoji descriptions as tokens
        self.tokenizer = Tokenizer(num_words=self.max_words, oov_token='<OOV>', 
                                  char_level=False, filters='')
        self.tokenizer.fit_on_texts(all_texts)
        
        # Convert to sequences separately
        title_sequences = self.tokenizer.texts_to_sequences(processed_titles)
        content_sequences = self.tokenizer.texts_to_sequences(processed_contents)
        
        # Pad sequences with different lengths
        X_title = pad_sequences(title_sequences, maxlen=self.max_title_len, 
                               padding='post', truncating='post')
        X_content = pad_sequences(content_sequences, maxlen=self.max_content_len, 
                                 padding='post', truncating='post')
        
        # Prepare TF-IDF for keyword extraction (on combined text)
        combined_texts = [f"{title} {content}" for title, content in zip(processed_titles, processed_contents)]
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english', 
                                               ngram_range=(1, 2))
        self.tfidf_vectorizer.fit(combined_texts)
        
        # Prepare tags
        self.mlb = MultiLabelBinarizer()
        y = self.mlb.fit_transform(tags_list)
        
        return [X_title, X_content], y
    
    def train(self, titles, contents, tags_list, validation_split=0.2, epochs=20, batch_size=32):
        """Train the model with improved architecture"""
        print("Preparing data...")
        X, y = self.prepare_data(titles, contents, tags_list)
        
        print(f"Title shape: {X[0].shape}, Content shape: {X[1].shape}, Labels shape: {y.shape}")
        print(f"Number of unique tags: {len(self.mlb.classes_)}")
        print(f"Tags: {list(self.mlb.classes_)}")
        
        # Split data
        X_title_train, X_title_val, X_content_train, X_content_val, y_train, y_val = train_test_split(
            X[0], X[1], y, test_size=validation_split, random_state=42
        )
        
        print("Building model...")
        self.model = self.build_model(len(self.mlb.classes_))
        
        print("Model summary:")
        self.model.summary()
        
        # Callbacks for better training
        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3, min_lr=0.00001)
        ]
        
        print("Training model...")
        history = self.model.fit(
            [X_title_train, X_content_train], y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_data=([X_title_val, X_content_val], y_val),
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def predict(self, title, content, details=False, top_k=5, threshold=0.3):
        """Predict tags with improved threshold-based filtering"""
        if self.model is None or self.tokenizer is None or self.mlb is None:
            raise ValueError("Model not trained yet!")
        
        # Enhance with emoji context before preprocessing
        title_enhanced = self.enhance_text_with_emoji_context(title)
        content_enhanced = self.enhance_text_with_emoji_context(content)
        
        # Preprocess text
        title_processed = self.preprocess_text(title_enhanced)
        content_processed = self.preprocess_text(content_enhanced)
        
        # Tokenize and pad separately
        title_sequence = self.tokenizer.texts_to_sequences([title_processed])
        content_sequence = self.tokenizer.texts_to_sequences([content_processed])
        
        X_title = pad_sequences(title_sequence, maxlen=self.max_title_len, 
                               padding='post', truncating='post')
        X_content = pad_sequences(content_sequence, maxlen=self.max_content_len, 
                                 padding='post', truncating='post')
        
        # Predict
        predictions = self.model.predict([X_title, X_content])[0]
        
        # Filter predictions by threshold and get top-k
        tag_scores = []
        for i, score in enumerate(predictions):
            if score >= threshold:
                tag_scores.append((self.mlb.classes_[i], score))
        
        # Sort by score and get top-k
        tag_scores.sort(key=lambda x: x[1], reverse=True)
        top_tags = tag_scores[:top_k]
        
        # If no tags above threshold, get top 3 anyway
        if not top_tags:
            all_scores = list(zip(self.mlb.classes_, predictions))
            all_scores.sort(key=lambda x: x[1], reverse=True)
            top_tags = all_scores[:3]
        
        if details:
            # Return detailed information including emoji analysis
            combined_text = f"{title_processed} {content_processed}"
            original_emojis = self.extract_emojis(title + " " + content)
            
            result = {
                'tags': [{'tag': tag, 'score': float(score)} for tag, score in top_tags],
                'keywords': self.extract_keywords(combined_text),
                'confidence': float(np.mean([score for _, score in top_tags])) if top_tags else 0.0,
                'threshold_used': threshold,
                'emojis_found': original_emojis,
                'emoji_context_added': len(original_emojis) > 0
            }
            return result
        else:
            # Return just the tag names
            return [tag for tag, _ in top_tags]
    
    def save_model(self, filepath):
        """Save the trained model and preprocessing objects"""
        if self.model is None:
            raise ValueError("No model to save!")
        
        # Save model using modern Keras format
        self.model.save(f"{filepath}_model.keras")
        
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
            'embedding_dim': self.embedding_dim
        }
        with open(f"{filepath}_config.json", 'w') as f:
            json.dump(config, f)
    
    def load_model(self, filepath):
        """Load a trained model and preprocessing objects"""
        # Load configuration
        with open(f"{filepath}_config.json", 'r') as f:
            config = json.load(f)
        
        self.max_words = config['max_words']
        self.max_title_len = config['max_title_len']
        self.max_content_len = config['max_content_len']
        self.embedding_dim = config['embedding_dim']
        
        # Load model using modern Keras format
        self.model = tf.keras.models.load_model(f"{filepath}_model.keras")
        
        # Load preprocessing objects
        with open(f"{filepath}_tokenizer.pkl", 'rb') as f:
            self.tokenizer = pickle.load(f)
        
        with open(f"{filepath}_mlb.pkl", 'rb') as f:
            self.mlb = pickle.load(f)
        
        with open(f"{filepath}_tfidf.pkl", 'rb') as f:
            self.tfidf_vectorizer = pickle.load(f)

# Example usage
# if __name__ == "__main__":
#     from training_data import training_data
    
#     # Extract data
#     titles = [item['title'] for item in training_data]
#     contents = [item['content'] for item in training_data]
#     tags_list = [item['tags'] for item in training_data]
    
#     # Create and train model
#     model = BlogTaggingModel()
    
#     # Train model
#     print("Training model...")
#     history = model.train(titles, contents, tags_list, epochs=10)
    
#     # Save model
#     model.save_model("blog_tagging_model")
    
#     # Test prediction
#     test_title = "Introduction to Neural Networks and Deep Learning"
#     test_content = "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes that process information using deep learning techniques."
    
#     # Simple prediction
#     predicted_tags = model.predict(test_title, test_content)
#     print(f"Predicted tags: {predicted_tags}")
    
#     # Detailed prediction
#     detailed_result = model.predict(test_title, test_content, details=True)
#     print(f"Detailed result: {detailed_result}")


# if __name__ == "__main__":
#     test_input = "This is a test! 😄🚀 Visit https://example.com <b>bold</b> and enjoy 🎉 #ML #AI 👍"

#     model = BlogTaggingModel()
#     preprocessed = model.enhance_text_with_emoji_context(test_input)
#     preprocessed = model.preprocess_text(preprocessed)

#     print("Original:")
#     print(test_input)
#     print("\nPreprocessed:")
#     print(preprocessed)
