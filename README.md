# HelpHub

Neighborhood Help Network — connect with trusted neighbors for everyday tasks.

## Structure

```
helphub/
├── backend/    Express + MongoDB API (port 3000)
└── frontend/   SAP UI5 web app (Cordova-ready)
```

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env   # fill in your secrets
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start              # opens at http://localhost:8080
```

## Auth
- Google Sign-In (GIS) — add your `GOOGLE_CLIENT_ID` to `backend/.env` and `frontend/webapp/index.html`
- Facebook Login — add your `FACEBOOK_APP_ID` to `frontend/webapp/index.html`
- JWT issued after successful OAuth, stored in `sessionStorage`
