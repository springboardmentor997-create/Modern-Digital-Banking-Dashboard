# Makefile for local dev / prod tasks
.PHONY: up-prod down-prod migrate migrate-sqlite import-sample-transactions test build

up-prod:
	docker compose -f ../docker-compose.prod.yml up -d --build
	echo "Backend on http://localhost:8000"

down-prod:
	docker compose -f ../docker-compose.prod.yml down

migrate:
	docker compose -f ../docker-compose.prod.yml exec backend alembic upgrade head

migrate-sqlite:
	python scripts/migrate_sqlite_to_postgres.py

import-sample-transactions:
	python scripts/import_sample_transactions.py

test:
	pytest -q

build:
	docker build -t banking-backend:local -f Dockerfile .
