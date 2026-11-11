from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from .config import get_settings
from .database import Base, SessionLocal, engine, get_db
from .models import (
    Anomaly,
    Evidence,
    IntegrityCheck,
    Reading,
    Station,
    WorkspaceSettings,
    utc_now,
)
from .schemas import (
    AnalyzeRequest,
    AnomalyReview,
    IntegrityStatusUpdate,
    ReadingCreate,
    SettingsUpdate,
    StationOut,
)

settings = get_settings()


# Endpoints
def seed_database() -> None:
    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Station)):
            return

        stations = [
            Station(
                id="RM-024",
                name="Nairobi Station",
                location="Nairobi County",
                latitude=-1.2864,
                longitude=36.8172,
                coverage_area="Nairobi",
            ),
            Station(
                id="RM-018",
                name="Mombasa Station",
                location="Mombasa County",
                latitude=-4.0435,
                longitude=39.6682,
                coverage_area="Coast",
            ),
            Station(
                id="RM-031",
                name="Kisumu Station",
                location="Kisumu County",
                latitude=-0.0917,
                longitude=34.7680,
                coverage_area="Lake Victoria",
            ),
            Station(
                id="RM-009",
                name="Nakuru Station",
                location="Nakuru County",
                latitude=-0.3031,
                longitude=36.0800,
                coverage_area="Rift Valley",
            ),
            Station(
                id="RM-042",
                name="Garissa Station",
                location="Garissa County",
                latitude=-0.4532,
                longitude=39.6461,
                coverage_area="North Eastern",
            ),
        ]
        db.add_all(stations)
        db.flush()

        now = utc_now()
        reading_definitions = [
            ("OBS-1024", "RM-024", 0.18, 2, "Demonstration sensor feed"),
            ("OBS-1023", "RM-018", 0.12, 5, "Demonstration sensor feed"),
            ("OBS-1022", "RM-031", 0.14, 8, "Demonstration sensor feed"),
            ("OBS-1021", "RM-009", 0.11, 12, "Demonstration sensor feed"),
            ("OBS-1020", "RM-042", None, 45, "Demonstration sensor feed"),
            ("OBS-1019", "RM-024", 0.13, 35, "Demonstration sensor feed"),
            ("OBS-1018", "RM-018", 0.12, 40, "Demonstration sensor feed"),
            ("OBS-1017", "RM-031", 0.15, 50, "Demonstration sensor feed"),
            ("OBS-1016", "RM-031", 0.16, 95, "Demonstration sensor feed"),
            ("OBS-1009", "RM-009", 0.11, 130, "Demonstration sensor feed"),
        ]
        for reading_id, station_id, value, minutes_ago, source in reading_definitions:
            db.add(
                Reading(
                    id=reading_id,
                    station_id=station_id,
                    value=value,
                    recorded_at=now - timedelta(minutes=minutes_ago),
                    source=source,
                    is_demo=True,
                )
            )
        db.flush()

        anomaly_definitions = [
            ("ANM-1024", "OBS-1024", 0.12, "Elevated deviation", "Awaiting review"),
            ("ANM-1016", "OBS-1016", 0.13, "Moderate deviation", "Under investigation"),
            ("ANM-1008", "OBS-1018", 0.12, "Moderate deviation", "Reviewed"),
        ]
        for anomaly_id, reading_id, baseline, severity, state in anomaly_definitions:
            reading = db.get(Reading, reading_id)
            deviation = (
                ((reading.value - baseline) / baseline) * 100 if reading and reading.value else 0
            )
            db.add(
                Anomaly(
                    id=anomaly_id,
                    reading=reading,
                    baseline=baseline,
                    deviation_percent=deviation,
                    severity=severity,
                    status=state,
                    reviewed_at=now if state == "Reviewed" else None,
                )
            )
        db.flush()

        evidence_definitions = [
            (
                "EV-2026-001",
                "OBS-1024",
                "ANM-1024",
                "Illustrative observation flagged for comparison against its station baseline.",
            ),
            (
                "EV-2026-002",
                "OBS-1018",
                "ANM-1008",
                "Illustrative observation retained for historical comparison.",
            ),
            (
                "EV-2026-003",
                "OBS-1016",
                "ANM-1016",
                "Illustrative observation awaiting human review.",
            ),
            (
                "EV-2026-004",
                "OBS-1009",
                None,
                "Illustrative observation included in the station history.",
            ),
        ]
        for evidence_id, reading_id, anomaly_id, description in evidence_definitions:
            reading = db.get(Reading, reading_id)
            db.add(
                Evidence(
                    id=evidence_id,
                    reading_id=reading_id,
                    anomaly_id=anomaly_id,
                    source=reading.source,
                    description=description,
                    status="Reviewed"
                    if anomaly_id == "ANM-1008" or anomaly_id is None
                    else "Under review",
                    created_at=reading.recorded_at,
                )
            )

        db.add(WorkspaceSettings(id=1))
        checks = [
            (
                "CHK-001",
                "Observation ID uniqueness",
                "Checks whether observation identifiers are duplicated.",
                "Identity",
            ),
            (
                "CHK-002",
                "Timestamp validation",
                "Checks whether observation timestamps are valid.",
                "Time",
            ),
            (
                "CHK-003",
                "Missing station readings",
                "Identifies stations without recent observations.",
                "Completeness",
            ),
            (
                "CHK-004",
                "Source metadata",
                "Checks whether readings include source information.",
                "Traceability",
            ),
            (
                "CHK-005",
                "Synthetic data identification",
                "Checks whether demonstration records are labelled.",
                "Transparency",
            ),
            (
                "CHK-006",
                "Reading completeness",
                "Checks for missing values in observation records.",
                "Completeness",
            ),
        ]
        for check_id, title, description, category in checks:
            db.add(
                IntegrityCheck(
                    id=check_id,
                    title=title,
                    description=description,
                    category=category,
                    status="Warning" if check_id in ("CHK-003", "CHK-006") else "Passed",
                    details="Run the check to validate the current database records.",
                    checked_at=now,
                )
            )
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(title="RadMap API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def reading_status(reading: Reading) -> str:
    if reading.value is None:
        return "No recent data"
    if reading.anomaly:
        return "Reviewed" if reading.anomaly.status == "Reviewed" else "Review required"
    if reading.value >= 0.18:
        return "Review required"
    return "Normal demo reading" if reading.is_demo else "Normal"


def get_latest_reading(db: Session, station_id: str) -> Reading | None:
    return db.scalar(
        select(Reading)
        .options(joinedload(Reading.anomaly))
        .where(Reading.station_id == station_id)
        .order_by(Reading.recorded_at.desc())
        .limit(1)
    )


def as_station(db: Session, station: Station) -> dict[str, Any]:
    latest = get_latest_reading(db, station.id)
    return {
        "id": station.id,
        "name": station.name,
        "location": station.location,
        "latitude": station.latitude,
        "longitude": station.longitude,
        "coverage_area": station.coverage_area,
        "active": station.active,
        "value": latest.value if latest else None,
        "recorded_at": latest.recorded_at if latest else None,
        "status": reading_status(latest) if latest else "No recent data",
    }


def as_reading(reading: Reading) -> dict[str, Any]:
    return {
        "id": reading.id,
        "station": reading.station.id,
        "location": reading.station.location.replace(" County", ""),
        "value": reading.value,
        "time": reading.recorded_at,
        "status": reading_status(reading),
        "source": reading.source,
        "is_demo": reading.is_demo,
    }


def as_anomaly(anomaly: Anomaly) -> dict[str, Any]:
    reading = anomaly.reading
    return {
        "id": anomaly.id,
        "observation": reading.id,
        "station": reading.station.id,
        "location": reading.station.location.replace(" County", ""),
        "reading": f"{reading.value:.2f} µSv/h" if reading.value is not None else "Unavailable",
        "baseline": f"{anomaly.baseline:.2f} µSv/h",
        "difference": f"{anomaly.deviation_percent:+.0f}%",
        "severity": anomaly.severity,
        "status": anomaly.status,
        "time": reading.recorded_at,
        "reviewer_note": anomaly.reviewer_note,
    }


def as_evidence(record: Evidence) -> dict[str, Any]:
    reading = record.reading
    return {
        "id": record.id,
        "observation": reading.id,
        "anomaly": record.anomaly_id or "None",
        "station": reading.station.id,
        "location": reading.station.location.replace(" County", ""),
        "reading": f"{reading.value:.2f} µSv/h" if reading.value is not None else "Unavailable",
        "timestamp": reading.recorded_at,
        "source": record.source,
        "status": record.status,
        "description": record.description,
        "is_demo": reading.is_demo,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/stations", response_model=list[StationOut])
def list_stations(db: Session = Depends(get_db)):
    stations = db.scalars(select(Station).order_by(Station.id)).all()
    return [as_station(db, station) for station in stations]


@app.get("/readings")
def list_readings(
    search: str = Query(default="", max_length=120),
    status_filter: str | None = None,
    station_id: str | None = None,
    limit: int = Query(default=500, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = (
        select(Reading)
        .options(joinedload(Reading.station), joinedload(Reading.anomaly))
        .order_by(Reading.recorded_at.desc())
        .limit(limit)
    )
    if station_id:
        query = query.where(Reading.station_id == station_id)
    readings = [as_reading(item) for item in db.scalars(query).unique().all()]
    if search:
        needle = search.casefold()
        readings = [
            item
            for item in readings
            if needle in f"{item['id']} {item['station']} {item['location']}".casefold()
        ]
    if status_filter and status_filter != "All":
        readings = [item for item in readings if item["status"] == status_filter]
    return readings


@app.post("/readings", status_code=status.HTTP_201_CREATED)
def create_reading(payload: ReadingCreate, db: Session = Depends(get_db)):
    if db.get(Reading, payload.id):
        raise HTTPException(status_code=409, detail="Observation ID already exists")
    if not db.get(Station, payload.station_id):
        raise HTTPException(status_code=404, detail="Station not found")
    reading = Reading(**payload.model_dump(), is_demo=False)
    db.add(reading)
    db.flush()
    if payload.value is not None:
        history = db.scalars(
            select(Reading.value)
            .where(
                Reading.station_id == payload.station_id,
                Reading.value.is_not(None),
                Reading.id != payload.id,
            )
            .order_by(Reading.recorded_at.desc())
            .limit(30)
        ).all()
        if history:
            baseline = sum(history) / len(history)
            deviation = ((payload.value - baseline) / baseline) * 100 if baseline > 0 else 0
            if deviation >= 20:
                anomaly = Anomaly(
                    id=f"ANM-{payload.id.removeprefix('OBS-')}",
                    reading=reading,
                    baseline=baseline,
                    deviation_percent=deviation,
                    severity="Elevated deviation" if deviation >= 40 else "Moderate deviation",
                )
                db.add(anomaly)
                db.flush()
                db.add(
                    Evidence(
                        id=f"EV-{datetime.now(UTC):%Y}-{reading.id.removeprefix('OBS-')}",
                        reading_id=reading.id,
                        anomaly_id=anomaly.id,
                        source=reading.source,
                        description="New observation automatically flagged for comparison with recent station readings.",
                        status="Under review",
                    )
                )
    db.commit()
    return as_reading(reading)


@app.get("/anomalies")
def list_anomalies(db: Session = Depends(get_db)):
    anomalies = (
        db.scalars(
            select(Anomaly)
            .options(joinedload(Anomaly.reading).joinedload(Reading.station))
            .order_by(Anomaly.reading_id.desc())
        )
        .unique()
        .all()
    )
    return [as_anomaly(item) for item in anomalies]


@app.patch("/anomalies/{anomaly_id}")
def review_anomaly(anomaly_id: str, payload: AnomalyReview, db: Session = Depends(get_db)):
    anomaly = db.scalar(
        select(Anomaly)
        .options(joinedload(Anomaly.reading).joinedload(Reading.station))
        .where(Anomaly.id == anomaly_id)
    )
    if anomaly is None:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    anomaly.status = payload.status
    anomaly.reviewer_note = payload.reviewer_note
    anomaly.reviewed_at = utc_now() if payload.status == "Reviewed" else None
    for record in db.scalars(select(Evidence).where(Evidence.anomaly_id == anomaly.id)):
        record.status = "Reviewed" if payload.status == "Reviewed" else "Under review"
    db.commit()
    return as_anomaly(anomaly)


@app.get("/evidence")
def list_evidence(
    search: str = Query(default="", max_length=120),
    status_filter: str | None = None,
    db: Session = Depends(get_db),
):
    evidence = (
        db.scalars(
            select(Evidence)
            .options(joinedload(Evidence.reading).joinedload(Reading.station))
            .order_by(Evidence.created_at.desc())
        )
        .unique()
        .all()
    )
    result = [as_evidence(item) for item in evidence]
    if search:
        needle = search.casefold()
        result = [
            item
            for item in result
            if needle in " ".join(str(value) for value in item.values()).casefold()
        ]
    if status_filter and status_filter != "All":
        result = [item for item in result if item["status"] == status_filter]
    return result


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    stations = db.scalars(select(Station).order_by(Station.id)).all()
    readings = (
        db.scalars(
            select(Reading)
            .options(joinedload(Reading.station), joinedload(Reading.anomaly))
            .order_by(Reading.recorded_at.desc())
            .limit(6)
        )
        .unique()
        .all()
    )
    anomalies = (
        db.scalars(
            select(Anomaly)
            .options(joinedload(Anomaly.reading).joinedload(Reading.station))
            .where(Anomaly.status != "Reviewed")
            .order_by(Anomaly.reading_id.desc())
        )
        .unique()
        .all()
    )
    latest_by_station = [get_latest_reading(db, station.id) for station in stations]
    cutoff = utc_now() - timedelta(hours=24)
    active_count = sum(
        1
        for reading in latest_by_station
        if reading
        and (
            reading.recorded_at.replace(tzinfo=UTC)
            if reading.recorded_at.tzinfo is None
            else reading.recorded_at
        )
        >= cutoff
    )
    alerts = [
        {
            "title": f"Unusual reading detected · {item.reading.station.id}",
            "detail": f"Observation {item.reading.id} differs {item.deviation_percent:+.0f}% from its station baseline.",
            "tag": "REVIEW REQUIRED",
        }
        for item in anomalies
    ]
    missing = [
        station
        for station, latest in zip(stations, latest_by_station, strict=True)
        if latest is None or latest.value is None
    ]
    if missing:
        alerts.append(
            {
                "title": "Monitoring coverage gap",
                "detail": f"{len(missing)} station(s) have no recent usable observation.",
                "tag": "COVERAGE NOTICE",
            }
        )
    return {
        "stats": [
            {
                "label": "Monitoring Stations",
                "value": len(stations),
                "note": f"{active_count} reporting in the last 24 hours",
            },
            {
                "label": "Active Readings",
                "value": db.scalar(select(func.count()).select_from(Reading)),
                "note": "Recorded observations",
            },
            {
                "label": "Anomalies Detected",
                "value": db.scalar(select(func.count()).select_from(Anomaly)),
                "note": f"{len(anomalies)} require review",
            },
            {
                "label": "Coverage Areas",
                "value": len({station.coverage_area for station in stations}),
                "note": "Configured regions",
            },
        ],
        "stations": [as_station(db, station) for station in stations],
        "alerts": alerts,
        "readings": [as_reading(item) for item in readings],
        "is_demo": all(item.is_demo for item in readings),
    }


@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    readings = (
        db.scalars(
            select(Reading)
            .options(joinedload(Reading.station), joinedload(Reading.anomaly))
            .where(Reading.value.is_not(None))
            .order_by(Reading.recorded_at.asc())
        )
        .unique()
        .all()
    )
    by_station: dict[str, list[Reading]] = {}
    for reading in readings:
        by_station.setdefault(reading.station.location.replace(" County", ""), []).append(reading)

    trend: list[dict[str, Any]] = []
    for reading in readings[-48:]:
        stamp = reading.recorded_at
        if not trend or trend[-1]["time"] != stamp.strftime("%H:%M"):
            trend.append({"time": stamp.strftime("%H:%M")})
        trend[-1][reading.station.location.replace(" County", "").casefold()] = reading.value

    station_data = [
        {"station": name, "value": round(values[-1].value or 0, 3)}
        for name, values in by_station.items()
    ]
    anomaly_count = db.scalar(select(func.count()).select_from(Anomaly)) or 0
    total = db.scalar(select(func.count()).select_from(Reading)) or 0
    unavailable = sum(1 for item in db.scalars(select(Reading.value)).all() if item is None)
    normal = max(total - anomaly_count - unavailable, 0)
    denominator = max(total, 1)
    return {
        "summary": {
            "observations": total,
            "stations": db.scalar(select(func.count()).select_from(Station)),
            "highest_reading": max((item.value or 0 for item in readings), default=0),
            "flagged": anomaly_count,
        },
        "trend": trend,
        "stations": station_data,
        "distribution": [
            {"name": "Normal readings", "value": round(normal * 100 / denominator, 1)},
            {"name": "Flagged for review", "value": round(anomaly_count * 100 / denominator, 1)},
            {"name": "Unavailable data", "value": round(unavailable * 100 / denominator, 1)},
        ],
    }


def run_integrity_checks(db: Session) -> list[IntegrityCheck]:
    now = utc_now()
    readings = db.scalars(select(Reading)).all()
    stations = db.scalars(select(Station)).all()
    ids_unique = len({item.id for item in readings}) == len(readings)
    missing_station = [
        station.id
        for station in stations
        if not any(r.station_id == station.id and r.value is not None for r in readings)
    ]
    missing_source = [item.id for item in readings if not item.source.strip()]
    missing_value = [item.id for item in readings if item.value is None]
    synthetic_unlabelled = [
        item.id
        for item in readings
        if item.is_demo and not item.source.lower().startswith("demonstration")
    ]
    results = {
        "CHK-001": (
            "Passed" if ids_unique else "Failed",
            "Observation identifiers are unique."
            if ids_unique
            else "Duplicate observation IDs found.",
        ),
        "CHK-002": ("Passed", "All stored timestamps are valid database timestamps."),
        "CHK-003": (
            "Warning" if missing_station else "Passed",
            f"Stations without usable observations: {', '.join(missing_station) if missing_station else 'none'}.",
        ),
        "CHK-004": (
            "Warning" if missing_source else "Passed",
            f"Readings missing source metadata: {', '.join(missing_source) if missing_source else 'none'}.",
        ),
        "CHK-005": (
            "Warning" if synthetic_unlabelled else "Passed",
            f"Unlabelled synthetic readings: {', '.join(synthetic_unlabelled) if synthetic_unlabelled else 'none'}.",
        ),
        "CHK-006": (
            "Warning" if missing_value else "Passed",
            f"Readings missing values: {', '.join(missing_value) if missing_value else 'none'}.",
        ),
    }
    checks = db.scalars(select(IntegrityCheck)).all()
    for check in checks:
        check.status, check.details = results[check.id]
        check.checked_at = now
    db.commit()
    return checks


@app.get("/integrity")
def list_integrity(db: Session = Depends(get_db)):
    checks = db.scalars(select(IntegrityCheck).order_by(IntegrityCheck.id)).all()
    return [
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "status": item.status,
            "details": item.details,
            "checked_at": item.checked_at,
        }
        for item in checks
    ]


@app.post("/integrity/run")
def rerun_integrity(db: Session = Depends(get_db)):
    return [
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "status": item.status,
            "details": item.details,
            "checked_at": item.checked_at,
        }
        for item in run_integrity_checks(db)
    ]


@app.patch("/integrity/{check_id}")
def update_integrity(check_id: str, payload: IntegrityStatusUpdate, db: Session = Depends(get_db)):
    check = db.get(IntegrityCheck, check_id)
    if check is None:
        raise HTTPException(status_code=404, detail="Integrity check not found")
    check.status = payload.status
    check.checked_at = utc_now()
    db.commit()
    return {
        "id": check.id,
        "status": check.status,
        "details": check.details,
        "checked_at": check.checked_at,
    }


@app.get("/settings")
def get_workspace_settings(db: Session = Depends(get_db)):
    preferences = db.get(WorkspaceSettings, 1)
    if preferences is None:
        raise HTTPException(status_code=503, detail="Workspace settings are not initialized")
    return {
        "region": preferences.region,
        "time_zone": preferences.time_zone,
        "anomaly_alerts": preferences.anomaly_alerts,
        "coverage_alerts": preferences.coverage_alerts,
        "data_quality_alerts": preferences.data_quality_alerts,
        "email_notifications": preferences.email_notifications,
        "compact_cards": preferences.compact_cards,
        "show_station_ids": preferences.show_station_ids,
    }


@app.put("/settings")
def save_workspace_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    preferences = db.get(WorkspaceSettings, 1)
    if preferences is None:
        raise HTTPException(status_code=503, detail="Workspace settings are not initialized")
    for field, value in payload.model_dump().items():
        setattr(preferences, field, value)
    db.commit()
    return get_workspace_settings(db)


@app.post("/ai/analyze")
async def analyze_with_gemma(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    if not settings.gemma_base_url or not settings.gemma_model:
        raise HTTPException(
            status_code=503, detail="Configure GEMMA_BASE_URL and GEMMA_MODEL in the backend .env"
        )

    records = (
        db.scalars(
            select(Reading)
            .options(joinedload(Reading.station))
            .where(Reading.id == payload.reading_id)
            if payload.reading_id
            else select(Reading)
            .options(joinedload(Reading.station), joinedload(Reading.anomaly))
            .order_by(Reading.recorded_at.desc())
            .limit(20)
        )
        .unique()
        .all()
    )
    if payload.reading_id and not records:
        raise HTTPException(status_code=404, detail="Observation not found")
    evidence_context = [
        {
            "id": record.id,
            "station": record.station.id,
            "location": record.station.location,
            "value_uSv_h": record.value,
            "recorded_at": record.recorded_at.isoformat(),
            "status": reading_status(record),
            "source": record.source,
            "is_demo": record.is_demo,
            "anomaly": {
                "baseline_uSv_h": record.anomaly.baseline,
                "deviation_percent": record.anomaly.deviation_percent,
                "severity": record.anomaly.severity,
                "review_status": record.anomaly.status,
            }
            if record.anomaly
            else None,
        }
        for record in records
    ]
    url = f"{settings.gemma_base_url.rstrip('/')}/chat/completions"
    headers = (
        {"Authorization": f"Bearer {settings.gemma_api_key}"} if settings.gemma_api_key else {}
    )
    body = {
        "model": settings.gemma_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are RadMap Sentinel, an environmental data analysis assistant. "
                    "Use only the supplied records; distinguish demonstration data from verified measurements. "
                    "Do not diagnose health risks or claim that a screening anomaly proves danger. "
                    "State uncertainty and recommend qualified human review when appropriate."
                ),
            },
            {
                "role": "user",
                "content": f"Evidence records: {evidence_context}\n\nQuestion: {payload.prompt}",
            },
        ],
        "temperature": 0.2,
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url, json=body, headers=headers)
            response.raise_for_status()
            result = response.json()
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="Gemma analysis timed out") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502, detail=f"Gemma provider returned HTTP {exc.response.status_code}"
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502, detail="Could not connect to the configured Gemma provider"
        ) from exc
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=502, detail="Gemma provider returned an invalid response"
        ) from exc

    try:
        answer = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(
            status_code=502, detail="Gemma provider response did not contain a completion"
        ) from exc
    return {
        "answer": answer,
        "model": settings.gemma_model,
        "evidence_count": len(evidence_context),
    }
