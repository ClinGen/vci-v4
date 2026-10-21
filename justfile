set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

# Start Postgres and the API
up:
    docker compose up -d

# Stop containers (keeps database data)
down:
    docker compose down

# Apply all migrations
migrate:
    docker compose run --rm api alembic upgrade head

# Generate a migration from model changes, e.g. just migration "add snapshots"
migration message:
    docker compose run --rm api alembic revision --autogenerate -m "{{message}}"

# Fail if the models and the database differ
db-check:
    docker compose run --rm api alembic check

# Delete the local database and rebuild it from migrations
db-reset:
    docker compose down -v
    docker compose up -d
    docker compose run --rm api alembic upgrade head

# Run backend tests against a separate vci_test database, e.g. just test -k variants
test *args:
    docker compose run --rm api pytest {{args}}

# Open a SQL shell on the local database
psql:
    docker compose exec db psql -U vci -d vci

# Follow API logs
logs:
    docker compose logs -f api

# Start the frontend dev server
frontend-dev:
    cd frontend && npm run dev
