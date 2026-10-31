from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class StationOut(ORMModel):
    id: str
    name: str
    location: str
    latitude: float
    longitude: float
    coverage_area: str
    active: bool
    value: float | None = None
    recorded_at: datetime | None = None
    status: str


class ReadingCreate(BaseModel):
    id: str = Field(min_length=1, max_length=32)
    station_id: str = Field(min_length=1, max_length=32)
    value: float | None = Field(default=None, ge=0, le=1000)
    recorded_at: datetime
    source: str = Field(default="sensor feed", max_length=160)


class SettingsUpdate(BaseModel):
    region: str = Field(min_length=1, max_length=80)
    time_zone: str = Field(min_length=1, max_length=80)
    anomaly_alerts: bool
    coverage_alerts: bool
    data_quality_alerts: bool
    email_notifications: bool
    compact_cards: bool
    show_station_ids: bool


class AnomalyReview(BaseModel):
    status: str = Field(pattern="^(Under investigation|Reviewed|Awaiting review)$")
    reviewer_note: str | None = Field(default=None, max_length=2000)


class IntegrityStatusUpdate(BaseModel):
    status: str = Field(pattern="^(Passed|Warning|Failed)$")


class AnalyzeRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    reading_id: str | None = None
