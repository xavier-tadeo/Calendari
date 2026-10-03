"""Dashboard de la Familia Tadeo Cabezas (Streamlit, catala)."""

from __future__ import annotations

import hmac
import html
import os
import sys
from datetime import date, time

import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from familia import esdeveniments as ev_mod
from familia import menu as menu_mod
from familia import punts as punts_mod
from familia.calendari import (
    dies_setmana,
    es_festiu,
    festiu,
    graella_mes,
    nom_mes,
    setmana_anterior,
    setmana_key,
    setmana_seguent,
)
from familia.config import (
    DIES,
    DIES_NOM,
    adults,
    load_config,
    load_estat,
    nens,
    save_config,
    save_estat,
)
from familia.esdeveniments import COLOR_NOMS, PALETA, RECURRENCIES
from familia.tasques import generate_setmana, resum_avisos

st.set_page_config(page_title="Familia Tadeo Cabezas", page_icon="🏠", layout="wide")


def _password_gate() -> bool:
    """Si hi ha contrasenya als secrets, demana-la abans de mostrar res."""
    try:
        pwd = st.secrets.get("auth", {}).get("password")
    except Exception:  # noqa: BLE001
        pwd = None
    if not pwd:
        return True
    if st.session_state.get("_auth_ok"):
        return True
    st.title("🔒 Familia Tadeo Cabezas")
    st.caption("Aquest tauler es privat. Introdueix la contrasenya per entrar.")
    with st.form("login"):
        entrat = st.text_input("Contrasenya", type="password")
        ok = st.form_submit_button("Entrar", type="primary")
    if ok:
        if hmac.compare_digest(entrat, pwd):
            st.session_state["_auth_ok"] = True
            st.rerun()
        else:
            st.error("Contrasenya incorrecta.")
    return False


def init_state() -> None:
    if "cfg" not in st.session_state:
        st.session_state["cfg"] = load_config()
    if "estat" not in st.session_state:
        st.session_state["estat"] = load_estat()
    if "setmana_ref" not in st.session_state:
        st.session_state["setmana_ref"] = date.today()
    if "dia_sel" not in st.session_state:
        st.session_state["dia_sel"] = date.today().isoformat()
    if "mes_offset" not in st.session_state:
        st.session_state["mes_offset"] = 0
    if "mini_offset" not in st.session_state:
        st.session_state["mini_offset"] = 0


try:
    init_state()
except Exception as e:  # noqa: BLE001
    st.error(f"Error connectant amb la base de dades: {type(e).__name__}: {e}")
    st.stop()
cfg = st.session_state["cfg"]
estat = st.session_state["estat"]

ADULTS = {a["id"]: a for a in adults(cfg)}
NENS = {n["id"]: n for n in nens(cfg)}
MEMBRES = adults(cfg) + nens(cfg)
COLORS = {m["id"]: m.get("color", "#888") for m in MEMBRES}
NOMS = {m["id"]: m.get("nom", m["id"]) for m in MEMBRES}
NOMS["familia"] = "Familia"
NOMS["nens"] = "Nenes"

ETIQUETES_COLOR = {
    **{m["id"]: f"{m['nom']} (equip)" for m in MEMBRES},
}


def xip(mid: str) -> str:
    return f":{'orange' if mid == 'familia' else 'blue'}[{NOMS.get(mid, mid)}]"


def capcalera() -> None:
    st.title("🏠 Familia Tadeo Cabezas")
    st.caption("Calendari editat, repartiment de tasques i calendari de Catalunya / Barcelona")


def _mini_calendari(ref: date) -> None:
    mort = st.session_state.get("mini_offset", 0)
    total = (ref.year * 12 + ref.month - 1) + mort
    many, mmes = total // 12, total % 12 + 1
    c1, c2, c3 = st.columns([1, 4, 1])
    if c1.button("◀", key="mini_prev", width="stretch"):
        st.session_state["mini_offset"] = mort - 1
        st.rerun()
    c2.markdown(
        f"<div style='text-align:center;font-weight:700'>🗓️ {nom_mes(many, mmes)}</div>",
        unsafe_allow_html=True,
    )
    if c3.button("▶", key="mini_next", width="stretch"):
        st.session_state["mini_offset"] = mort + 1
        st.rerun()
    sel = st.session_state["dia_sel"]
    avui_iso = date.today().isoformat()
    caps = st.columns(7, gap="small")
    for i, d in enumerate(DIES):
        caps[i].markdown(
            f"<div style='text-align:center;font-size:0.6rem;color:#888'>{DIES_NOM[d][:2]}</div>",
            unsafe_allow_html=True,
        )
    for fila in graella_mes(many, mmes):
        cols = st.columns(7, gap="small")
        for i, d in enumerate(fila):
            with cols[i]:
                if d is None:
                    st.write("")
                    continue
                iso = d.isoformat()
                marques = []
                if es_festiu(d):
                    marques.append("🎉 Festiu")
                es = ev_mod.del_dia(d)
                if es:
                    marques.append(f"{len(es)} esdeveniment(s)")
                etiqueta = f"**{d.day}**" if iso == avui_iso else str(d.day)
                if st.button(etiqueta, key=f"mini_{iso}", width="stretch",
                             type="primary" if iso == sel else "secondary",
                             help=" · ".join(marques) or None):
                    st.session_state["dia_sel"] = iso
                    st.session_state["mes_offset"] = (
                        (d.year * 12 + d.month - 1) - (ref.year * 12 + ref.month - 1)
                    )
                    st.rerun()


def sidebar() -> date:
    with st.sidebar:
        st.header("Navegacio")
        ref = st.session_state["setmana_ref"]
        c1, c2, c3 = st.columns(3)
        if c1.button("◀ setm.", width="stretch"):
            st.session_state["setmana_ref"] = setmana_anterior(ref)
            st.rerun()
        if c3.button("setm. ▶", width="stretch"):
            st.session_state["setmana_ref"] = setmana_seguent(ref)
            st.rerun()
        c2.markdown("**Avui**")
        dies = dies_setmana(ref)
        st.markdown(f"**Setmana {setmana_key(ref)}**")
        st.caption(f"{dies['dl'].strftime('%d/%m')} – {dies['dg'].strftime('%d/%m/%Y')}")
        if st.button("Tornar a avui", width="stretch"):
            st.session_state["setmana_ref"] = date.today()
            st.session_state["dia_sel"] = date.today().isoformat()
            st.session_state["mes_offset"] = 0
            st.session_state["mini_offset"] = 0
            st.rerun()

        st.markdown("---")
        _mini_calendari(ref)

        st.markdown("---")
        st.markdown("**Equip**")
        for m in MEMBRES:
            st.markdown(
                f"<span style='color:{COLORS[m['id']]};font-weight:700'>●</span> {m['nom']}",
                unsafe_allow_html=True,
            )

        avisos = resum_avisos(cfg)
        if avisos:
            st.markdown("---")
            st.markdown("**Avisos**")
            for a in avisos:
                st.warning(a, icon="⚠️")
    return st.session_state["setmana_ref"]


def _etiqueta_dia(d: date) -> str:
    parts = [str(d.day)]
    if es_festiu(d):
        parts.append("🎉")
    es = ev_mod.del_dia(d)
    if es:
        parts.append("●" * min(len(es), 3))
    return " ".join(parts)


def _recordatoris() -> None:
    avui = date.today()
    propers = ev_mod.propers(avui, dies=1)
    if not propers:
        return
    st.markdown("**🔔 Recordatoris**")
    for d, e in propers:
        etiqueta = "Avui" if d == avui else "Dema"
        hora = "" if e.get("tot_el_dia", True) else f" {e.get('hora_inici', '')}"
        st.warning(f"{etiqueta}: **{e['titol']}**{hora}"
                   + (f" · {e['lloc']}" if e.get("lloc") else ""), icon="🔔")


@st.dialog("Esdeveniment", width="large")
def _dialog_event(dia: date, ev: dict | None = None) -> None:
    _cos_formulari(dia, ev)


def _cos_formulari(dia: date, ev: dict | None = None) -> None:
    editing = ev is not None
    st.caption(f"{DIES_NOM[DIES[dia.weekday()]]} {dia.strftime('%d/%m/%Y')}")
    with st.form(key=f"form_ev_{dia.isoformat()}_{ev['id'] if editing else 'nou'}"):
        titol = st.text_input("Títol", value=ev.get("titol", "") if editing else "")
        c1, c2 = st.columns(2)
        tot_el_dia = c1.checkbox("Tot el dia", value=ev.get("tot_el_dia", True) if editing else True)
        h_inici = c2.time_input("Hora inici", value=_hora(ev, "hora_inici") if editing else time(17, 0))
        h_fi = c2.time_input("Hora fi", value=_hora(ev, "hora_fi") if editing else time(18, 0))
        d1, d2 = st.columns(2)
        opcions_persona = ["(ningu)"] + [m["id"] for m in MEMBRES]
        idx_persona = opcions_persona.index(ev.get("persona") or "(ningu)") if editing else 0
        persona = d1.selectbox("Persona", opcions_persona, index=idx_persona,
                               format_func=lambda x: "—" if x == "(ningu)" else NOMS.get(x, x))
        opcions_color = ["(automatic)"] + PALETA
        idx_color = opcions_color.index(ev.get("color")) if editing and ev.get("color") in PALETA else 0
        color = d2.selectbox("Color", opcions_color, index=idx_color,
                             format_func=lambda c: "segons la persona" if c == "(automatic)"
                             else f"{COLOR_NOMS.get(c, c)} · {c}")
        rec_opcions = list(RECURRENCIES.keys())
        idx_rec = rec_opcions.index(ev.get("recurrencia", "cap")) if editing else 0
        rec = st.selectbox("Recurrencia", rec_opcions, index=idx_rec,
                           format_func=lambda r: RECURRENCIES[r])
        d3, d4 = st.columns(2)
        te_fi = d3.checkbox("Te data fi", value=bool(ev.get("fins")) if editing else False)
        fins = d4.date_input("Data fi", value=_data(ev.get("fins")) if editing and ev.get("fins") else dia)
        lloc = st.text_input("Lloc", value=ev.get("lloc", "") if editing else "")
        nota = st.text_area("Nota", value=ev.get("nota", "") if editing else "")

        b1, b2 = st.columns([1, 1])
        guardar = b1.form_submit_button("💾 Desa" if editing else "➕ Afegeix", width="stretch")
        cancel = b2.form_submit_button("Cancel·la", width="stretch")

    if cancel:
        st.rerun()
    if guardar and titol.strip():
        dades = {
            "data": ev.get("data", dia.isoformat()) if editing else dia.isoformat(),
            "tot_el_dia": tot_el_dia,
            "hora_inici": h_inici.strftime("%H:%M"),
            "hora_fi": h_fi.strftime("%H:%M"),
            "persona": None if persona == "(ningu)" else persona,
            "color": None if color == "(automatic)" else color,
            "recurrencia": rec,
            "fins": fins.isoformat() if te_fi else "",
            "lloc": lloc.strip(),
            "nota": nota.strip(),
            "titol": titol.strip(),
        }
        if editing:
            ev_mod.actualitzar(ev["id"], dades)
        else:
            ev_mod.afegir(dades)
        st.rerun()


def _color_event(ev: dict) -> str:
    if ev.get("color"):
        return ev["color"]
    if ev.get("persona"):
        return COLORS.get(ev["persona"], PALETA[0])
    return PALETA[0]


def _hora(ev: dict, camp: str) -> time:
    try:
        h, m = (ev.get(camp) or "17:00").split(":")
        return time(int(h), int(m))
    except (ValueError, TypeError):
        return time(17, 0)


def _data(iso: str):
    return date.fromisoformat(iso)


def _text_sobre(color: str) -> str:
    try:
        h = color.lstrip("#")
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    except (ValueError, IndexError):
        return "#ffffff"
    llum = 0.299 * r + 0.587 * g + 0.114 * b
    return "#ffffff" if llum < 150 else "#1a1a1a"


def _chips(events: list[dict], max_chips: int = 3) -> str:
    out = []
    for e in events[:max_chips]:
        c = _color_event(e)
        txt = _text_sobre(c)
        hora = "" if e.get("tot_el_dia", True) else f"{e.get('hora_inici', '')} "
        titol = html.escape(str(e.get("titol", "")))
        out.append(
            f"<div style='background:{c};color:{txt};border-radius:4px;padding:1px 5px;"
            f"margin-top:3px;font-size:0.72rem;line-height:1.3;white-space:nowrap;"
            f"overflow:hidden;text-overflow:ellipsis' title='{titol}'>{hora}{titol}</div>"
        )
    if len(events) > max_chips:
        out.append(f"<div style='font-size:0.66rem;color:#666;margin-top:2px'>+{len(events) - max_chips} mes</div>")
    return "".join(out)


EMOJI_COLOR = {
    "#1f77b4": "🟦",
    "#d62728": "🟥",
    "#2ca02c": "🟩",
    "#ff7f0e": "🟧",
    "#9467bd": "🟪",
    "#8c564b": "🟫",
    "#e377c2": "🟪",
    "#17becf": "🔵",
    "#bcbd22": "🟨",
    "#7f7f7f": "⬜",
}

_LINIA_BUIDA = "\u200b"


def _linia_event(e: dict) -> str:
    marca = EMOJI_COLOR.get(_color_event(e), "⬜")
    hora = "" if e.get("tot_el_dia", True) else f"{e.get('hora_inici', '')} "
    titol = str(e.get("titol", ""))
    if len(titol) > 11:
        titol = titol[:10] + "…"
    return f"{marca} {hora}{titol}"


def _etiqueta_cella(d: date) -> str:
    evs = ev_mod.ordenats(ev_mod.del_dia(d))
    linies = [f"**{d.day}**" + (" 🎉" if es_festiu(d) else "")]
    if len(evs) > 3:
        linies.append(_linia_event(evs[0]))
        linies.append(_linia_event(evs[1]))
        linies.append(f"+{len(evs) - 2} mes")
    else:
        for e in evs:
            linies.append(_linia_event(e))
    while len(linies) < 4:
        linies.append(_LINIA_BUIDA)
    return "  \n".join(linies)


def _render_mes(any_: int, mes: int) -> date | None:
    clicat = None
    sel = st.session_state["dia_sel"]
    caps = st.columns(7)
    for i, d in enumerate(DIES):
        caps[i].markdown(
            f"<div style='text-align:center;font-size:0.72rem;color:#555;font-weight:600'>"
            f"{DIES_NOM[d][:3]}</div>",
            unsafe_allow_html=True,
        )
    for fila in graella_mes(any_, mes):
        cols = st.columns(7)
        for i, d in enumerate(fila):
            with cols[i]:
                if d is None:
                    st.write("")
                    continue
                ajuda = " · ".join(
                    ("" if e.get("tot_el_dia", True) else f"{e.get('hora_inici', '')} ")
                    + str(e.get("titol", ""))
                    for e in ev_mod.ordenats(ev_mod.del_dia(d))
                )
                if st.button(_etiqueta_cella(d), key=f"cal_{d.isoformat()}", width="stretch",
                             type="primary" if d.isoformat() == sel else "secondary",
                             help=ajuda or None):
                    clicat = d
    return clicat


def _bloc_events(dia: date, prefix: str = "", reaixecar: bool = False) -> None:
    evs = ev_mod.ordenats(ev_mod.del_dia(dia))
    if not evs:
        st.caption("Cap esdeveniment aquest dia.")
        return
    for e in evs:
        color = _color_event(e)
        hora = "Tot el dia" if e.get("tot_el_dia", True) else f"{e.get('hora_inici')}–{e.get('hora_fi')}"
        persona = NOMS.get(e.get("persona"), "—") if e.get("persona") else "—"
        with st.container(border=True):
            cc1, cc2, cc3 = st.columns([6, 1, 1])
            cc1.markdown(
                f"<div style='border-left:6px solid {color};padding-left:8px'>"
                f"<b>{html.escape(str(e['titol']))}</b><br><span style='font-size:0.85em'>{hora} · {persona}"
                + (f" · 📍 {html.escape(str(e['lloc']))}" if e.get("lloc") else "")
                + (f"<br>{html.escape(str(e['nota']))}" if e.get("nota") else "")
                + (f"<br><i>🔁 {RECURRENCIES.get(e.get('recurrencia', 'cap'), '')}</i>"
                   if e.get("recurrencia", "cap") != "cap" else "")
                + "</span></div>", unsafe_allow_html=True)
            if cc2.button("✏️", key=f"{prefix}edit_{e['id']}", help="Editar"):
                st.session_state["_form_ev"] = (dia.isoformat(), e["id"])
                st.rerun()
            if cc3.button("🗑️", key=f"{prefix}del_{e['id']}", help="Esborrar"):
                ev_mod.esborrar(e["id"])
                if reaixecar:
                    st.session_state["_resum"] = dia.isoformat()
                st.rerun()


def _bloc_tasques(dia: date) -> None:
    files = [t for t in generate_setmana(cfg, dia)
             if t["dia"] == DIES[dia.weekday()] and t["tipus"] != "nenes"]
    if files:
        st.markdown("**Tasques de casa**")
        for t in files:
            color = COLORS.get(t["assignat"], "#888")
            st.markdown(
                f"<div style='border-left:4px solid {color};padding-left:8px;margin-bottom:4px'>"
                f"{html.escape(t['nom'])} · "
                f"<span style='color:{color}'>{NOMS.get(t['assignat'], t['assignat'])}</span></div>",
                unsafe_allow_html=True,
            )
    extras = [x for x in cfg.get("extraescolars", []) if x["dia"] == DIES[dia.weekday()]]
    if extras:
        st.markdown("**Extraescolars**")
        for e in extras:
            st.markdown(
                f"<div style='background:#fff3cd;border-radius:6px;padding:4px 8px;margin-bottom:4px'>"
                f"🎒 {html.escape(e['nom'])} {e['inici']}–{e['fi']} · "
                f"{NOMS.get(e['nina'], e['nina'])}</div>",
                unsafe_allow_html=True,
            )


@st.dialog("Resum del dia", width="large")
def _dialog_resum(dia: date) -> None:
    st.markdown(f"### {DIES_NOM[DIES[dia.weekday()]]} {dia.strftime('%d/%m/%Y')}")
    f_info = festiu(dia)
    if f_info:
        st.info(f"🎉 **{f_info['nom']}** ({f_info['tipus']})", icon="🎉")
    st.markdown("**Esdeveniments**")
    _bloc_events(dia, prefix="dlg_", reaixecar=True)
    st.markdown("---")
    _bloc_tasques(dia)
    st.markdown("---")
    if st.button("➕ Afegir esdeveniment", type="primary", width="stretch", key="dlg_add"):
        st.session_state["_form"] = dia.isoformat()
        st.rerun()


def vista_calendari(ref: date) -> None:
    any_, mes = ref.year, ref.month
    off = st.session_state["mes_offset"]
    total = (any_ * 12 + (mes - 1)) + off
    any_, mes = total // 12, total % 12 + 1

    c1, c2, c3 = st.columns([1, 5, 1])
    if c1.button("◀ mes", width="stretch"):
        st.session_state["mes_offset"] = off - 1
        st.rerun()
    c2.subheader(f"📆 {nom_mes(any_, mes)}")
    if c3.button("mes ▶", width="stretch"):
        st.session_state["mes_offset"] = off + 1
        st.rerun()

    _recordatoris()

    clicat = _render_mes(any_, mes)
    if clicat:
        st.session_state["dia_sel"] = clicat.isoformat()
        st.session_state["_resum"] = clicat.isoformat()
        st.rerun()
    st.caption("Fes clic a un dia per veure'n el resum. Fes clic a ✏️ per editar o 🗑️ per esborrar.")

    st.markdown("---")
    dia = date.fromisoformat(st.session_state["dia_sel"])
    f_info = festiu(dia)
    cap = f"{DIES_NOM[DIES[dia.weekday()]]} {dia.strftime('%d/%m/%Y')}"
    st.subheader(cap)
    if f_info:
        st.info(f"🎉 **{f_info['nom']}** ({f_info['tipus']})", icon="🎉")

    _bloc_events(dia)
    if st.button("➕ Afegir esdeveniment aquest dia", type="primary", key="main_add"):
        st.session_state["_form"] = dia.isoformat()
        st.rerun()

    st.markdown("---")
    st.markdown("#### 🧹 I a mes, aquest dia toca...")
    _bloc_tasques(dia)

    resum_pend = st.session_state.pop("_resum", None)
    form_pend = st.session_state.pop("_form", None)
    form_ev_pend = st.session_state.pop("_form_ev", None)
    if form_ev_pend:
        iso, eid = form_ev_pend
        ev = next((e for e in ev_mod.tots() if e["id"] == eid), None)
        if ev:
            _dialog_event(date.fromisoformat(iso), ev)
    elif form_pend:
        _dialog_event(date.fromisoformat(form_pend))
    elif resum_pend:
        _dialog_resum(date.fromisoformat(resum_pend))


def vista_setmana(ref: date) -> None:
    dies = dies_setmana(ref)
    st.subheader(f"Setmana {setmana_key(ref)} · {dies['dl'].strftime('%d/%m')} – {dies['dg'].strftime('%d/%m')}")
    files = [t for t in generate_setmana(cfg, ref) if t["tipus"] != "nenes"]
    cols = st.columns(7)
    for i, d in enumerate(DIES):
        data = dies[d]
        with cols[i]:
            festiu_mark = " 🎉" if es_festiu(data) else ""
            st.markdown(f"**{DIES_NOM[d][:3]} {data.strftime('%d')}{festiu_mark}**")
            for t in [x for x in files if x["dia"] == d]:
                color = COLORS.get(t["assignat"], "#888")
                st.markdown(
                    f"<div style='border-left:4px solid {color};padding-left:6px;margin-bottom:4px;font-size:0.85em'>"
                    f"{t['nom']}<br><span style='color:{color}'>● {NOMS.get(t['assignat'], t['assignat'])}</span></div>",
                    unsafe_allow_html=True,
                )
            for e in [x for x in cfg.get("extraescolars", []) if x["dia"] == d]:
                st.markdown(
                    f"<div style='background:#fff3cd;border-radius:6px;padding:4px 6px;margin-bottom:4px;font-size:0.8em'>"
                    f"🎒 {e['nom']} {e['inici']}<br>{NOMS.get(e['nina'], e['nina'])}</div>",
                    unsafe_allow_html=True,
                )
            for e in ev_mod.ordenats(ev_mod.del_dia(data)):
                color = _color_event(e)
                st.markdown(
                    f"<div style='border-left:4px solid {color};padding-left:6px;margin-bottom:4px;font-size:0.8em'>"
                    f"📌 {e['titol']}</div>", unsafe_allow_html=True)


def vista_menu(ref: date) -> None:
    st.subheader("🛒 Menu setmanal i llista de la compra")
    menu = menu_mod.menu_actual()
    for d in DIES:
        dia = menu.setdefault(d, {"esmorzar": {"nom": "", "ingredients": []},
                                  "sopar": {"nom": "", "ingredients": []}})
        with st.expander(DIES_NOM[d]):
            dia["esmorzar"]["nom"] = st.text_input("Esmorzar", value=dia["esmorzar"]["nom"], key=f"esm_{d}")
            dia["sopar"]["nom"] = st.text_input("Sopar", value=dia["sopar"]["nom"], key=f"sop_{d}")
    if st.button("💾 Desa el menu"):
        menu_mod.desa_menu(menu)
        st.success("Menu desat.")

    st.markdown("---")
    extra_txt = st.text_area("Afegits manuals (un per linia)", key="compra_extra")
    extra = [x.strip() for x in extra_txt.splitlines() if x.strip()]
    llista = menu_mod.llista_compra(menu, extra)
    if llista:
        st.markdown("**Llista de la compra**")
        for ing, n in sorted(llista.items()):
            st.checkbox(f"{ing} × {n}" if n > 1 else ing, key=f"compra_{ing}")
    else:
        st.caption("Encara no hi ha ingredients al menu.")


def vista_punts(ref: date) -> None:
    st.subheader("⭐ Punts de les nenes")
    estat = punts_mod.assegura_setmana(cfg, st.session_state["estat"], ref)
    st.session_state["estat"] = estat
    files = [t for t in generate_setmana(cfg, ref) if t["tipus"] == "nenes"]

    for nen in nens(cfg):
        kid = nen["id"]
        saldo = estat.get("punts", {}).get(kid, 0)
        st.markdown(f"### ● {nen['nom']} — **{saldo} punts**")
        for d in DIES:
            tasques_dia = [t for t in files if t["dia"] == d and t["assignat"] == kid]
            if not tasques_dia:
                continue
            st.caption(DIES_NOM[d])
            for t in tasques_dia:
                clau = f"{kid}|{t['task_id']}|{d}"
                fet = clau in estat.get("checkins", {})
                marcat = st.checkbox(f"{t['nom']} (+{t['punts']})", value=fet, key=f"chk_{clau}")
                if marcat != fet:
                    punts_mod.marcar(estat, clau, kid, t["punts"], fet=marcat)
                    save_estat(estat)
                    st.rerun()
        st.markdown("**Premis**")
        for p in estat.get("premis", punts_mod.PREMIS_DEFAULT):
            pot = punts_mod.pot_bescanviar(estat, kid, p["cost"])
            c1, c2 = st.columns([4, 1])
            c1.markdown(f"{'🟢' if pot else '🔒'} {p['nom']} — {p['cost']} pts")
            if c2.button("Bescanviar", key=f"bes_{kid}_{p['id']}", disabled=not pot):
                punts_mod.bescanviar(estat, p["id"], kid)
                save_estat(estat)
                st.rerun()
        st.markdown("---")


def vista_config(ref: date) -> None:
    st.subheader("⚙️ Configuracio")
    st.caption("Editar familia, horaris i extraescolars. Es guarda a data/config.json.")
    for a in adults(cfg):
        with st.expander(f"🕗 Horari de {a['nom']}"):
            st.json(a.get("horari", {}))
            if a.get("per_definir"):
                st.warning("Horari pendent de definir (es considera lliure).", icon="⚠️")
    with st.expander("🎒 Extraescolars"):
        st.json(cfg.get("extraescolars", []))
    for w in resum_avisos(cfg):
        st.warning(w, icon="⚠️")
    sub = st.file_uploader("Pujar nou config.json", type=["json"])
    if sub is not None:
        try:
            import json
            nou = json.loads(sub.read().decode("utf-8"))
            st.session_state["cfg"] = nou
            save_config(nou)
            st.success("Configuracio actualitzada.")
            st.rerun()
        except Exception as e:  # noqa: BLE001
            st.error(f"No s'ha pogut llegir: {e}")


if not _password_gate():
    st.stop()

capcalera()
ref = sidebar()

tab_cal, tab_setmana, tab_menu, tab_punts, tab_config = st.tabs([
    "📆 Calendari", "🗓️ Setmana", "🛒 Menu i compra", "⭐ Punts nenes", "⚙️ Config",
])

with tab_cal:
    vista_calendari(ref)
with tab_setmana:
    vista_setmana(ref)
with tab_menu:
    vista_menu(ref)
with tab_punts:
    vista_punts(ref)
with tab_config:
    vista_config(ref)
