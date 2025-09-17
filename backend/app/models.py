from sqlmodel import SQLModel, Field


class ColorWheelEntries(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hex: str
    removable: bool = Field(default=True)


class SelectedColors(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hex: str
    custom: bool = Field(default=False)
