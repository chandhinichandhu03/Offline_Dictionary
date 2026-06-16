from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database.seed import seed_all
from app.ml.train import load_all_models
from app.routes import auth, dictionary, sentence, favorites, history, dashboard, quiz, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: seed database and load ML models
    print("\n🚀 Starting LexiLearn Backend...")
    seed_all()
    load_all_models()
    print("✅ LexiLearn Backend ready!\n")
    yield
    # Shutdown
    print("\n👋 Shutting down LexiLearn Backend...")


app = FastAPI(
    title="LexiLearn API",
    description="Offline Dictionary & Language Learning Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ─────────────────────────────────────────
# Must be added BEFORE any other middleware.
# List every origin variant the browser might send.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# ── Explicit OPTIONS handler for preflight requests ─────────
# Starlette's CORSMiddleware can return 400 for OPTIONS when
# the route doesn't exist yet. This catch-all OPTIONS route
# ensures all preflight requests always get a 200 response.
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        content={},
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        },
    )


# Mount routers
app.include_router(auth.router)
app.include_router(dictionary.router)
app.include_router(sentence.router)
app.include_router(favorites.router)
app.include_router(history.router)
app.include_router(dashboard.router)
app.include_router(quiz.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "name": "LexiLearn API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}
