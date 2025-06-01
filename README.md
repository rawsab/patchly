# Patchly | Remote Codebase Auditor

A tool to audit codebases for known vulnerabilities, hassle-free.

![PatchlyDemo](https://github.com/user-attachments/assets/193ed58d-b57c-47c6-894f-50838a5c9c8f)

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
python api/main.py
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
