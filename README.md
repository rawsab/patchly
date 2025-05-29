# Codebase Security Auditor

A FastAPI backend that scans GitHub repositories for vulnerable dependencies, explains CVEs using LLMs, and suggests patches. See PRD.md for details.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the FastAPI server:**
   ```bash
   uvicorn api.main:app --reload
   ```

3. **Dependency-Check via Docker:**
   - Make sure you have Docker installed and running.
   - The API will use the official OWASP Dependency-Check Docker image to scan repos.

## Usage

- **POST** `/scan`
  - Body: `{ "repo_url": "https://github.com/user/repo" }`
  - Returns: JSON report of CVEs (to be implemented)

## Environment Variables

- See `.env.example` for future API key and token usage. 