"""Carrega i desat de la configuracio i l'estat (fitxers JSON o Postgres)."""

from __future__ import annotations

import os

from familia.storage import DATA_DIR, desa, llegeix

BASE_DIR = os.path.dirname(DATA_DIR)
FESTIUS_FILE = os.path.join(DATA_DIR, "festius.json")

DIES = ["dl", "dt", "dc", "dj", "dv", "ds", "dg"]
DIES_NOM = {
    "dl": "Dilluns", "dt": "Dimarts", "dc": "Dimecres",
    "dj": "Dijous", "dv": "Divendres", "ds": "Dissabte", "dg": "Diumenge",
}
CAP_DE_SETMANA = {"ds", "dg"}

ESTAT_DEFAULT = {"setmana": None, "checkins": {}, "punts": {}, "premis": []}


def load_config() -> dict:
    return llegeix("config", {})


def save_config(cfg: dict) -> None:
    desa("config", cfg)


def load_festius() -> dict:
    """Els festius son un fitxer de nomes lectura inclos al repositori."""
    if not os.path.exists(FESTIUS_FILE):
        return {}
    try:
        import json

        with open(FESTIUS_FILE, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (ValueError, OSError):
        return {}


def load_menu() -> dict:
    return llegeix("menu", {})


def save_menu(menu: dict) -> None:
    desa("menu", menu)


def load_estat() -> dict:
    return llegeix("estat", dict(ESTAT_DEFAULT))


def save_estat(estat: dict) -> None:
    desa("estat", estat)


def adults(cfg: dict) -> list[dict]:
    return cfg.get("familia", {}).get("adults", [])


def nens(cfg: dict) -> list[dict]:
    return cfg.get("familia", {}).get("nens", [])


def nom_membre(cfg: dict, mid: str) -> str:
    for m in adults(cfg) + nens(cfg):
        if m.get("id") == mid:
            return m.get("nom", mid)
    return {"familia": "Familia", "nens": "Nenes"}.get(mid, mid)
