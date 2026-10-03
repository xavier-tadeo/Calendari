# Calendari Familia - PWA

App web instal·lable (PWA) per al mobil. Substitueix el dashboard de Streamlit:
es carrega a l'instant, es pot instal·lar a la pantalla d'inici i desa les dades
a **Supabase** (o a `localStorage` si no hi ha configuracio).

## Desenvolupament

```bash
cd pwa
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/ (amb service worker i manifest)
npm run preview    # serveix dist/
```

Sense `.env.local`, la app funciona en **mode local** i la contrasenya per
defecte es `familia`.

## Configuracio de Supabase

1. Copia `.env.example` a `.env.local` i omple:
   - `VITE_SUPABASE_URL` (p. ex. `https://gxpsgcubjukqmtsjnrxz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` (Project Settings > API Keys > anon/publishable)
2. Crea un usuari de login: **Authentication > Users > Add user** (correu +
   contrasenya, marca *Auto Confirm*). Aquestes seran les credencials de la
   familia.
3. Executa `supabase/setup.sql` al **SQL Editor** (activa RLS i dona permisos
   als usuaris autenticats).

## Desplegar

**Netlify** (recomanat, des del repo de GitHub):

- Base directory: `pwa`
- Build command: `npm run build`
- Publish directory: `pwa/dist`
- Environment variables: `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`

Al mobil: obre la URL a **Safari** (iOS) o **Chrome** (Android) i
*Compartir > Afegir a la pantalla d'inici*.
