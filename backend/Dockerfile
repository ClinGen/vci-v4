FROM python:3.14-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Local development: adds test tools. Code is mounted by compose, not copied.
FROM base AS dev
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

# Production image. Last stage, so it is the default build target.
# Runs as an unprivileged user that can read the code (owned by root) but not change it.
# Dev stays root: it mounts the host's backend/ folder, which a non-root user often can't write on Linux.
FROM base AS production
# pip is only needed to build the image, and it bundles its own older copies of urllib3, certifi and msgpack.
RUN python -m pip uninstall --yes pip \
    && rm -rf /usr/local/lib/python3.*/ensurepip/_bundled \
    && groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app
COPY . .
USER 10001:10001
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
