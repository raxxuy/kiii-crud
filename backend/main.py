from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlmodel import Session
from .db import init_db, get_session
from .models import ColorWheelEntries, SelectedColors


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.post("/add_color/")
def add_color(entry: ColorWheelEntries, session: Session = Depends(get_session)):
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry
