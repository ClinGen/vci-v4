# VCI v4

The ClinGen Variant Curation Interface, version 4. Curators use it to classify germline sequence variants under the ACMG/AMP/CAP/ClinGen Sequence Variant Classification v4 (SVCv4) standards, then publish to the ClinGen Evidence Repository and submit to ClinVar. It replaces VCI v3.

**Status: pre-alpha.** The full curation UI exists, including the SVCv4 scoring rules, but runs on sample data. The backend has its core database schema and a health check. Nothing is deployed yet. Progress is tracked in the [GitHub milestones](https://github.com/ClinGen/vci-v4/milestones).

## Architecture

```
Browser ── CloudFront ──┬── S3                   React app (static build)
                        └── /api/* ── ALB ── ECS Fargate (FastAPI) ── RDS Postgres
```

| Layer | Choice |
|-------|--------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Frontend state | Redux Toolkit; RTK Query for server data |
| Backend | FastAPI (Python 3.14), SQLAlchemy 2, Alembic |
| Database | Postgres 18: Docker locally, Amazon RDS in AWS |
| Auth | Clerk |
| Infrastructure | Terraform |
| CI/CD | GitHub Actions |

## Repository layout

```
backend/
  app/
    main.py            FastAPI app
    config.py          Settings from environment variables
    db/models/         SQLAlchemy models, one file per table
    db/vocab.py        Allowed values: statuses, results, sections, evidence kinds
    api/               API routes, one file per resource
    schemas/           Pydantic request and response models
  alembic/versions/    Database migrations
  tests/               pytest suite
  shared/providers/    Old Allele Registry and ClinVar clients, kept as reference for Phase 2
frontend/
  src/lib/scoring.ts   SVCv4 point calculations for every evidence code
  src/components/tabs/ One folder per curation section
docs/
  data-model.md        Tables, conventions, and how they map to the SVCv4 model
infra/terraform/       AWS infrastructure (in progress)
scripts/               One-off tooling
compose.yaml           Local Postgres and API
justfile               Shortcuts for the commands below
```

## Local development

**You need:** Docker Desktop, and Node 20 through [nvm](https://github.com/nvm-sh/nvm) (the version is in `.nvmrc`). The backend runs in Docker, so a local Python is only needed for editor support. [just](https://github.com/casey/just) is optional; each shortcut below is a single command.

### Backend and database

```bash
docker compose up -d                              # Postgres on localhost:5433, API on localhost:8000
docker compose run --rm api alembic upgrade head  # create or update the tables
curl localhost:8000/api/health                    # {"status":"ok","database":"ok"}
```

The API reloads when you edit files in `backend/`. Interactive API docs are at http://localhost:8000/docs.

| Task | Command | Shortcut |
|------|---------|----------|
| Start everything | `docker compose up -d` | `just up` |
| Run backend tests | `docker compose run --rm api pytest` | `just test` |
| Stop (keeps data) | `docker compose down` | `just down` |
| Apply migrations | `docker compose run --rm api alembic upgrade head` | `just migrate` |
| SQL shell | `docker compose exec db psql -U vci -d vci` | `just psql` |
| API logs | `docker compose logs -f api` | `just logs` |
| Wipe and rebuild the database | `docker compose down -v`, then start and migrate | `just db-reset` |

### Frontend

```bash
cd frontend
nvm use
npm install
npm run dev     # http://localhost:5173
```

The frontend doesn't call the API yet; coming soon.

## Testing

Every pull request runs the CI workflow in `.github/workflows/ci.yml`. Run the same checks locally before pushing.

- **Backend:** `just test` runs pytest against a separate `vci_test` database on the local Postgres, so your development data is never touched. The suite rebuilds the test database from the migrations, checks that every migration can be undone, fails if a model changed without a migration, and checks the rules the database enforces (uniqueness, allowed values, the append-only audit table). Each test runs in a transaction that is rolled back afterward.
- **Frontend:** `npm run lint` and `npm run build` (which type-checks) in `frontend/`.

New features come with tests: API tests in `backend/tests/` for each endpoint, and a test for each new database rule.

## Changing the database

Tables are defined as Python classes in `backend/app/db/models/`, and Alembic generates the migrations from them.

1. Add or edit a model file. For a new table, also import it in `backend/app/db/models/__init__.py`, or Alembic won't see it.
2. Generate the migration: `just migration "add [model]"`.
3. Read the generated file in `backend/alembic/versions/`. Alembic doesn't detect triggers, functions, or column renames, so write those by hand.
4. Apply it with `just migrate`.
5. Confirm the models and database match with `just db-check`.

Commit the migration together with the model change. Conventions (UUID keys, `CHECK` constraints instead of enums, when to use JSONB, the append-only audit table) are in [docs/data-model.md](docs/data-model.md).

## Terms

- **Classification record:** the work on one variant, for one disease and mode of inheritance, under one affiliation. VCI v3 called this an interpretation.
- **Classification result:** the record's verdict, from benign to pathogenic.
- **Evidence code:** one of the SVCv4 codes, such as `POP_FRQ` or `CLN_AFF`.

## Roadmap

1. **Foundation:** data model, FastAPI skeleton, Terraform, CI/CD, first deploy
2. **Live data:** external APIs (Allele Registry, gnomAD, Ensembl VEP, ClinGen LDH, ClinVar, CSpec) in the read-only tabs
3. **Auth and saving work:** Clerk sign-in, saving evidence and scores, audit trail
4. **Affiliations and dashboard:** Affiliations Service, data scoped per affiliation
5. **Publishing and ClinVar:** provisional and approved snapshots, Evidence Repository, ClinVar submission
6. **Demo:** end-to-end polish

## References

- [SVCv4 model](https://github.com/clingen-data-model/svcv4-model): the GA4GH VA-Spec profile that published classifications are transformed into. Still in development.
- VCI v3: referenced for affiliations, snapshots, ClinVar batches, and CSpec ingestion. VCI v4 is a rewrite and shares no code with it.

## Contributing

- Work on a branch and open a pull request.
- Never commit secrets. `.env` files are ignored by Git. The credentials in `compose.yaml` are for a throwaway local database only; real ones live in AWS Secrets Manager.
- This repository is public.
