from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, dashboard, batches, stations, workers, voice, analytics

app = FastAPI(
    title="Production Visibility System",
    description="Real-time production monitoring for Lakshmi Food Products",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(batches.router, prefix="/api/batches", tags=["Batches"])
app.include_router(stations.router, prefix="/api/stations", tags=["Stations"])
app.include_router(workers.router, prefix="/api/workers", tags=["Workers"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice Commands"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def read_root():
    return {
        "message": "Production Visibility System API",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}