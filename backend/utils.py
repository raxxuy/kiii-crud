from sqlmodel import Session, select
from .models import ColorWheelEntries
from .db import engine

DEFAULT_COLORS = [
    "#000000",  # black
    "#FFFFFF",  # white
    "#FF0000",  # red
    "#0000FF",  # blue
    "#FFFF00",  # yellow
    "#FFA500",  # orange
    "#008000",  # green
    "#800080",  # purple
]


def create_default_colors():
    with Session(engine) as session:
        for hex_code in DEFAULT_COLORS:
            exists = session.exec(
                select(ColorWheelEntries).where(ColorWheelEntries.hex == hex_code)
            ).first()
            if not exists:
                session.add(ColorWheelEntries(hex=hex_code, removable=False))
        session.commit()
