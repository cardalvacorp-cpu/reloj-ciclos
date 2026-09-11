# CONTINUAR — Watch Cycles

Última sesión: **2 septiembre 2026**

## Estado: en producción, 77/77 checks verdes

**URL:** https://watchcycles.com (dominio propio, comprado en Vercel, vence 1 sep 2027)
**Carpeta:** `C:\Users\G888C\reloj-ciclos`
**Antiguo:** `reloj-ciclos.vercel.app` sigue vivo como URL secundario

## Qué existe hoy

- **Marca** Watch Cycles, definida en `src/lib/site/brand.ts`. Sin nombre personal en el
  producto; el dueño solo aparece en `/contact`.
- **Idiomas:** inglés por defecto, español completo con el toggle. `?lang=es` / `?lang=en`
  funcionan en todas las rutas.
- **Portada:** hook en vivo, tarjeta "dónde estamos", "la predicción" (una fecha, no un precio),
  CTAs. BTC al frente; las 10 altcoins detrás de "Also watch".
- **Rutas:** `/` `/method` `/oct-5` `/faq` `/contact` `/embed`. `/test` redirige a `/oct-5`.
- **Registro automático** (`src/lib/log/`): se genera solo con los cierres diarios de los
  exchanges contra el techo publicado. **No hay nada que escribir a mano.** 49 filas hoy.
- **Tarjeta de compartir:** vertical 1080x1350 y horizontal 1600x900, con Copiar imagen y
  Copiar texto. Sin cifras en dólares — el análogo va en `/method` y `/oct-5`.
- **SEO:** `sitemap.xml`, `robots.txt`, canonical, hreflang, Open Graph, Twitter card,
  JSON-LD de FAQ.
- **Voto** Sí/No y **alta de alertas** por correo.

## Pendientes reales

1. **Imagen OG dinámica.** Es lo único del pack que no entró. Intentado con `@vercel/og`:
   Nitro v3 beta no escanea `server/routes/` en esta configuración porque el plugin de
   TanStack Start controla el handler, y esta versión de Start no expone `createServerFileRoute`.
   Se revirtió limpio. Hoy el unfurl usa el `og.jpg` estático, que está bien hecho pero no
   muestra la lectura del día. Para resolverlo hace falta subir TanStack Start a una versión
   con rutas de servidor, o publicar la función OG en un proyecto Vercel aparte.
2. **Envío de correo.** El formulario guarda la dirección en el dispositivo. Sin backend.
   Ver `TODO(backend)` en `src/components/alerts/AlertSignup.tsx`.
3. **Voto compartido.** Contador en memoria del servidor; se reinicia en cada despliegue.
   La UI lo dice. Para que persista hace falta KV o base de datos.
4. **Redirect de www.** `watchcycles.com` y `www.watchcycles.com` sirven los dos. El canonical
   ya resuelve el SEO, pero lo limpio es poner el redirect en el panel:
   Vercel → proyecto → Settings → Domains → `www` → Redirect to `watchcycles.com`.
5. **Correo `contact@watchcycles.com`.** Gratis con Zoho. Faltan los registros MX en el DNS
   de Vercel y actualizar `/contact`.

## Comandos

```bash
cd C:\Users\G888C\reloj-ciclos

npm run dev            # http://localhost:8080
npx tsc --noEmit       # debe dar 0 errores
npm run build          # genera .vercel/output
npx vite preview       # http://127.0.0.1:8081

node scripts/verify-public.mjs                          # contra local
node scripts/verify-public.mjs https://watchcycles.com/ # contra live
node scripts/make-brand-assets.mjs                      # iconos + og.jpg
node scripts/check-log.mjs                              # sonda del registro
node scripts/cross-check-closes.mjs 2026-08-03 2026-09-02   # cierres en 3 exchanges

npx vercel deploy --prebuilt --prod --yes
```

`scripts/verify-public.mjs` es el contrato de aceptación: 77 checks. Tiene que salir verde
antes de dar algo por terminado.

## Referencias

- `CLAUDE.md` — el contrato: marca, idioma, números de la tesis, reglas duras
- `FEATURES.md` — la lista de features y del look
- `_pack/watchcycles-pack/` — el plan de marketing y la copy de origen para `/method` y `/oct-5`

## Respaldos

- Zip original de Grok: `C:\Users\G888C\Downloads\clock.zip.zip` (39.5 MB)
- Copia sin tocar: `C:\Users\G888C\_grokzip` — ahí siguen el retrato y el poster originales
