## Trackzy

Trackzy is a cross-platform expense tracking app that helps users manage spending across multiple ledgers and add expenses through both manual entry and voice commands.

## Overview

This repository contains:
- a FastAPI backend for expense, ledger, user, and voice processing
- an Expo/React Native mobile app for the user experience

The app is designed around a simple workflow:
1. Create or select a ledger
2. Add expenses manually or by speaking naturally
3. Review summaries and category breakdowns

## Key features

- Multi-ledger expense organization
- Manual expense CRUD operations
- Voice-driven expense parsing using Whisper and an LLM
- Expense summaries for common periods such as today, this week, this month, and last month
- Firebase-based authentication flow
- PostgreSQL-backed persistence

## Tech stack

### Backend
- Python 3.11+
- FastAPI
- SQLModel + SQLAlchemy
- Async PostgreSQL support
- Firebase Admin SDK for auth verification
- Groq Whisper + Groq LLM for voice intent parsing

### Mobile
- React Native
- Expo
- Expo Router
- TypeScript

## Project structure

- [backend/](backend/) – FastAPI API, database layer, services, and routers
- [mobile/](mobile/) – Expo React Native app
- [.env.example](.env.example) – environment variable template

## Prerequisites

Before running the app, make sure you have:
- Python 3.11 or newer
- Node.js 18+ and npm
- A PostgreSQL database
- A Groq API key
- Firebase service account credentials

## Environment setup

1. Copy [.env.example](.env.example) to a `.env` file.
2. Fill in the required values:
   - `GROQ_API_KEY`
   - `DATABASE_URL`
   - `GOOGLE_APPLICATION_CREDENTIALS`
   - `FIREBASE_SERVICE_ACCOUNT`
   - optional `ENV` and `ALLOWED_ORIGINS`

> Note: the backend loads configuration from environment variables at startup. If you run the API from the [backend/](backend/) directory, place the `.env` file there or export the values in your shell.

## Running the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at:
- http://localhost:8000/health
- http://localhost:8000/docs (development mode)

## Running the mobile app

```bash
cd mobile
npm install
npx expo start
```

From there you can launch the app in an emulator, simulator, or on a physical device.

## API highlights

The backend exposes routes for:
- user registration and profile management under `/users`
- ledger management under `/ledgers`
- expense CRUD and summaries under `/ledgers/{ledger_id}/expenses`
- voice parsing and intent execution under `/voice`

## License

This project is currently unlicensed.
