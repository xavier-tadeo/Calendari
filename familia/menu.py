"""Menu setmanal (esmorzars, dinars i sopars) i llista de la compra automatica."""

from __future__ import annotations

from familia.config import DIES, load_menu, save_menu

MENU_DEFAULT = {
    "dl": {"esmorzar": {"nom": "Llet, cereals i fruita", "ingredients": ["llet", "cereals", "fruita"]},
           "sopar": {"nom": "Truita i amanida", "ingredients": ["ous", "patates", "enciam", "tomàquet"]}},
    "dt": {"esmorzar": {"nom": "Torrades amb melmelada", "ingredients": ["pa", "melmelada", "mantega"]},
           "sopar": {"nom": "Llenties estofades", "ingredients": ["llenties", "pastanaga", "ceba", "salsitxes"]}},
    "dc": {"esmorzar": {"nom": "Iogurt amb fruits secs", "ingredients": ["iogurt", "nous", "ametlles"]},
           "sopar": {"nom": "Macarrons a la bolonyesa", "ingredients": ["macarrons", "carn picada", "tomàquet", "ceba"]}},
    "dj": {"esmorzar": {"nom": "Sandvitx de formatge", "ingredients": ["pa de motlle", "formatge"]},
           "sopar": {"nom": "Pollastre al forn amb verdures", "ingredients": ["pollastre", "carbassó", "patates", "ceba"]}},
    "dv": {"esmorzar": {"nom": "Fruita i galetes", "ingredients": ["fruita", "galetes"]},
           "sopar": {"nom": "Pizza casolana", "ingredients": ["massa de pizza", "formatge", "tomàquet", "pernil"]}},
    "ds": {"esmorzar": {"nom": "Esmorzar especial", "ingredients": ["pa", "xorico", "meló"]},
           "sopar": {"nom": "Arròs de verdures", "ingredients": ["arròs", "verdures", "brou"]}},
    "dg": {"esmorzar": {"nom": "Xocolata desfeta amb xurros", "ingredients": ["xocolata", "xurros"]},
           "sopar": {"nom": "Peix a la planxa amb amanida", "ingredients": ["salmó", "amanida"]}},
}


def menu_actual() -> dict:
    menu = load_menu()
    return menu if menu else MENU_DEFAULT


def desa_menu(menu: dict) -> None:
    save_menu(menu)


def validar(menu: dict) -> list[str]:
    """Retorna dies amb sopar o esmorzar buit."""
    avisos = []
    for d in DIES:
        dia = menu.get(d, {})
        if not dia.get("sopar", {}).get("nom"):
            avisos.append(f"{d}: falta el sopar")
        if not dia.get("esmorzar", {}).get("nom"):
            avisos.append(f"{d}: falta l'esmorzar")
    return avisos


def llista_compra(menu: dict, extra: list[str] | None = None) -> dict:
    """Agrega ingredients de tots els dies (compta repeticions) + llista manual."""
    compte: dict[str, int] = {}
    for d in DIES:
        dia = menu.get(d, {})
        for menjar in ("esmorzar", "dinar", "sopar"):
            for ing in dia.get(menjar, {}).get("ingredients", []):
                compte[ing] = compte.get(ing, 0) + 1
    for ing in extra or []:
        compte[ing] = compte.get(ing, 0) + 1
    return compte
