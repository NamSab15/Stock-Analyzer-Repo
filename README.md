# QuantSight

QuantSight is a full-stack analytics platform for Indian financial markets, offering real-time stock visualization, sentiment evaluation, predictive modeling, and configurable alerting. It is designed with a modular architecture enabling scalable data processing and future machine-learning extensions.

## Key Features

### Frontend
- Real-time price and candlestick charting
- News and sentiment analysis panels
- Prediction evaluation interface
- Search and watchlist functionality
- Secure JWT-based authentication

### Backend
- REST API built using Node.js and Express
- Modular service-oriented architecture (SOA)
- WebSocket-based live updates
- Integrated sentiment, prediction, and alert services
- MongoDB persistence via Mongoose ORM

## System Architecture

Client (React + Vite + Tailwind) 
        |
        | HTTPS / WebSocket
        |
Backend API (Node.js + Express)
        |
  -------------------------------------------------------------
  |            |                |                 |            |
Auth Service   Stock Service   Prediction Service  Sentiment   Alert Service
                                                   Service
        |
Database (MongoDB via Mongoose)
        |
External APIs (ML engines / News / Sentiment Providers)

## Technology Stack

| Category | Technologies |
|----------|-------------|
| Frontend | React, Vite, TailwindCSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Realtime | WebSockets |
| Deployment | Docker, Docker Compose |
| Testing | Vitest, Jest, Testing Library |
| Authentication | JWT |

## Project Structure

/
│── backend/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── server.js
│
│── frontend/
│   ├── src/components
│   ├── src/pages
│   ├── src/context
│   └── main.jsx
│
│── docker-compose.yml
│── README.md

## Local Development Instructions

Backend:
cd backend
npm install
npm run dev

Frontend:
cd frontend
npm install
npm run dev

## Environment Variables (backend)

MONGO_URI=mongodb://mongo:27017/stocks
JWT_SECRET=example_secret
NEWS_API_KEY=your_news_api

## Docker Deployment

docker-compose up --build

## API Overview

| Endpoint | Description |
|---------|-------------|
| POST /api/auth/login | Authenticate user |
| POST /api/auth/register | Register new user |
| GET /api/stocks/ | List of stocks |
| GET /api/stocks/:symbol | Stock details |
| GET /api/sentiment/:symbol | Sentiment data |
| GET /api/predict/:symbol | Prediction result |
| POST /api/alerts | Configure alerts |

## Testing

npm test

## Planned Enhancements

- Historical performance backtesting
- Portfolio performance and capital tracking
- Email / Telegram notification support
- ML training dashboard
- Mobile application support

## Author

Naman Saboo
GitHub: https://github.com/NamSab15
Email: namsab15@gmail.com
