"""Motor de tasques: tasques fixos de la setmana, rotacio i assignacio per horari."""

from __future__ import annotations

from datetime import date

from familia.calendari import es_festiu, festiu, setmana_key
from familia.config import CAP_DE_SETMANA, DIES_NOM, adults, nens

# (id, nom, dies, tipus, rotatiu)
# tipus: 'rotatiu' (es reparteixen), 'familia' (ho fan tots dos),
#        'escola' (s'assigna per disponibilitat), 'nenes' (les nenes)
TASQUES_DEFAULT = [
    {"id": "super", "nom": "Comprar al super", "dies": ["ds"], "tipus": "rotatiu"},
    {"id": "esmorzars", "nom": "Preparar els esmorzars", "dies": ["dl", "dt", "dc", "dj", "dv"], "tipus": "rotatiu"},
    {"id": "sopars", "nom": "Cuinar el sopar", "dies": ["dl", "dt", "dc", "dj", "dv", "ds", "dg"], "tipus": "rotatiu"},
    {"id": "portar_cole", "nom": "Portar les nenes a l'escola", "dies": ["dl", "dt", "dc", "dj", "dv"], "tipus": "escola"},
    {"id": "recollir_cole", "nom": "Recollir les nenes de l'escola", "dies": ["dl", "dt", "dc", "dj", "dv"], "tipus": "escola"},
    {"id": "dormir", "nom": "Posar les nenes a dormir", "dies": ["dl", "dt", "dc", "dj", "dv", "ds", "dg"], "tipus": "rotatiu"},
    {"id": "roba", "nom": "Rentar i plegar la roba", "dies": ["dl", "dj", "ds"], "tipus": "rotatiu"},
    {"id": "neteja", "nom": "Netejar banys i cuina", "dies": ["ds"], "tipus": "familia"},
    {"id": "brossa", "nom": "Treure la brossa i reciclatge", "dies": ["dl", "dj"], "tipus": "rotatiu"},
    {"id": "deures", "nom": "Deures / estudi amb les nenes", "dies": ["dl", "dt", "dc", "dj"], "tipus": "rotatiu"},
    {"id": "mascota", "nom": "Cuidar la mascota", "dies": ["dl", "dt", "dc", "dj", "dv", "ds", "dg"], "tipus": "rotatiu"},
]

TASQUES_NENES = [
    {"id": "llit", "nom": "Fer el llit", "punts": 2, "dies": ["dl", "dt", "dc", "dj", "dv"]},
    {"id": "habitacio", "nom": "Recollir l'habitacio", "punts": 3, "dies": ["dl", "dt", "dc", "dj", "dv", "ds"]},
    {"id": "deures_nena", "nom": "Fer els deures", "punts": 3, "dies": ["dl", "dt", "dc", "dj"]},
    {"id": "taula", "nom": "Parar / desparar la taula", "punts": 2, "dies": ["dl", "dt", "dc", "dj", "dv", "ds", "dg"]},
    {"id": "dents", "nom": "Rentar-se les dents", "punts": 1, "dies": ["dl", "dt", "dc", "dj", "dv", "ds", "dg"]},
]

HORA_ENTRADA = "08:45"
HORA_SORTIDA = "17:00"


def _minuts(hhmm: str) -> int:
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def _dins(finestra, hora: str) -> bool:
    if not finestra:
        return False
    return _minuts(finestra[0]) <= _minuts(hora) <= _minuts(finestra[1])


def disponible(adult: dict, dia: str, hora: str) -> bool:
    """True si l'adult no es fora de casa en aquella hora."""
    h = adult.get("horari", {}).get(dia, {})
    return not _dins(h.get("fora"), hora)


def _owner_rotatiu(adults_list: list[dict], week: str, idx: int) -> str:
    if not adults_list:
        return "familia"
    num = int(week.split("-W")[1])
    return adults_list[(num + idx) % len(adults_list)]["id"]


def _assigna_escola(adults_list: list[dict], dia: str, hora: str, n_assignats: dict) -> tuple[str, bool]:
    lliures = [a["id"] for a in adults_list if disponible(a, dia, hora)]
    if not lliures:
        return (adults_list[0]["id"] if adults_list else "familia"), False
    lliures.sort(key=lambda mid: n_assignats.get(mid, 0))
    return lliures[0], True


def generate_setmana(cfg: dict, dia: date) -> list[dict]:
    """Genera totes les tasques de la setmana del dia donat, amb l'assignacio feta."""
    from familia.calendari import dies_setmana

    adults_list = adults(cfg)
    nens_list = nens(cfg)
    week = setmana_key(dia)
    dies = dies_setmana(dia)

    files: list[dict] = []
    n_assignats: dict[str, int] = {a["id"]: 0 for a in adults_list}

    for idx, t in enumerate(TASQUES_DEFAULT):
        for d in t["dies"]:
            data_dia = dies[d]
            if es_festiu(data_dia) and t["id"] in ("portar_cole", "recollir_cole", "deures"):
                continue
            if t["tipus"] == "escola":
                hora = HORA_ENTRADA if t["id"] == "portar_cole" else HORA_SORTIDA
                assignat, ok = _assigna_escola(adults_list, d, hora, n_assignats)
                n_assignats[assignat] = n_assignats.get(assignat, 0) + 1
                nota = "" if ok else "Cal organitzar-se (ningu lliure en aquesta hora)"
            elif t["tipus"] == "familia":
                assignat, nota = "familia", "Ho feu tots dos junts"
            else:
                assignat, nota = _owner_rotatiu(adults_list, week, idx), ""
            files.append({
                "task_id": t["id"], "nom": t["nom"], "dia": d,
                "assignat": assignat, "tipus": t["tipus"], "nota": nota,
                "festiu": festiu(data_dia)["nom"] if festiu(data_dia) else None,
            })

    for idx, t in enumerate(TASQUES_NENES):
        for i, nen in enumerate(nens_list):
            for d in t["dies"]:
                if d in CAP_DE_SETMANA and t["id"] in ("deures_nena",):
                    continue
                files.append({
                    "task_id": f"{t['id']}_{nen['id']}", "nom": t["nom"], "dia": d,
                    "assignat": nen["id"], "tipus": "nenes", "punts": t["punts"], "nota": "",
                })
    return files


def solapaments_extraescolars(cfg: dict) -> list[str]:
    """Detecta activitats de la mateixa nena que se solapen el mateix dia."""
    avisos = []
    ex = cfg.get("extraescolars", [])
    for i in range(len(ex)):
        for j in range(i + 1, len(ex)):
            a, b = ex[i], ex[j]
            if a["nina"] != b["nina"] or a["dia"] != b["dia"]:
                continue
            if _minuts(a["inici"]) < _minuts(b["fi"]) and _minuts(b["inici"]) < _minuts(a["fi"]):
                avisos.append(
                    f"{a['nom']} ({a['inici']}-{a['fi']}) xoca amb {b['nom']} "
                    f"({b['inici']}-{b['fi']}) el {DIES_NOM[a['dia']]}"
                )
    return avisos


def resum_avisos(cfg: dict) -> list[str]:
    avisos = solapaments_extraescolars(cfg)
    for a in adults(cfg):
        if a.get("per_definir"):
            avisos.append(f"Falta definir l'horari de {a['nom']} (ara es considera lliure).")
    return avisos
