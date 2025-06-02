from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router

app = FastAPI()

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    # allow_origins=[
    #     "http://localhost:5173",
    #     "http://localhost:3000",
    # ],
    allow_origin_regex=r"https:\/\/patchly-[a-zA-Z0-9-]+\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*", "Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform"],
    expose_headers=["*"]
)

app.include_router(router)
