# CivicTriage AI

AI-powered civic complaint triage with blockchain-backed audit trail.

## The Problem
Cities receive thousands of unstructured complaints daily. Manual triage is slow, opaque, and buries critical issues.

## The Solution
Citizens type complaints in plain language. AI structures them (category, severity, department). Blockchain records them permanently. Admins dispatch on priority.

## Architecture

\`\`\`
Citizen → AI (Groq LLM) → Structured JSON → Blockchain → Admin Dashboard
\`\`\`

## Tech Stack

- **Smart Contract:** Solidity 0.8.20 + Hardhat
- **AI:** Groq (`openai/gpt-oss-120b`)
- **Backend:** FastAPI + Web3.py
- **Frontend:** Next.js 15 + TypeScript + Tailwind

## Features

- AI-powered triage (zero-shot extraction)
- Immutable on-chain audit trail
- Automated citizen rewards (CIVIC tokens)
- Real-time admin dashboard with severity ranking
- Analytics with category breakdown

## Setup

### 1. Smart Contract
\`\`\`bash
cd contracts
npm install
npx hardhat node                          # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2
\`\`\`

### 2. Backend
\`\`\`bash
cd backend
python -m venv venv
source venv/Scripts/activate              # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000     # Terminal 2
\`\`\`

### 3. Frontend
\`\`\`bash
cd frontend
npm install
npm run dev                               # Terminal 3
\`\`\`

Open http://localhost:3000

### Environment Variables

Create `backend/.env`:
\`\`\`
GROQ_API_KEY=your_key_here
PRIVATE_KEY=0x...
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...
\`\`\`

## Demo

Live demo: [Add link to video]

## Built For

OFFGRID Hackathon | Manipal University Jaipur
\`\`\`

**Save it**, then:

```bash
git add README.md
git commit -m "Add project README"
git push
