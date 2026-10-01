.PHONY: install test run lint clean

PY := .venv/bin/python

install:
	python3 -m venv .venv
	$(PY) -m pip install --upgrade pip
	$(PY) -m pip install -r requirements.txt

test:
	$(PY) -m pytest -q

run:
	.venv/bin/streamlit run familia/app.py --server.port 8701 --server.headless true

lint:
	$(PY) -m ruff check .

clean:
	rm -rf .venv __pycache__ */__pycache__ .pytest_cache .ruff_cache
