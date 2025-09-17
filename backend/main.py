from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .models import ColorWheelEntries, SelectedColors
from .utils import create_default_colors
from .db import init_db, get_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    create_default_colors()
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


@app.get("/color-wheel/", response_model=list[ColorWheelEntries])
def get_color_wheel(session: Session = Depends(get_session)):
    color_wheel_entries = session.exec(select(ColorWheelEntries)).all()
    return color_wheel_entries


@app.post("/color-wheel/", response_model=ColorWheelEntries)
def add_color_wheel_entry(
    entry: ColorWheelEntries, session: Session = Depends(get_session)
):
    # Prevent duplicates
    exists = session.exec(
        select(ColorWheelEntries).where(ColorWheelEntries.hex == entry.hex)
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Color already in wheel")

    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@app.delete("/color-wheel/{entry_id}")
def remove_color_wheel_entry(entry_id: int, session: Session = Depends(get_session)):
    entry = session.get(ColorWheelEntries, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Color not found")
    if not entry.removable:
        raise HTTPException(status_code=403, detail="This color cannot be removed")
    session.delete(entry)
    session.commit()
    return {"ok": True}


@app.get("/selected-colors/", response_model=list[SelectedColors])
def get_selected_colors(session: Session = Depends(get_session)):
    colors = session.exec(select(SelectedColors)).all()
    return colors


@app.post("/selected-colors/", response_model=SelectedColors)
def add_selected_color(color: SelectedColors, session: Session = Depends(get_session)):
    # Prevent duplicates
    exists = session.exec(
        select(SelectedColors).where(SelectedColors.hex == color.hex)
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="Color already selected")

    session.add(color)
    session.commit()
    session.refresh(color)
    return color


@app.delete("/selected-colors/{color_id}")
def remove_selected_color(color_id: int, session: Session = Depends(get_session)):
    color = session.get(SelectedColors, color_id)
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")
    session.delete(color)
    session.commit()
    return {"ok": True}
