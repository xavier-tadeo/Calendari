"""Calendari: setmanes, mes en curs i festius de Catalunya / Barcelona."""

from __future__ import annotations

from datetime import date, timedelta

from familia.config import DIES, load_festius


def _fest_map() -> dict[str, dict]:
    out = {}
    for f in load_festius().get("festius", []):
        out[f["data"]] = f
    return out


def es_festiu(dia: date) -> bool:
    return dia.isoformat() in _fest_map()


def festiu(dia: date) -> dict | None:
    return _fest_map().get(dia.isoformat())


def setmana_key(dia: date) -> str:
    """Clau de setmana ISO, p.ex. '2026-W40'."""
    iso = dia.isocalendar()
    return f"{iso.year}-W{iso.week:02d}"


def inici_setmana(dia: date) -> date:
    """Dilluns de la setmana del dia donat."""
    return dia - timedelta(days=dia.weekday())


def dies_setmana(dia: date) -> dict[str, date]:
    """{'dl': date, ..., 'dg': date} per a la setmana del dia donat."""
    dilluns = inici_setmana(dia)
    return {d: dilluns + timedelta(days=i) for i, d in enumerate(DIES)}


def setmana_anterior(dia: date) -> date:
    return dia - timedelta(days=7)


def setmana_seguent(dia: date) -> date:
    return dia + timedelta(days=7)


def mes_actual(dia: date) -> tuple[int, int]:
    return dia.year, dia.month


MESOS_NOM = {
    1: "Gener", 2: "Febrer", 3: "Marc", 4: "Abril", 5: "Maig", 6: "Juny",
    7: "Juliol", 8: "Agost", 9: "Setembre", 10: "Octubre", 11: "Novembre", 12: "Desembre",
}


def nom_mes(any_i: int, mes: int) -> str:
    return f"{MESOS_NOM[mes]} {any_i}"


def graella_mes(any_i: int, mes: int) -> list[list[date | None]]:
    """Graella del mes (setmanes de dl a dg); dies d'altres mesos = None."""
    ultim = date(any_i + (mes == 12), (mes % 12) + 1, 1) - timedelta(days=1)
    files: list[list[date | None]] = []
    setmana: list[date | None] = [None] * 7
    for dia in range(1, ultim.day + 1):
        d = date(any_i, mes, dia)
        idx = d.weekday()
        if idx == 0 and any(x is not None for x in setmana):
            files.append(setmana)
            setmana = [None] * 7
        setmana[idx] = d
        if idx == 6:
            files.append(setmana)
            setmana = [None] * 7
    if any(x is not None for x in setmana):
        files.append(setmana)
    return files


def data_espanyola(d: date) -> str:
    return d.strftime("%d/%m/%Y")
