# Blog Content Tagging Model

An advanced machine learning system to automatically tag blog content using a powerful ensemble of deep learning and classical models. This project includes a FastAPI-based backend to serve predictions via RESTful APIs.

##  Overview

This project is designed to predict relevant tags for blog articles based on their **title** and **content**. It combines multiple models—**LSTM**, **CNN**, **GRU**, and a **Random Forest classifier**—into a robust ensemble. The model also uses config-based preprocessing including:

- Emoji sentiment extraction
- Domain pattern recognition
- Word-to-tag mapping
- TF-IDF feature engineering

## Model Architecture

The ensemble includes:
- **LSTM**: Bidirectional with Multi-Head Attention
- **CNN**: Multi-kernel convolutions with global max pooling
- **GRU**: Bidirectional with dropout
- **Random Forest**: Multi-output classifier trained on TF-IDF vectors

Each model is trained on processed blog data and combined using weighted averaging during inference.

## FastAPI Endpoints

The API exposes several endpoints via FastAPI:

### `GET /`
> Health check endpoint

Returns a brief status report of the API and model readiness.

---

### `POST /predict`
> Predict tags for a single blog entry

**Payload**
```json
{
  "title": "Your blog title",
  "content": "The full content of your blog...",
  "details": true,
  "threshold": 0.3,
  "top_k": 5
}
```
**Returns**
- Predicted tags (top-k)
- Optionally includes detailed scores from each model

### `GET /tags`
> Lists all tags available for prediction

### `GET /model-info`
> Returns configuration and architecture details of the ensemble model

### `GET /training-info`
> Insights into the training data, such as tag distribution and content stats

###`POST /retrain`
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