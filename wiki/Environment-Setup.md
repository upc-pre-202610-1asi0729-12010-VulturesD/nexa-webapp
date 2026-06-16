# Environment Setup

Getting the Nexa WebApp running locally is straightforward.

## 1. Prerequisites
- Ensure you have **Node.js v18** or newer installed.

## 2. Dev Environment Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.development` file in the root folder with:
   ```env
   VITE_CORE_BACKEND_ENABLED=true
   VITE_NEXA_API_BASE_URL=http://localhost:5068/api/v1
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The WebApp will start on `http://localhost:5173/`.*

## 3. Production Deployment Notes
Nexa WebApp is configured for static site deployment and is currently hosted live on **Render** at:
`https://nexa-webapp.onrender.com/`

---

<p align="center">
  [Home](Home.md) · [Project Overview](Project-Overview.md) · [Architecture](Frontend-Architecture.md) · [Development Workflow](Branching-and-Commits.md) · [Quality & Security](Quality-and-Security.md)
</p>
