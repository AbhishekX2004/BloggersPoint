# Blog Website - Powered by AI  
> By - Abhishek Verma

## Description  
An online blogging platform enhanced with AI capabilities. Users can generate AI-powered images and receive assistance in writing or refining their blog content.

---

## Tech Stack

### AI Tools
- **GenAI via Amazon Bedrock** — for image generation and content assistance (limited to 2 images per day).

### Frontend
- ReactJS  
- Vite  
- Axios  
- Framer Motion  
- Tailwind CSS

### Backend
- NodeJS  
- ExpressJS  
- AWS Services

### Database
- DynamoDB

### Version Control
- Git

---

## Authentication
- Google OAuth login via **Amazon Cognito**.
- User sessions persist, and login activity updates a `lastlogin` field daily, only if the current date differs from the stored one.

---

## User Profile Schema

Each user document in the `Users` collection will contain:
- `uid`  
- `name`  
- `profilePictureURL` (stored in S3, linked in DB)  
- `email`  
- `phoneNumber`  
- `createdAt`  
- `lastlogin` (updates once per day)  
- Subcollection: `blogs`  
  - Each blog's document ID is its `blogid`.

---

## Blog Schema

Main `BlogPosts` collection:
- `blogid`  
- `title`  
- `authorName`  
- `uid`  
- `blog_tags` (array)
- `timestamp`  
- `content`  
- `picturesURL` (array)

Subcollection inside each blog:
- `comments`  
  - Each comment's document ID is its `cid`.

---

## Comments Schema

`Comments` collection (global):
- `cid`  
- `name`  
- `comment`  
- `timestamp`

---

## AI Capabilities

Using Amazon Bedrock (GenAI):
- Generate up to 2 images/day per user via prompts.  
- Enhance or auto-write blog content based on user-provided context.

---

## Features
- Seamless login with Google using Cognito  
- Blog creation, editing, and deletion  
- Commenting system  
- AI-assisted image generation and content improvement  
- Fully responsive and animated frontend with Framer Motion & Tailwind  
- Fast Vite-based development with modular components  
- Data stored in DynamoDB with optimized schema design

---

## File Structure
```
BlowWebsite/
|-- client/
|	|-- public/
|	|-- src/
|	|	|-- assets/
|	|	|-- pages/
|	|	|-- components/
|	|	|-- services/
|	|	|-- App.css
|	|	|-- App.jsx
|	|	|-- index.css
|	|	|-- main.jsx
|	|-- index.html
|-- server/
|	|-- routes/
|	|	|-- ai.js
|	|	|-- posts.js
|	|	|-- comments.js
|	|-- utils/
|	|	|-- bedrockClient.js
|	|-- .env
|	|-- index.js

```