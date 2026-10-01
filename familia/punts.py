"""Punts i premis de les nenes (estil OurHome): check-in de tasques i bescanvi."""

from __future__ import annotations

from familia.calendari import setmana_key
from familia.config import nens, save_estat

PREMIS_DEFAULT = [
    {"id": "pelicula", "nom": "Triar la pel·lícula del divendres", "cost": 10},
    {"id": "gelat", "nom": "Un gelat el cap de setmana", "cost": 15},
    {"id": "joc", "nom": "1 hora extra de jocs", "cost": 20},
    {"id": "sortida", "nom": "Sortida especial amb un adult", "cost": 30},
]


def estat_inicial(cfg: dict, week: str) -> dict:
    return {
        "setmana": week,
        "checkins": {},
        "punts": {n["id"]: 0 for n in nens(cfg)},
        "premis": PREMIS_DEFAULT.copy(),
        "premis_bescanviats": [],
    }


def assegura_setmana(cfg: dict, estat: dict, dia) -> dict:
    week = setmana_key(dia)
    if estat.get("setmana") != week:
        estat = estat_inicial(cfg, week)
    return estat


def marcar(estat: dict, clau: str, kid: str, punts: int, fet: bool = True) -> dict:
    """Marca/desmarca una tasca de la nena i ajusta el saldo de punts."""
    checkins = estat.setdefault("checkins", {})
    saldo = estat.setdefault("punts", {})
    if fet and clau not in checkins:
        checkins[clau] = True
        saldo[kid] = saldo.get(kid, 0) + punts
    elif not fet and clau in checkins:
        del checkins[clau]
        saldo[kid] = max(0, saldo.get(kid, 0) - punts)
    return estat


def pot_bescanviar(estat: dict, kid: str, cost: int) -> bool:
    return estat.get("punts", {}).get(kid, 0) >= cost


def bescanviar(estat: dict, premis_id: str, kid: str) -> dict:
    premis = estat.get("premis", PREMIS_DEFAULT)
    premi = next((p for p in premis if p["id"] == premis_id), None)
    if premi and pot_bescanviar(estat, kid, premi["cost"]):
        estat.setdefault("punts", {})[kid] -= premi["cost"]
        estat.setdefault("premis_bescanviats", []).append({"premi": premis_id, "nena": kid})
    return estat


def guardar(estat: dict) -> None:
    save_estat(estat)
