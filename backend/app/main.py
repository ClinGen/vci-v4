from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.api import variants
from app.db.session import engine

app = FastAPI(title="VCI v4 API")
app.include_router(variants.router)

LINKS = [
    ("/docs", "Interactive API docs (try every endpoint)"),
    ("/redoc", "API docs, read-only layout"),
    ("/api/health", "Health check (API and database)"),
    ("/openapi.json", "Raw API description"),
]


# In AWS, CloudFront serves the React app at "/", so this page is only seen locally.
@app.get("/", include_in_schema=False, response_class=HTMLResponse)
def index() -> str:
    items = "".join(f'<li><a href="{path}">{path}</a> &mdash; {label}</li>' for path, label in LINKS)
    return f"<!doctype html><title>VCI v4 API</title><h1>VCI v4 API</h1><ul>{items}</ul>"


@app.get("/api/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except OperationalError:
        return JSONResponse(status_code=503, content={"status": "error", "database": "unreachable"})
    return {"status": "ok", "database": "ok"}
