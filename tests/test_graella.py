from datetime import date

from familia import app


def test_text_sobre_tria_contrast():
    assert app._text_sobre("#ffffff") == "#1a1a1a"
    assert app._text_sobre("#000000") == "#ffffff"


def test_chips_inclou_titol_i_color():
    ev = {"titol": "Dentista", "hora_inici": "18:00", "hora_fi": "19:00",
          "tot_el_dia": False, "color": "#d62728"}
    h = app._chips([ev])
    assert "Dentista" in h
    assert "18:00" in h
    assert "#d62728" in h


def test_chips_afegeix_contador_si_sobren():
    evs = [{"titol": f"E{i}", "tot_el_dia": True} for i in range(5)]
    h = app._chips(evs, max_chips=2)
    assert "+3 mes" in h


def test_chips_escapa_html():
    ev = {"titol": "<b>hola</b>", "tot_el_dia": True}
    h = app._chips([ev])
    assert "&lt;b&gt;" in h
    assert "<b>hola</b>" not in h


def test_linia_event_marca_color_i_trunca():
    ev = {"titol": "Un titol molt llarg aqui", "tot_el_dia": True, "color": "#d62728"}
    linia = app._linia_event(ev)
    assert linia.startswith("🟥")
    assert "…" in linia


def test_etiqueta_cella_sempre_quatre_linies():
    lab = app._etiqueta_cella(date(2030, 1, 1))
    assert lab.count("\n") == 3

