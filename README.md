# BloggersPoint
AI powered blogging platform

## Overview 
BloggersPoint is an innovative online blogging platform that leverages various AI technologies to enhance the content creation experience. The platform combines intelligent personalization, automated content assistance, and robust safety measures to create a seamless blogging environment for creators of all levels. 

## Key Features
### Smart Personalization
- **User Profiling**: Intelligent analysis of user preferences and behavior patterns
- **Collaborative Filtering**: Personalized content recommendations based on similar user interests
- **Dynamic Content Discovery**: Tailored blog suggestions to match individual reading preferences

### AI-Powered Content Creation
- **Text-to-Image Generation**: Create stunning visuals from text descriptions using Black Forest FLUX.1-dev
- **Content Enhancement**: AI-assisted grammar correction, tone optimization, and engagement improvement
- **Writing Assistant**: Real-time suggestions to elevate your content quality
- **Smart Tag Generation**: AI-powered ensemble model for intelligent content classification using LSTM, CNN, GRU, and Random Forest algorithms

### Content Safety & Compliance
- **Profanity Detection**: Real-time filtering using KolasAI technology
- **Sentiment Analysis**: Monitor and maintain positive community interactions
- **Content Moderation**: Automated safety checks to ensure platform guidelines compliance

## Technology Stack
### Frontend
- React.js
- Tailwind CSS
- Framer Motion
### Backend
- Node.js
- Express.js
- Firebase - Comprehensive backend services
  - Firestore
  - Firebase Auth
  - Firebase Storage
  - Firebase Hosting
### AI & APIs
- Black Forest FLUX.1-dev - Advanced text-to-image generation
- Gemini Developer API - AI-powered content enhancement
- KolasAI - Real-time profanity and sentiment analysis
- Custom Ensemble Tagging Model served via FastAPI – combines LSTM, GRU, CNN, and Random Forest, delivering good accuracy on multi‑label prediction tasks