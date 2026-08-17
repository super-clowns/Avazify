# Avazify Backend

Django REST Framework API for Avazify.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo --reset
python manage.py runserver
```

API documentation is available at `/api/docs/` and the test suite contains 35 tests:

```bash
python manage.py test
```
