# 🌌 Quantified Self: Your Personal Transcendence Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Stack: Next.js 15](https://img.shields.io/badge/Stack-Next.js%2015-black)](https://nextjs.org/)
[![Database: Firebase](https://img.shields.io/badge/Database-Firebase-orange)](https://firebase.google.com/)

**Quantified Self** is a high-performance, personalized productivity dashboard designed for the modern "Commander." Track your habits, manage complex missions, and visualize your progress with a premium, glassmorphic interface.

![Quantified Self Dashboard](https://github.com/Dev-Santo44/habit-tracker/raw/main/public/dashboard.png)

## 🚀 Features

- **Mission Control**: Drag-and-drop Kanban board for multi-stage objectives.
- **Transcendence Tracking**: Daily habit monitoring with real-time consistency metrics.
- **Mission Planner**: Schedule future objectives across the synchronization cycle.
- **Neural Analytics**: Deep dive into behavior patterns and performance trends.
- **Premium UI**: Glassmorphic design with animated mesh gradients and particle effects.
- **Multi-User**: Fully authenticated and isolated data storage via Firebase.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Animations**: Framer Motion, Canvas API
- **Backend/DB**: Firebase Firestore, Firebase Auth
- **Deployment**: Optimized for Google Cloud Run (Dockerized)

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+
- A Firebase Project

### 2. Installation
```bash
git clone https://github.com/Dev-Santo44/habit-tracker.git
cd quantified-self
npm install
```

### 3. Environment Setup
Create a `.env.local` file with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Deploy Local Environment
```bash
npm run dev
```

## 🚢 Deployment (Cloud Run)
The project is container-optimized. Build and deploy using `gcloud`:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/quantified-self
gcloud run deploy quantified-self --image gcr.io/YOUR_PROJECT_ID/quantified-self
```

## 🤝 Contributing
Contributions are the fuel for this mission! Check out [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

## 📜 License
Available under the [MIT License](./LICENSE).

---
*Optimizing the self, one habit at a time.*
