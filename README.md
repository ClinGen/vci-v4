# VCI v4

This repository contains the code and infrastructure for the Variant Curation Interface (VCI) v4. The goal is to support the upcoming v4 scoring and curation framework with a new backend, frontend, and database, managed as a cloud-native application.

*NOTE: This is a work in progress and READMEs will be updated and added as development progresses.*

## Project Structure

```
vci-v4/
├── backend/      # Python AWS Lambda handlers, validation, tests
├── frontend/     # Vite + React + TypeScript frontend (UI)
├── infra/        # Terraform code for AWS infra (Lambda, API Gateway, RDS, etc.)
├── docs/         # Architecture, onboarding, API docs
├── .github/      # CI/CD (GitHub Actions workflows)
└── README.md
```

## Setup

### Prerequisites

* Python 3.11 or newer
* Node.js 20 or newer (use `nvm`)
* Terraform 1.5+
* AWS CLI (with your credentials set up)
* Git

### Clone the Repo

```bash
git clone git@github.com:ClinGen/vci-v4.git
cd vci-v4
```

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest  # run backend tests
```

### Frontend

```bash
cd ../frontend
nvm use
npm install
npm run dev
```

### Infrastructure

```bash
cd ../infra
terraform init
terraform plan
terraform apply
```

*This will deploy infrastructure to your AWS account.*

## CI/CD

* CI and deploy workflows are in `.github/workflows/`. *Coming Soon!*
* Tests run automatically on push and pull request.

## Docs

* See `docs/` for architecture, API, and onboarding guides.

## Contributing

* Follow any onboarding instructions in `docs/onboarding.md`. *Coming Soon!*
* Keep code and docs up to date.
