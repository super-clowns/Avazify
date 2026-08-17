# Validation Report

## Checks executed in the artifact-generation environment

- Python syntax compilation: **passed** for all backend Python files (`python -m compileall`).
- Frontend domain tests: **21 passed, 0 failed** (`node --test tests/phase1.test.mjs`).
- Internal TypeScript source consistency check with local declaration shims: **passed**.
- JavaScript syntax check for Service Worker and domain logic: **passed**.
- Archive integrity check: performed after ZIP generation.

## Checks included but not executable in this environment

The backend contains **33 Django/DRF tests** in `backend/tests/test_api.py`. They could not be executed here because this isolated environment could not download Django and DRF packages and did not provide Docker. Run either command on a machine with internet/Docker:

```bash
cd backend
pip install -r requirements.txt
python manage.py test
```

or:

```bash
docker compose run --rm backend python manage.py test
```

The normal frontend build and lint should be run with:

```bash
cd frontend
npm ci
npm run check
```

## Runtime hotfix (v2)
- Demo seeding is restart-safe: the manually seeded support notification that collided with ticket signals was removed.
- Seeded ticket messages use `bulk_create` so reseeding does not emit duplicate reply notifications.
- Model index declarations and the self-follow migration state were aligned with committed migrations to prevent spurious `makemigrations` warnings.
