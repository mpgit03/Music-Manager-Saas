# Music Manager SaaS

Production-style full-stack SaaS application that enables seamless playlist transfer across music platforms like **Spotify** and **YouTube Music** using secure OAuth integrations, asynchronous job processing, and scalable backend architecture.

---

# Live Demo

🚀 Deployed Application:  
https://music-manager-saas.vercel.app/

---

# Features

- Spotify OAuth Integration
- YouTube OAuth Integration
- Playlist Fetching & Normalization
- Spotify → YouTube Playlist Conversion
- Async Conversion Queue using BullMQ + Redis
- Real-time Conversion Progress Tracking
- Retry Failed Tracks
- OAuth Reconnect Flow
- Partial Success Handling
- Scalable Backend Architecture
- Production-style Error Handling
- Responsive Modern UI
- Secure JWT Authentication

---

# Tech Stack

## Frontend

- Next.js
- React
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- BullMQ

## APIs & Integrations

- Spotify Web API
- YouTube Data API

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# Architecture Highlights

## OAuth-Based Multi-Platform Integration

Implemented secure OAuth 2.0 authentication flows for both Spotify and YouTube, including token exchange, refresh handling, and account linking workflows.

---

## Asynchronous Job Processing

Designed a scalable background job system using Redis and BullMQ to process large playlist conversions without blocking API requests.

---

## Retry & Recovery Pipeline

Built a resilient retry mechanism supporting:

- failed-track recovery
- exponential backoff
- quota failure handling
- OAuth reconnect flows
- partial-success conversion states

---

## Track Normalization System

Implemented normalization pipelines using:

- ISRC metadata mapping
- artist/title matching
- parallel processing with Promise.all

to improve cross-platform song matching reliability.

---

## Production-Style Backend Design

Structured the backend with:

- modular controllers/services
- reusable middleware
- centralized async error handling
- scalable API organization
- protected routes and JWT auth

---

# Folder Structure

```txt
music-manager/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── workers/
│   ├── queues/
│   ├── middleware/
│   └── utils/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
│
└── README.md
```

---

# Environment Variables

## Backend `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET_KEY=your_secret
JWT_EXPIRES_IN=7d

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
SPOTIFY_REDIRECT_URI=your_spotify_redirect

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_REDIRECT_URI=your_google_redirect

YOUTUBE_API_KEY=your_youtube_api_key

REDIS_URL=your_redis_url

FRONTEND_URL=http://localhost:3000
```

---

## Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

# Local Development Setup

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/music-manager.git
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 4. Start Backend

```bash
npm run dev
```

---

## 5. Start Frontend

```bash
npm run dev
```

---

# Key Engineering Challenges Solved

- Handling YouTube API quota failures gracefully
- Designing retry-safe async conversion jobs
- Managing OAuth token expiration and reconnect flows
- Building scalable queue-worker architecture
- Cross-platform track matching reliability
- Partial conversion recovery
- Parallel processing optimization

---

# Future Improvements

- Apple Music Integration
- Playlist Syncing
- Real-time WebSocket Updates
- User Analytics Dashboard
- Collaborative Playlist Support
- Dockerized Deployment
- CI/CD Pipelines

---

# Author

## Marut Panwar

- GitHub: https://github.com/mpgit03
- LinkedIn: https://www.linkedin.com/in/MarutPanwar