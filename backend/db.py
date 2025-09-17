import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

_ = load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Create the engine
engine = create_engine(DATABASE_URL, echo=True)


def init_db():
    """Create all tables."""
    from . import models

    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency for FastAPI routes."""
    with Session(engine) as session:
        yield session
