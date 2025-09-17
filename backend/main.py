from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from .models import ColorWheelEntries, SelectedColors
from .db import init_db, get_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/selected-colors/", response_model=list[SelectedColors])
def get_selected_colors(session: Session = Depends(get_session)):
    colors = session.exec(select(SelectedColors)).all()
    return colors
