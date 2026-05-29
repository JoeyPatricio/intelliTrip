# intelliTrip

AI-assisted travel planner with a React frontend and Express backend. The backend now uses **Ollama only** for itinerary generation.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- AI Provider: Ollama (`http://localhost:11434`)
- Places API: OpenStreetMap Nominatim (free, open-source)

## Setup

### Prerequisites

- Node.js 18+
- [Ollama](https://ollama.com/) running locally
- A pulled Ollama model (example: `ollama pull llama3.2:3b`)

### Backend

1. `cd backend`
2. `npm install`
3. Create `backend/.env`:
   ```
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=llama3.2:3b
   PORT=4000
   ```
4. `npm run dev`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## API

- `POST /api/itinerary` generate itinerary
- `GET /api/ping` health check
- `GET /api/debug` current Ollama model/config

Example response includes:

- `itinerary`
- `source: "ollama"`
- `totalPrice`, `flightPrice`, `hotelPerNight`, `totalHotel`
- `debug` metadata
