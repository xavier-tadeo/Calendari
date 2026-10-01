"""Emmagatzematge de dades: fitxers JSON en local o Postgres al nuvol.

Si hi ha una URL de Postgres (variable d'entorn FAMILIA_DB_URL o
st.secrets["postgres"]["url"]) es fa servir el nuvol; si no, fitxers JSON.
Aixi la app funciona igual en local i a Streamlit Cloud.
"""

from __future__ import annotations

import json
import os
from functools import lru_cache

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

FILES = {
    "config": "config.json",
    "menu": "menu.json",
    "estat": "estat.json",
    "esdeveniments": "esdeveniments.json",
}

_TAULA = "familia_store"


def _url() -> str | None:
    url = os.environ.get("FAMILIA_DB_URL")
    if url:
        return url
    try:
        import streamlit as st

        return st.secrets.get("postgres", {}).get("url")
    except Exception:  # noqa: BLE001
        return None


def _local_path(clau: str) -> str:
    return os.path.join(DATA_DIR, FILES[clau])


def _llegeix_local(clau: str, default):
    return _llegeix_fitxer(_local_path(clau), default)


def _llegeix_fitxer(path: str, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return default


def _desa_local(clau: str, dades) -> None:
    path = _local_path(clau)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(dades, fh, ensure_ascii=False, indent=2)


@lru_cache(maxsize=4)
def _engine(url: str):
    from sqlalchemy import create_engine

    return create_engine(url, pool_pre_ping=True)


def _table(engine):
    from sqlalchemy import JSON, Column, DateTime, MetaData, String, Table, func

    meta = MetaData()
    taula = Table(
        _TAULA,
        meta,
        Column("clau", String(50), primary_key=True),
        Column("dades", JSON),
        Column("actualitzat", DateTime, server_default=func.now()),
    )
    meta.create_all(engine, checkfirst=True)
    return taula


def llegeix(clau: str, default=None):
    """Llegeix les dades d'una clau. Al nuvol, si no hi ha res, cau al fitxer local."""
    url = _url()
    if not url:
        return _llegeix_local(clau, default)
    from sqlalchemy import select

    engine = _engine(url)
    taula = _table(engine)
    with engine.connect() as conn:
        fila = conn.execute(select(taula.c.dades).where(taula.c.clau == clau)).fetchone()
    if fila is None:
        return _llegeix_local(clau, default)
    return fila[0]


def desa(clau: str, dades) -> None:
    """Desa les dades d'una clau (fitxer local o Postgres)."""
    url = _url()
    if not url:
        _desa_local(clau, dades)
        return
    from sqlalchemy import delete, insert

    engine = _engine(url)
    taula = _table(engine)
    with engine.begin() as conn:
        conn.execute(delete(taula).where(taula.c.clau == clau))
        conn.execute(insert(taula).values(clau=clau, dades=dades))


def en_nuvol() -> bool:
    return bool(_url())
