# ⚔️ CodeBattle Arena v3.0 — T3 Stack Edition

**CodeBattle Arena** is a competitive programming platform featuring real-time 1v1 coding duels, practice modes, and AI-assisted learning. This version (`v3.0`) is a complete rewrite using the **T3 Stack** (Next.js, tRPC, Prisma, Tailwind CSS) for enhanced type safety and performance.

> **Note**: This is the latest iteration of the project, moving away from the Express/Mongoose architecture of v2.0.

## 🎮 Features

### ⚔️ **Arena Mode - Real-Time PvP Battles**
- Live 1v1 coding duels
- Independent player progression
- Smart matchmaking system
- Dynamic scoring with bonus points
- Powered by real-time updates using native Bun WebSockets

### 🤖 **AI-Powered Assistance**
- **Google Gemini Integration**: Real-time code analysis and hints.
- **Smart Suggestions**: Reviews code for errors and improvements users execute it.
- **Hint System**: Provides non-spoiler nudges for stuck users.

### 📚 **Practice Modes**
- **Tiered Difficulty**: Easy, Medium, Hard, and Real-World challenges.
- **Categories**: Arrays, Algorithms, Mathematics, Data Structures.
- **Execution Engine**: Integration with Judge0 via tRPC for secure, sandboxed code execution (C, C++, Java, Python, JavaScript).

### 🏆 **Modern User System**
- **Authentication**: Clerk for seamless identity management.
- **Statistics**: Comprehensive tracking of problems solved, streak, and rank.
- **Leaderboards**: Global rankings by problem count and arena performance.

---

## 🛠️ Tech Stack (The "T3" Stack)

- **Framework**: [Next.js](https://nextjs.org) (React + Server-Side Rendering)
- **Language**: [TypeScript](https://www.typescriptlang.org) (End-to-end type safety)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (Utility-first styling)
- **API**: [tRPC](https://trpc.io) (Type-safe APIs without schemas)
- **Database**: [Prisma](https://prisma.io) (ORM) with MongoDB
- **Auth**: [Clerk](https://clerk.dev)
- **Package Manager**: [Bun](https://bun.sh)

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+) or **Bun** (v1.0+)
- **Git**

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/vikashgupta16/CodeBattle-Arena.git
cd CodeBattle-Arena/v3.0

# Install dependencies
bun install
```

### 3. Environment Setup
Create a `.env` file in the `v3.0` root. You can copy `.env.example` if available.

```env
# Database
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/codigo"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Node Environment
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Push schema to database
bun db:push

# Seed initial problems
bun run prisma/seed.ts
```

### 5. Run Development Server

```bash
bun dev
```

Visit `http://localhost:3000` to see the app.

---

## 📁 Project Structure

```
v3.0/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data script
├── src/
│   ├── env.js           # Environment variable validation
│   ├── app/             # Next.js App Router (Frontend)
│   ├── _components/     # Reusable React components
│   ├── server/          # Backend Logic
│   │   ├── db.ts        # Prisma client instance
│   │   └── api/         # tRPC API
│   │       ├── root.ts  # Root router
│   │       ├── trpc.ts  # Middleware & Context
│   │       └── routers/ # API Endpoints
│   │           ├── user.ts      # User stats & profile
│   │           ├── problem.ts   # Problem management
│   │           ├── arena.ts     # Matchmaking & rooms
│   │           ├── execution.ts # Judge0 execution
│   │           └── ai.ts        # AI service
│   └── styles/          # Global styles (Tailwind)
├── public/              # Static assets
└── package.json         # Dependencies
```

## 📄 License & Authors

**GPL-3.0-or-later** © 2025

**Authors:**
- [Archisman Pal](https://github.com/Dealer-09) - Backend & Architecture
- [Vikash Gupta](https://github.com/vikashgupta16) -  Frontend & UI/UX
