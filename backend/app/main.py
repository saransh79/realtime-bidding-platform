from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine
from app.database import models
from app.routes import auth, auctions, bids
from app.websockets import websocket_routes

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Realtime Bidding Platform API",
    description="A FastAPI backend for a realtime bidding platform with WebSockets",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(auctions.router)
app.include_router(bids.router)
app.include_router(websocket_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Realtime Bidding Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"} 