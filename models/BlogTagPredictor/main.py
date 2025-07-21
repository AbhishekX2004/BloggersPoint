from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
import sys
import logging
from contextlib import asynccontextmanager
from BlogTaggingModel import BlogTaggingModel
from training_data import training_data

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instance
model = None

class BlogContent(BaseModel):
    title: str
    content: str
    details: Optional[bool] = False
    threshold: Optional[float] = 0.25 
    top_k: Optional[int] = 5 

class TagPrediction(BaseModel):
    tag: str
    score: float

class DetailedResponse(BaseModel):
    tags: List[TagPrediction]
    model_predictions: Dict[str, List[float]]
    ensemble_score: float
    confidence: float
    preprocessing_applied: bool

class SimpleResponse(BaseModel):
    topics: List[str]

def train_new_ensemble():
    """Train a new ensemble model using data from training_data.py"""
    global model
    
    if not training_data:
        raise ValueError("No training data found in training_data.py!")
    
    # Extract data from training_data.py
    titles = [item['title'] for item in training_data]
    contents = [item['content'] for item in training_data]
    tags_list = [item['tags'] for item in training_data]
    
    logger.info(f"Training ensemble with {len(training_data)} samples...")
    
    # Train ensemble model with optimized parameters
    model.train_ensemble(
        titles=titles, 
        contents=contents, 
        tags_list=tags_list,
        validation_split=0.2,
        epochs=30,
        batch_size=32
    )
    
    # Save ensemble model
    model.save_ensemble("blog_tagging_ensemble")
    logger.info("New ensemble model trained and saved!")

async def load_model():
    """Load or train the ensemble model"""
    global model
    model = BlogTaggingModel()
    
    # Try to load existing ensemble model
    model_path = "blog_tagging_ensemble"
    try:
        # Check if all ensemble components exist
        ensemble_files = [
            f"{model_path}_lstm.keras",
            f"{model_path}_cnn.keras", 
            f"{model_path}_gru.keras",
            f"{model_path}_rf.pkl",
            f"{model_path}_config.json"
        ]
        
        if all(os.path.exists(f) for f in ensemble_files):
            model.load_ensemble(model_path)
            logger.info("Ensemble model loaded successfully!")
            logger.info(f"Available tags: {len(model.mlb.classes_)}")
        else:
            logger.info("Ensemble model files not found. Training new ensemble...")
            train_new_ensemble()
            
    except Exception as e:
        logger.error(f"Error loading ensemble model: {e}")
        logger.info("Training new ensemble model with data from training_data.py...")
        train_new_ensemble()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    logger.info("Starting up Blog Content Tagging API v2.0 (Ensemble)...")
    await load_model()
    yield
    # Shutdown
    logger.info("Shutting down Blog Content Tagging API...")

# Initialize FastAPI with lifespan
app = FastAPI(
    title="Blog Content Tagging API - Ensemble Edition", 
    version="2.1.0",
    description="Advanced ensemble model for blog content tagging with LSTM, CNN, GRU, and Random Forest",
    lifespan=lifespan
)

# Add CORS middleware - production-ready configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://127.0.0.1:5001")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Blog Content Tagging API v2.1 (Ensemble) is running!",
        "status": "healthy",
        "model_type": "ensemble",
        "components": ["LSTM", "CNN", "GRU", "Random Forest"],
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.post("/predict", response_model=Dict[str, Any])
async def predict_tags(blog_content: BlogContent):
    """
    Predict tags for blog content using ensemble model
    
    - **title**: Blog post title (recommended 5-50 words)
    - **content**: Blog post content (recommended 50-500 words)
    - **details**: Boolean flag for detailed response with model breakdown (default: False)
    - **threshold**: Minimum confidence threshold for tags (default: 0.25)
    - **top_k**: Maximum number of tags to return (default: 5)
    
    Returns array of predicted topics/tags sorted by relevance score
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Ensemble model not initialized")
    
    try:
        # Validate input lengths - updated for ensemble model
        title_words = len(blog_content.title.split())
        content_words = len(blog_content.content.split())
        
        if title_words > 60:  # Updated limit for ensemble
            raise HTTPException(status_code=400, detail="Title too long (max 60 words)")
        
        if content_words > 600:  # Updated limit for ensemble
            raise HTTPException(status_code=400, detail="Content too long (max 600 words)")
        
        if title_words < 2:
            raise HTTPException(status_code=400, detail="Title too short (min 2 words)")
        
        if content_words < 10:
            raise HTTPException(status_code=400, detail="Content too short (min 10 words)")
        
        # Validate threshold
        if blog_content.threshold < 0.1 or blog_content.threshold > 0.9:
            raise HTTPException(status_code=400, detail="Threshold must be between 0.1 and 0.9")
        
        # Validate top_k
        if blog_content.top_k < 1 or blog_content.top_k > 20:
            raise HTTPException(status_code=400, detail="top_k must be between 1 and 20")
        
        # Get prediction from ensemble
        result = model.predict_ensemble(
            title=blog_content.title, 
            content=blog_content.content, 
            # details=blog_content.details,
            threshold=blog_content.threshold,
            top_k=blog_content.top_k
        )
        
        if blog_content.details:
            return {
                "topics": [tag_info["tag"] for tag_info in result["tags"]],
                "details": result,
                "model_type": "ensemble",
                "threshold_used": blog_content.threshold,
                "top_k_used": blog_content.top_k
            }
        else:
            return {
                "topics": result,
                "model_type": "ensemble",
                "threshold_used": blog_content.threshold,
                "top_k_used": blog_content.top_k
            }
            
    except Exception as e:
        logger.error(f"Ensemble prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    model_health = {
        "model_loaded": model is not None,
        "model_type": "ensemble",
        "ensemble_components": {
            "lstm_model": hasattr(model, 'lstm_model') and model.lstm_model is not None,
            "cnn_model": hasattr(model, 'cnn_model') and model.cnn_model is not None,
            "gru_model": hasattr(model, 'gru_model') and model.gru_model is not None,
            "rf_model": hasattr(model, 'rf_model') and model.rf_model is not None
        } if model else {},
        "preprocessing_components": {
            "tokenizer": hasattr(model, 'tokenizer') and model.tokenizer is not None,
            "mlb": hasattr(model, 'mlb') and model.mlb is not None,
            "tfidf_vectorizer": hasattr(model, 'tfidf_vectorizer') and model.tfidf_vectorizer is not None
        } if model else {}
    }
    
    return {
        "status": "healthy",
        "available_tags": len(model.available_tags if hasattr(model, 'available_tags') else []) if model and model.mlb else 0,
        "training_data_count": len(training_data),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "model_health": model_health,
        "config_loaded": hasattr(model, 'available_tags') and len(model.available_tags) > 0 if model else False
    }

@app.get("/tags")
async def get_available_tags():
    """Get all available tags that the ensemble model can predict"""
    if model is None or model.mlb is None:
        raise HTTPException(status_code=500, detail="Ensemble model not initialized")
    
    return {
        "available_tags": model.mlb.classes_.tolist(),
        "total_tags": len(model.mlb.classes_),
        "model_type": "ensemble",
        "all_tags": model.available_tags if hasattr(model, 'available_tags') else [],
        "preprocessing_mappings": len(model.word_to_tag_mappings) if hasattr(model, 'word_to_tag_mappings') else 0
    }

@app.post("/retrain")
async def retrain_ensemble():
    """Retrain the ensemble model with data from training_data.py"""
    try:
        logger.info("Starting ensemble retraining...")
        train_new_ensemble()
        return {
            "message": "Ensemble model retrained successfully!",
            "model_type": "ensemble",
            "components_trained": ["LSTM", "CNN", "GRU", "Random Forest"],
            "total_tags": len(model.mlb.classes_) if model and model.mlb else 0
        }
    except Exception as e:
        logger.error(f"Ensemble retraining failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.get("/training-info")
async def get_training_info():
    """Get comprehensive information about the training data"""
    if not training_data:
        return {"message": "No training data found"}
    
    # Analyze training data
    all_tags = set()
    tag_counts = {}
    
    for item in training_data:
        all_tags.update(item['tags'])
        for tag in item['tags']:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    # Get most common tags
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "total_samples": len(training_data),
        "unique_tags": len(all_tags),
        "most_common_tags": sorted_tags[:20],  # Top 20 most common tags
        "avg_tags_per_sample": round(sum(len(item['tags']) for item in training_data) / len(training_data), 2),
        "avg_title_length": round(sum(len(item['title'].split()) for item in training_data) / len(training_data), 2),
        "avg_content_length": round(sum(len(item['content'].split()) for item in training_data) / len(training_data), 2),
        "model_type": "ensemble"
    }

@app.get("/model-info")
async def get_model_info():
    """Get detailed information about the ensemble model"""
    if model is None:
        raise HTTPException(status_code=500, detail="Ensemble model not initialized")
    
    return {
        "model_type": "ensemble",
        "components": {
            "lstm": "Bidirectional LSTM with Multi-Head Attention",
            "cnn": "Multi-kernel CNN with Global Max Pooling",
            "gru": "Bidirectional GRU",
            "random_forest": "Multi-Output Random Forest"
        },
        "ensemble_weights": {
            "lstm": 0.3,
            "cnn": 0.25,
            "gru": 0.25,
            "random_forest": 0.2
        },
        "preprocessing_features": [
            "Config-based word-to-tag mappings",
            "Domain-specific pattern recognition",
            "Emoji sentiment analysis",
            "Advanced text cleaning and normalization",
            "TF-IDF vectorization for Random Forest"
        ],
        "model_parameters": {
            "max_words": model.max_words,
            "max_title_len": model.max_title_len,
            "max_content_len": model.max_content_len,
            "embedding_dim": model.embedding_dim
        } if hasattr(model, 'max_words') else {},
        "total_parameters": "~500K+ parameters across all models"
    }

@app.get("/status")
async def get_status():
    """Get comprehensive status information"""
    return {
        "api_version": "2.1.0",
        "model_status": "loaded" if model else "not_loaded",
        "model_type": "ensemble",
        "training_data_available": bool(training_data),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "python_version": sys.version,
        "available_endpoints": [
            "/", "/predict", "/health", "/tags", "/retrain", 
            "/training-info", "/model-info", "/status"
        ],
        "ensemble_status": {
            "lstm_ready": hasattr(model, 'lstm_model') and model.lstm_model is not None,
            "cnn_ready": hasattr(model, 'cnn_model') and model.cnn_model is not None,
            "gru_ready": hasattr(model, 'gru_model') and model.gru_model is not None,
            "rf_ready": hasattr(model, 'rf_model') and model.rf_model is not None
        } if model else {}
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Endpoint not found", "status_code": 404}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {str(exc)}")
    return {"error": "Internal server error", "status_code": 500}

if __name__ == "__main__":
    # Get environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    environment = os.getenv("ENVIRONMENT", "development")
    
    # Configure uvicorn based on environment
    if environment == "production":
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            workers=1,
            log_level="info",
            access_log=True
        )
    else:
        uvicorn.run(
            app,
            host=host,
            port=port,
            reload=True,
            log_level="debug"
        )
