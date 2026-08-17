.PHONY: up down build logs test-backend test-frontend check seed migrate schema-check

up:
	docker compose up --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

migrate:
	docker compose run --rm backend python manage.py migrate

seed:
	docker compose run --rm backend python manage.py seed_demo --reset

test-backend:
	docker compose run --rm backend python manage.py test

test-frontend:
	cd frontend && npm ci && npm run check

check: test-backend test-frontend


schema-check:
	docker compose run --rm backend sh -c "python manage.py spectacular --file /tmp/avazify-schema.yaml --validate"
