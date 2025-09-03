# Use bash with strict flags
set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

# Default task
default: help

# Common vars
COMPOSE := 'docker compose -f infra/docker-compose.yml'
DB_USER := 'vciv4'
DB_PASS := 'vci4password'
DB_NAME := 'vci'
DB_CONTAINER := 'vci_postgres'   # matches the name in infra/docker-compose.yml

# ---- help ----
help:
	@echo "VCI v4 — common commands"
	@echo "  just db-up            # start local Postgres"
	@echo "  just db-down          # stop & remove local Postgres"
	@echo "  just db-logs          # tail DB logs"
	@echo "  just db-psql          # open psql shell"
	@echo "  just db-init          # ensure tables exist"
	@echo "  just db-insert-demo   # insert a demo variant row"
	@echo "  just backend-build    # build SAM"
	@echo "  just backend-run      # run SAM API locally"
	@echo "  just curl-demo        # curl the demo variant"
	@echo "  just frontend-dev     # start Vite dev server"
	@echo ""
	@echo "Tips: "
	@echo "  - If Linux can't resolve host.docker.internal, set DB_HOST=127.0.0.1 in backend/sam-env.json"

# ---- database ----
db-up:
	{{COMPOSE}} up -d
	@echo "Waiting for Postgres health…"
	# Wait for container healthcheck to turn healthy (compose file defines it)
	until [[ "$(docker inspect -f '{{"{{"}}.State.Health.Status{{"}}"}}' {{DB_CONTAINER}})" == "healthy" ]]; do \
	  sleep 1; \
	done
	@echo "Postgres is healthy."

db-down:
	{{COMPOSE}} down -v

db-logs:
	{{COMPOSE}} logs -f db

db-psql:
	{{COMPOSE}} exec -e PGPASSWORD={{DB_PASS}} db psql -U {{DB_USER}} -d {{DB_NAME}}

# creates minimal tables if they don't exist
db-init:
	@echo "Creating tables if not exist…"
	{{COMPOSE}} exec -T -e PGPASSWORD={{DB_PASS}} db psql -U {{DB_USER}} -d {{DB_NAME}} -v ON_ERROR_STOP=1 -c $'\
	  CREATE TABLE IF NOT EXISTS variants ( \
	    id SERIAL PRIMARY KEY, \
	    clinvar_id TEXT UNIQUE, \
	    raw_payload JSONB, \
	    created_at TIMESTAMPTZ NOT NULL DEFAULT now() \
	  ); \
	  CREATE TABLE IF NOT EXISTS classifications ( \
	    id SERIAL PRIMARY KEY, \
	    variant_id INTEGER REFERENCES variants(id), \
	    status TEXT, \
	    created_at TIMESTAMPTZ NOT NULL DEFAULT now() \
	  );'

# insert a simple demo payload for testing lookup
db-insert-demo:
	{{COMPOSE}} exec -T -e PGPASSWORD={{DB_PASS}} db psql -U {{DB_USER}} -d {{DB_NAME}} -v ON_ERROR_STOP=1 -c $'\
	  INSERT INTO variants (clinvar_id, raw_payload) \
	  VALUES (\'12345\', \'{"example": true, "note": "hello from DB"}\') \
	  ON CONFLICT (clinvar_id) DO UPDATE SET raw_payload = EXCLUDED.raw_payload;'

# ---- backend ----
backend-build:
	cd backend && sam build

# Declare dependency so build runs first
backend-run: backend-build
	cd backend && sam local start-api --env-vars sam-env.json

# ---- quick curl ----
curl-demo:
	curl -s "http://127.0.0.1:3000/variant-lookup?id=12345" | jq .

# ---- frontend ----
frontend-dev:
	cd frontend && npm install && npm run dev
