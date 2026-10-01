from datetime import date

from familia.esdeveniments import ocorre, ordenats


def _ev(**kw):
    base = {"data": "2026-10-01", "recurrencia": "cap", "tot_el_dia": True}
    base.update(kw)
    return base


def test_event_puntual_nomes_el_seu_dia():
    ev = _ev(data="2026-10-01")
    assert ocorre(ev, date(2026, 10, 1))
    assert not ocorre(ev, date(2026, 10, 2))
    assert not ocorre(ev, date(2026, 9, 30))


def test_recurrencia_setmanal():
    ev = _ev(data="2026-10-01", recurrencia="setmanal")  # dijous
    assert ocorre(ev, date(2026, 10, 8))
    assert not ocorre(ev, date(2026, 10, 9))
    assert not ocorre(ev, date(2026, 9, 24))  # abans de l'inici


def test_recurrencia_diaria():
    ev = _ev(data="2026-10-01", recurrencia="diari")
    assert ocorre(ev, date(2026, 10, 1))
    assert ocorre(ev, date(2026, 11, 15))


def test_data_fi_atura_la_recurrencia():
    ev = _ev(data="2026-10-01", recurrencia="diari", fins="2026-10-05")
    assert ocorre(ev, date(2026, 10, 5))
    assert not ocorre(ev, date(2026, 10, 6))


def test_recurrencia_mensual_ajusta_dia_inexistent():
    ev = _ev(data="2026-01-31", recurrencia="mensual")
    assert ocorre(ev, date(2026, 2, 28))  # febrer no te 31 -> ultim dia


def test_ordenats_tot_el_dia_primer():
    evs = [
        _ev(data="2026-10-01", tot_el_dia=False, hora_inici="18:00"),
        _ev(data="2026-10-01", tot_el_dia=True),
    ]
    assert ordenats(evs)[0]["tot_el_dia"] is True
