# 🧾 Product Requirement Doc – Codebase Security Auditor (End-to-End System)

---

## 🎯 Objective

Build a full-stack developer tool that scans public GitHub repositories for vulnerable dependencies using CLI tools (like pip-audit, osv-scanner, etc.), explains the CVEs using OpenAI LLMs, and optionally suggests patches. The system should be fast, lightweight, and deployable via Docker.

---

## 🧱 Development Steps (End-to-End)

### ✅ Phase 1: Scanning Engine & CVE Normalization

1. Set up `pip-audit`, `npm audit`, and/or `osv-scanner` CLI tools locally or in Docker.
2. Write Python wrappers to execute each scanner and parse their JSON output.
3. Normalize all outputs to a unified CVE schema:
   ```json
   {
     "cve_id": "CVE-2023-1234",
     "package": "requests",
     "version": "2.19.1",
     "severity": "HIGH",
     "description": "...",
     "references": ["..."]
   }
   ```

---

### ✅ Phase 2: LLM Integration

4. Write reusable GPT prompts to explain CVEs and suggest dependency upgrades.
5. Connect to the OpenAI API (`gpt-4-turbo`).
6. Accept user-provided API key (optional), or fallback to a rate-limited server key.

---

### ✅ Phase 3: Backend (FastAPI)

7. Build REST API endpoints:
   - `POST /scan` — accepts GitHub URL, runs scanner
   - `POST /explain` — takes CVE data, returns GPT explanations
   - `GET /health` — health check route
8. Clone GitHub repo (sanitize input, use `git clone`)
9. Detect project language based on file presence (`requirements.txt`, `package.json`, etc.)
10. Run appropriate scanner and return results to frontend.

---

### ✅ Phase 4: Frontend (Optional UI)

11. Build a React or Streamlit UI with:
   - GitHub URL input
   - Optional API key input
   - Results: CVE table, expandable explanations, patch suggestions
12. Connect frontend to backend with fetch or Axios.
13. Display GPT output with loading and error handling.

---

### ✅ Phase 5: Dockerization & Deployment

14. Write a Dockerfile to containerize the FastAPI app and scanner tools.
15. Use `.env` to handle API keys securely.
16. Deploy to **Render**, **Railway**, or **Fly.io** (EC2 optional).
17. Enable health checks and cleanup scripts for temp directories.

---

## 🧠 System Design Overview

### 📦 High-Level Architecture

```
User → Web UI/CLI
      ↓
   FastAPI Backend (Docker)
      ↓
[ Repo Cloner ]
      ↓
[ Language Detector ]
      ↓
[ CLI Scanner (pip-audit / osv) ]
      ↓
[ CVE Parser + Normalizer ]
      ↓
[ OpenAI LLM Explainer ]
      ↓
Final JSON Report → returned to user
```

---

### 🔧 Backend Module Overview

| Module              | Responsibility                                |
|---------------------|------------------------------------------------|
| `repo_manager.py`   | Clones GitHub repo to temp dir                |
| `scanner_router.py` | Runs the correct scanner based on language     |
| `cve_parser.py`     | Normalizes scanner output                      |
| `llm_explainer.py`  | Sends CVEs to OpenAI API                       |
| `routes.py`         | FastAPI endpoint logic                         |
| `utils/cleanup.py`  | Removes temp files and folders                 |

---

### 📂 Project Structure

```
codebase-security-auditor/
├── api/
│   ├── main.py
│   ├── routes.py
│   ├── scanner_router.py
│   ├── llm_explainer.py
│   └── utils/
│       ├── repo_manager.py
│       ├── cve_parser.py
│       ├── cleanup.py
├── frontend/ (optional)
├── Dockerfile
├── .env.example
├── requirements.txt
└── README.md
```

---

### 🐳 Docker Highlights

- Base image: `python:3.11-slim`
- Tools installed: `pip-audit`, `osv-scanner`, `openai`, `fastapi`, `uvicorn`
- CMD: `uvicorn api.main:app --host 0.0.0.0 --port 8000`
- Expose port `8000`

---

## 🔚 Deliverables

- FastAPI backend with `/scan` route
- JSON report with GPT-enhanced CVE explanations
- Optional: UI with GitHub URL input + result display
- Dockerized deployment-ready build