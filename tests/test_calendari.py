from datetime import date

from familia.calendari import (
    dies_setmana,
    es_festiu,
    graella_mes,
    inici_setmana,
    setmana_key,
)


def test_setmana_key():
    key = setmana_key(date(2026, 10, 1))
    assert key == "2026-W40"


def test_inici_setmana_es_dilluns():
    d = date(2026, 10, 1)  # dijous
    assert inici_setmana(d).weekday() == 0


def test_dies_setmana_7_dies():
    dies = dies_setmana(date(2026, 10, 1))
    assert list(dies.keys()) == ["dl", "dt", "dc", "dj", "dv", "ds", "dg"]
    assert dies["dg"] > dies["dl"]


def test_festius_barcelona_2026():
    assert es_festiu(date(2026, 9, 24))  # Merce
    assert es_festiu(date(2026, 9, 11))  # Diada
    assert es_festiu(date(2026, 1, 6))   # Reis
    assert not es_festiu(date(2026, 9, 23))


def test_graella_mes_compta_dies():
    files = graella_mes(2026, 9)
    dies = [d for fila in files for d in fila if d is not None]
    assert len(dies) == 30
    assert all(len(fila) == 7 for fila in files)
