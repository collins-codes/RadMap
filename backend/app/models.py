from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class Station(Base):
    __tablename__ = "stations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    coverage_area: Mapped[str] = mapped_column(String(120), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    readings: Mapped[list["Reading"]] = relationship(back_populates="station")


class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    station_id: Mapped[str] = mapped_column(ForeignKey("stations.id"), nullable=False, index=True)
    value: Mapped[float | None] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(160), default="sensor feed", nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    station: Mapped[Station] = relationship(back_populates="readings")
    anomaly: Mapped["Anomaly | None"] = relationship(back_populates="reading", uselist=False)


class Anomaly(Base):
    __tablename__ = "anomalies"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    reading_id: Mapped[str] = mapped_column(ForeignKey("readings.id"), nullable=False, unique=True)
    baseline: Mapped[float] = mapped_column(Float, nullable=False)
    deviation_percent: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="Awaiting review", nullable=False)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reviewer_note: Mapped[str | None] = mapped_column(Text)
    reading: Mapped[Reading] = relationship(back_populates="anomaly")


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    reading_id: Mapped[str] = mapped_column(ForeignKey("readings.id"), nullable=False)
    anomaly_id: Mapped[str | None] = mapped_column(ForeignKey("anomalies.id"))
    source: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="Under review", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    reading: Mapped[Reading] = relationship()


class WorkspaceSettings(Base):
    __tablename__ = "workspace_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    region: Mapped[str] = mapped_column(String(80), default="East Africa", nullable=False)
    time_zone: Mapped[str] = mapped_column(String(80), default="Africa/Nairobi", nullable=False)
    anomaly_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    coverage_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    data_quality_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    compact_cards: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_station_ids: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class IntegrityCheck(Base):
    __tablename__ = "integrity_checks"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Passed", nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    #systems 
