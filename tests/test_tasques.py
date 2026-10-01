from datetime import date

from familia.config import load_config
from familia.tasques import (
    disponible,
    generate_setmana,
    solapaments_extraescolars,
)


def _cfg():
    return load_config()


def test_genera_tasques_tots_els_dies():
    files = generate_setmana(_cfg(), date(2026, 10, 1))
    dies = {f["dia"] for f in files}
    assert dies == {"dl", "dt", "dc", "dj", "dv", "ds", "dg"}
    assert any(f["nom"] == "Cuinar el sopar" for f in files)


def test_portar_cole_nomes_en_dies_laborables():
    files = [f for f in generate_setmana(_cfg(), date(2026, 10, 1)) if f["task_id"] == "portar_cole"]
    assert {f["dia"] for f in files} <= {"dl", "dt", "dc", "dj", "dv"}


def test_no_hi_ha_escola_en_festiu():
    ref = date(2026, 9, 24)  # Merce (dijous)
    files = generate_setmana(_cfg(), ref)
    assert not any(f["task_id"] in ("portar_cole", "recollir_cole") and f["dia"] == "dj" for f in files)


def test_papa_pot_portar_quan_teletreballa():
    cfg = _cfg()
    papa = next(a for a in cfg["familia"]["adults"] if a["id"] == "papa")
    assert disponible(papa, "dc", "08:45") is True
    assert disponible(papa, "dl", "08:45") is False


def test_rotacio_canvia_entre_setmanes():
    cfg = _cfg()
    a = generate_setmana(cfg, date(2026, 10, 1))
    b = generate_setmana(cfg, date(2026, 10, 8))  # +1 setmana
    sopar_a = next(f["assignat"] for f in a if f["task_id"] == "sopars" and f["dia"] == "dl")
    sopar_b = next(f["assignat"] for f in b if f["task_id"] == "sopars" and f["dia"] == "dl")
    assert sopar_a != sopar_b


def test_detecta_solapament_jueves():
    avisos = solapaments_extraescolars(_cfg())
    assert any("Training" in x and "Piscina" in x for x in avisos)
