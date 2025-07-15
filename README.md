# Patchly

![Patchly_Demo](https://github.com/user-attachments/assets/7cd6c59d-74a4-47ed-a9cf-95aa34ec160b)

## About this Project

Patchly is an AI-augmented vulnerability scanner that analyzes public GitHub repositories for known security issues in real-time. Built for new developers, early-stage prototyping, and educational purposes, Patchly automates the end-to-end process of dependency scanning, CVE detection, and fix recommendation by leveraging the latest CVE databases and LLM technology.

[Patchly - Video Demo](https://www.youtube.com/watch?v=69KOlBW8sSY)

### Features
- Real-time framework based vulnerability scanning
- Context-aware fix generation using GPT-4
- Simple and interactive CVE dashboard with filters
- Fully automated repo cloning and clean up
- CORS handling, rate limiting and cache management

### Technologies
Built with Python & FastAPI for backend scanning logic and dependency parsing, and Next.js (React, TypeScript, TailwindCSS) for an interactive frontend interface. Project deployed on Vercel + Render.


## Try It Out!

[patchly-nu.vercel.app](patchly-nu.vercel.app)


## Local Installation

1. Clone the repository:

```bash
git clone https://github.com/rawsab/patchly.git
cd patchly
```

2. Set up the Python backend:

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

3. Set up the frontend:

```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:

```bash
# From the root directory
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn api.main:app --reload
```

2. Start the frontend development server:

```bash
# From the frontend directory
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000


## Planned Features

- Deep scanning option with OWASP Dependency Check
- Extended support for C/C++, Dart, PHP, Rust, Ruby
- Generating command line batch fixes
- Adaptive UI (for mobile devices)
