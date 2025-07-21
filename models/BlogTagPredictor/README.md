# Blog Content Tagging Model

An advanced machine learning system to automatically tag blog content using a powerful ensemble of deep learning and classical models. This production-ready API serves predictions through a comprehensive FastAPI backend with real-time inference capabilities.

##  Overview

This project is designed to predict relevant tags for blog articles based on their **title** and **content**. It combines multiple models—**LSTM**, **CNN**, **GRU**, and a **Random Forest classifier**—into a robust ensemble. The model also uses config-based preprocessing including:

- Emoji sentiment extraction
- Domain pattern recognition
- Word-to-tag mapping
- TF-IDF feature engineering

## Model Architecture
### Ensemble Components

| Model             | Architecture                                                    | Purpose                                                   |
| ----------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| **LSTM**          | Bidirectional LSTM with Multi-Head Attention                    | Sequential pattern recognition and long-term dependencies |
| **CNN**           | Multi-kernel convolutions (3,4,5-grams) with Global Max Pooling | Local feature extraction and n-gram patterns              |
| **GRU**           | Bidirectional GRU with dropout                                  | Efficient sequence modeling with reduced complexity       |
| **Random Forest** | Multi-Output classifier on TF-IDF vectors                       | Classical ML approach for robust baseline predictions     |

### Preprocessing Pipeline
- **Text Cleaning**: HTML tag removal, URL filtering, emoji processing
- **Tokenization**: Advanced tokenization with lemmatization and stopword removal
- **Domain Recognition**: Pattern-based detection for programming, food, travel domains
- **Feature Engineering**: TF-IDF vectorization with n-gram analysis (1-3 grams)
- **Config Mapping**: Intelligent word-to-tag mappings from configuration files

## FastAPI Endpoints

The API exposes several endpoints via FastAPI:

### `GET /`
> Health check endpoint

Returns a brief status report of the API and model readiness.


### `POST /predict`
> Predict tags for a single blog entry

**Payload**
```json
{
  "title": "Your blog title",
  "content": "The full content of your blog...",
  "threshold": 0.3,
  "top_k": 5
}
```
**Returns**
- Predicted tags (top-k)

### `GET /tags`
> Lists all tags available for prediction

### `GET /model-info`
> Returns configuration and architecture details of the ensemble model

### `GET /training-info`
> Insights into the training data, such as tag distribution and content stats

### `POST /retrain`
> Retrain the ensemble model using training_data.py

### `GET /health`
> Detailed health check of all model components and preprocessing tools

### `GET /status`
> Returns full runtime status including environment, model components, and available endpoints

## Features
- Ensemble model improves tag accuracy and robustness
- Handles noisy inputs with smart preprocessing
- Domain-aware and emoji sentiment recognition
- FastAPI for real-time RESTful interaction
- Retrainable via API