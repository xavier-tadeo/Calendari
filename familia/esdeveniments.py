"""Esdeveniments del calendari (editables, amb color i recurrencia opcional)."""

from __future__ import annotations

import calendar
import uuid
from datetime import date

from familia.storage import desa, llegeix

PALETA = [
    "#1f77b4", "#d62728", "#2ca02c", "#ff7f0e", "#9467bd",
    "#8c564b", "#e377c2", "#17becf", "#bcbd22", "#7f7f7f",
]

COLOR_NOMS = {
    "#1f77b4": "Blau",
    "#d62728": "Vermell",
    "#2ca02c": "Verd",
    "#ff7f0e": "Taronja",
    "#9467bd": "Lila",
    "#8c564b": "Marro",
    "#e377c2": "Rosa",
    "#17becf": "Turquesa",
    "#bcbd22": "Verd oliva",
    "#7f7f7f": "Gris",
}

COLOR_FESTIU = "#d32f2f"

RECURRENCIES = {
    "cap": "No es repeteix",
    "diari": "Cada dia",
    "setmanal": "Cada setmana",
    "mensual": "Cada mes",
}


def _load() -> list[dict]:
    return llegeix("esdeveniments", {}).get("esdeveniments", [])


def _save(events: list[dict]) -> None:
    desa("esdeveniments", {"esdeveniments": events})


def tots() -> list[dict]:
    return _load()


def nou_id() -> str:
    return uuid.uuid4().hex[:8]


def afegir(ev: dict) -> dict:
    events = _load()
    ev = {**ev, "id": ev.get("id") or nou_id()}
    events.append(ev)
    _save(events)
    return ev


def actualitzar(ev_id: str, canvis: dict) -> None:
    events = _load()
    for i, e in enumerate(events):
        if e["id"] == ev_id:
            events[i] = {**e, **canvis, "id": ev_id}
    _save(events)


def esborrar(ev_id: str) -> None:
    _save([e for e in _load() if e["id"] != ev_id])


def _data(ev: dict) -> date | None:
    try:
        return date.fromisoformat(ev.get("data", ""))
    except (ValueError, TypeError):
        return None


def ocorre(ev: dict, dia: date) -> bool:
    """True si l'esdeveniment passa en aquest dia (tenint en compte la recurrencia)."""
    inici = _data(ev)
    if inici is None or dia < inici:
        return False
    fins = ev.get("fins") or ""
    if fins:
        try:
            if dia > date.fromisoformat(fins):
                return False
        except (ValueError, TypeError):
            pass
    r = ev.get("recurrencia", "cap")
    if r in ("", "cap"):
        return dia == inici
    if r == "diari":
        return True
    if r == "setmanal":
        return dia.weekday() == inici.weekday()
    if r == "mensual":
        ultim = calendar.monthrange(dia.year, dia.month)[1]
        return dia.day == min(inici.day, ultim)
    return False


def del_dia(dia: date) -> list[dict]:
    return [e for e in _load() if ocorre(e, dia)]


def propers(dia: date, dies: int = 1) -> list[tuple[date, dict]]:
    """Esdeveniments del dia i dels propers `dies` dies (per a recordatoris)."""
    from datetime import timedelta

    out = []
    for i in range(dies + 1):
        d = dia + timedelta(days=i)
        for e in del_dia(d):
            out.append((d, e))
    return out


def ordenats(events: list[dict]) -> list[dict]:
    def clau(e):
        return (not e.get("tot_el_dia", True), e.get("hora_inici") or "00:00")
    return sorted(events, key=clau)
