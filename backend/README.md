# 🎧 Music Manager SaaS

A full-stack SaaS application that allows users to **convert playlists across platforms (Spotify → YouTube)** using a **scalable async processing system** with real-time progress tracking and failure recovery.

---

## 🚀 Live Status

🟡 Backend: **Production-ready**
🟡 Frontend: **Core flows complete (Dashboard, Playlists, Conversions)**
🟢 Conversion Pipeline: **Working end-to-end**
🟡 Retry System: **In progress**

---

## ✨ Features

### 🔐 Authentication & Accounts

* JWT-based authentication
* Spotify OAuth integration
* YouTube OAuth integration
* Multi-platform account linking

---

### 🎵 Playlist Management

* Fetch user playlists from Spotify
* Normalize playlist data for cross-platform compatibility
* View playlists in dashboard UI

---

### 🔄 Playlist Conversion (Core Feature)

* Convert Spotify playlists → YouTube playlists
* Track conversion progress in real-time
* Store converted playlist metadata

---

### ⚙️ Async Job Processing (Core Engineering)

* Queue-based architecture using BullMQ + Redis
* Worker processes for background conversion
* Parallel track processing for performance
* Status tracking: `pending → processing → completed/failed`

---

### 📊 Progress Tracking

* Tracks:

  * total songs
  * successfully converted
  * failed conversions
* Live progress updates in UI
* Conversion status APIs

---

### ❌ Failure Handling

* Track-level failure detection
* Error logging per track
* Partial success support (system doesn’t crash on failure)

---

### 🔁 Retry System (In Progress)

* Retry only failed tracks (not full playlist)
* Backend logic implemented
* Frontend retry buttons integrated
* Worker optimization ongoing

---

## 🧠 System Design Overview

```text
User Action → API → Queue → Worker → External APIs → DB → UI अपडेट
```

### Flow:

1. User starts conversion
2. Backend creates a job
3. Job is pushed to queue
4. Worker processes tracks asynchronously
5. Results stored in DB
6. Frontend polls for progress

---

## 🏗️ Tech Stack

### Backend

* Node.js + Express
* MongoDB + Mongoose
* BullMQ (Queue system)
* Redis (Job processing)
* Spotify Web API
* YouTube Data API

### Frontend

* Next.js (App Router)
* Axios
* Tailwind CSS

---

## 📁 Project Structure

```text
backend/
  controllers/
  models/
  routes/
  services/
  queues/
  workers/
  utils/

music-manager-frontend/
  app/
    dashboard/
    playlists/
    conversions/
```

---

## ⚡ Key Engineering Highlights

* Designed **async job pipeline** instead of blocking APIs
* Implemented **fault-tolerant system** with partial success handling
* Built **retry mechanism for failed tasks**
* Optimized conversion using **parallel processing**
* Structured backend using **service-layer architecture**

---

## 📊 Current Progress

### ✅ Completed

* Spotify OAuth
* YouTube OAuth
* Playlist fetching
* Playlist conversion engine
* Async queue + worker system
* Conversion tracking APIs
* Frontend dashboard & conversions UI

### 🚧 In Progress

* Retry system optimization
* Improved error handling & recovery
* UI polish and UX improvements

### 🔜 Planned

* WebSockets (real-time updates instead of polling)
* Better track matching (ISRC + fuzzy search)
* Rate limit handling (YouTube API quota)
* Deployment (Docker + cloud)

---

## 🧪 Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd music-manager-frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in backend:

```env
MONGO_URI=
JWT_SECRET=

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=

YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=

REDIS_URL=
```

---

## 🎯 What This Project Demonstrates

This project is not just CRUD — it demonstrates:

* Async system design
* External API integration
* Fault tolerance & retry logic
* Scalable backend architecture
* Real-world SaaS thinking

---

## 👨‍💻 Author

Built as part of a focused effort to develop **production-level backend engineering skills** and **full-stack SaaS architecture understanding**.

---
