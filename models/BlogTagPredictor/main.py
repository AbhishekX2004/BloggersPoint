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
    threshold: Optional[float] = 0.3

class TagPrediction(BaseModel):
    tag: str
    score: float

class DetailedResponse(BaseModel):
    tags: List[TagPrediction]
    keywords: List[str]
    confidence: float
    threshold_used: float

class SimpleResponse(BaseModel):
    topics: List[str]

def train_new_model():
    """Train a new model using data from training_data.py"""
    global model
    
    if not training_data:
        raise ValueError("No training data found in training_data.py!")
    
    # Extract data from training_data.py
    titles = [item['title'] for item in training_data]
    contents = [item['content'] for item in training_data]
    tags_list = [item['tags'] for item in training_data]
    
    logger.info(f"Training with {len(training_data)} samples...")
    logger.info(f"Sample titles: {titles[:3]}")
    
    # Train model with more epochs for better accuracy
    model.train(titles, contents, tags_list, epochs=25)
    
    # Save model
    model.save_model("blog_tagging_model")
    logger.info("New model trained and saved!")

async def load_model():
    """Load or train the model"""
    global model
    model = BlogTaggingModel()
    
    # Try to load existing model
    model_path = "blog_tagging_model"
    if os.path.exists(f"{model_path}_model.keras"):
        try:
            model.load_model(model_path)
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            logger.info("Training new model with data from training_data.py...")
            train_new_model()
    else:
        logger.info("No existing model found. Training new model...")
        train_new_model()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    logger.info("Starting up Blog Content Tagging API...")
    await load_model()
    yield
    # Shutdown
    logger.info("Shutting down Blog Content Tagging API...")

# Initialize FastAPI with lifespan
app = FastAPI(
    title="Blog Content Tagging API", 
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware - more restrictive for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT") == "development" else [
        "https://your-domain.com",
        "https://your-firebase-domain.web.app",
        "https://your-firebase-domain.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Blog Content Tagging API v2.0 is running!",
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.post("/predict", response_model=Dict[str, Any])
async def predict_tags(blog_content: BlogContent):
    """
    Predict tags for blog content with improved model
    
    - **title**: Blog post title (20-30 words recommended)
    - **content**: Blog post content (max 600 words)
    - **details**: Boolean flag for detailed response (default: False)
    - **threshold**: Minimum confidence threshold for tags (default: 0.3)
    
    Returns array of predicted topics/tags sorted by relevance
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    try:
        # Validate input lengths
        if len(blog_content.title.split()) > 50:
            raise HTTPException(status_code=400, detail="Title too long (max 50 words)")
        
        if len(blog_content.content.split()) > 800:
            raise HTTPException(status_code=400, detail="Content too long (max 800 words)")
        
        # Validate threshold
        if blog_content.threshold < 0.1 or blog_content.threshold > 0.9:
            raise HTTPException(status_code=400, detail="Threshold must be between 0.1 and 0.9")
        
        # Get prediction
        result = model.predict(
            blog_content.title, 
            blog_content.content, 
            details=blog_content.details,
            threshold=blog_content.threshold
        )
        
        if blog_content.details:
            return {
                "topics": [tag_info["tag"] for tag_info in result["tags"]],
                "details": result
            }
        else:
            return {"topics": result}
            
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "available_tags": len(model.mlb.classes_) if model and model.mlb else 0,
        "training_data_count": len(training_data),
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/tags")
async def get_available_tags():
    """Get all available tags that the model can predict"""
    if model is None or model.mlb is None:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    return {
        "available_tags": model.mlb.classes_.tolist(),
        "total_tags": len(model.mlb.classes_)
    }

@app.post("/retrain")
async def retrain_model():
    """Retrain the model with data from training_data.py"""
    try:
        train_new_model()
        return {"message": "Model retrained successfully!"}
    except Exception as e:
        logger.error(f"Retraining failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.get("/training-info")
async def get_training_info():
    """Get information about the training data"""
    if not training_data:
        return {"message": "No training data found"}
    
    # Analyze training data
    all_tags = set()
    for item in training_data:
        all_tags.update(item['tags'])
    
    return {
        "total_samples": len(training_data),
        "unique_tags": len(all_tags),
        "sample_tags": list(all_tags)[:20],  # Show first 20 tags
        "avg_tags_per_sample": sum(len(item['tags']) for item in training_data) / len(training_data)
    }

@app.get("/status")
async def get_status():
    """Get detailed status information"""
    return {
        "api_version": "2.0.0",
        "model_status": "loaded" if model else "not_loaded",
        "training_data_available": bool(training_data),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "python_version": sys.version,
        "available_endpoints": [
            "/", "/predict", "/health", "/tags", "/retrain", "/training-info", "/status"
        ]
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