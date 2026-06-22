# 📖 LexiLearn — Offline Dictionary & Language Assistant

LexiLearn is a full-stack vocabulary learning and grammar assistant, powered by a FastAPI backend (running on port 8000) and a Vite + React frontend (running on port 5173).

---

## ⚡ Quick Start (Automated)

The project includes pre-configured startup scripts that free up ports, launch the backend in the background, and start the frontend development server.

### 🍎 macOS & Linux
Open your terminal in the project root directory and run:
```bash
chmod +x start.sh
./start.sh
```

### 🪟 Windows
Open Command Prompt (cmd) or PowerShell in the project root directory and run:
```cmd
start.bat
```

---

## 🛠️ Manual Execution

If you prefer to run the frontend and backend services in separate terminal windows, use the commands below.

### 🚀 1. Start the Backend
Open a terminal in the `backend/` directory:

#### **macOS & Linux**
```bash
# Activate virtual environment
source venv/bin/activate

# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### **Windows (Command Prompt)**
```cmd
:: Activate virtual environment
call venv\Scripts\activate.bat

:: Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### **Windows (PowerShell)**
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 🎨 2. Start the Frontend
Open another terminal in the `frontend/` directory and run:
```bash
# Run the Vite dev server
npm run dev
```

---

## 🌐 Project Links & Credentials

Once both servers are running:
* **Frontend UI**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:8000](http://localhost:8000)
* **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 🔑 Default Login Credentials
* **Admin Account**:
  * **Username**: `admin`
  * **Password**: `Admin@123`
* **Demo User Account**:
  * **Username**: `demo`
  * **Password**: `Demo1234!`
