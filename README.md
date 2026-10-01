# Familia Tadeo Cabezas

Organitzador familiar per repartir les tasques de casa entre els dies de la
setmana, amb el calendari de festius de **Barcelona / Catalunya** i el mes en curs.

## Què fa

- **Calendari** (1a pestanya): vista de mes + llista del dia. Es pot **clicar
  qualsevol dia per escriure-hi esdeveniments** (títol, hora o tot el dia,
  persona, color, lloc, nota i recurrència opcional). Permet **editar i
  esborrar**. Mostra junt els esdeveniments, les tasques de casa i les
  extraescolars, amb els festius de Barcelona marcats (🎉) i recordatoris.
- **Setmana**: graella de dilluns a diumenge amb totes les tasques assignades.
- **Menu i compra**: menu setmanal (esmorzars i sopars) i llista de la compra
  generada automàticament dels ingredients.
- **Punts nenes**: check-in de les tasques de les nenes i bescanvi de premis
  (estil OurHome).
- **Config**: horaris dels adults, extraescolars i avisos.

## Colors

Els esdeveniments poden agafar el **color de l'equip** (Papa/Mama/Nenes) o bé
un color de la **paleta**; si no s'escull, s'agafa el de la persona.

## Regles del repartiment

- Les tasques **rotatives** s'alternen cada setmana entre els dos adults.
- Les tasques **d'escola** (portar/recollir) s'assignen a qui és disponible
  segons el seu horari (qui teletreballa pot portar-les).
- El **cap de setmana**: tasques de casa en família i un adult descansa.
- Si un dia és **festiu**, no hi ha tasques d'escola.

## Arrencar

```bash
make install     # crea el venv i instal·la dependencies
make run         # dashboard a http://localhost:8701
make test        # tests
```

## Dades editables

Els fitxers de `data/` són JSON i es poden editar a mà o des del dashboard:

- `config.json`: família, horaris, extraescolars i preferències.
- `festius.json`: festius de Barcelona (2026).
- `menu.json`: menu setmanal (es crea en desar-lo).
- `estat.json`: check-ins i punts (es crea sol).

## Pendents de definir

- Horari de la **Mama** (ara es considera lliure).
- Solapament de la Nena 2 el **dijous**: Training 17:00-18:39 i Piscina
  17:00-18:30; cal corregir l'horari real.

## Publicar al mobil (Streamlit Cloud + Supabase)

1. Puja el codi a **GitHub** (millor un repo privat).
2. Crea un projecte gratuit a **Supabase** i copia la cadena de connexio de
   Postgres (*Project Settings → Database → Connection string → URI*).
3. A **share.streamlit.io**, desplega el repo amb *main file* `familia/app.py`.
4. A *Settings → Secrets* de l'app, enganxa:

   ```toml
   [postgres]
   url = "postgresql://USUARI:CONTRASENYA@HOST:5432/postgres?sslmode=require"

   [auth]
   password = "la-teva-contrasenya"
   ```

5. Al mobil, obre la URL i fes **Compartir → Afegir a la pantalla d'inici**.

Sense secrets, la app funciona igual en local desant els JSON de `data/`.
Amb secrets, les dades es guarden a Postgres (no es perden al reiniciar) i es
demana contrasenya per entrar.

