# vetsDB · Prueba de concepto

Demo navegable de vetsDB, una plataforma de papers para colegios de veterinarios. **Solo frontend**:
no hay servidor ni base de datos real. Todo el estado vive en el navegador (localStorage + IndexedDB
para los PDFs subidos) y se puede reiniciar con el botón ⟲ de la barra superior.

Este repositorio contiene **solo la POC**, público para poder enseñarla por enlace (GitHub Pages).
El proyecto completo (specs, constitución, decisiones de producto) vive en un repositorio privado
aparte; esta demo no representa el diseño final ni sus datos.

## Ver la demo desplegada

Se publica automáticamente en GitHub Pages con cada push a `main` (ver
`.github/workflows/deploy.yml`): **Settings → Pages → tu URL `https://<usuario>.github.io/vetsdb-poc/`**.

## Arrancar en local

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Typecheck + build de producción en `dist/` (con el prefijo `/vetsdb-poc/` de GitHub Pages) |
| `npm run preview` | Sirve el build en http://localhost:4173 |
| `npm run pdfs` | Regenera los PDFs ficticios (`scripts/generate_pdfs.py`, requiere `reportlab`) |

## Usuarios de la demo

El selector **«Ver como»** (arriba a la derecha) permite cambiar de personaje en cualquier momento.
Hay exactamente 4 personas, una por cada tipo de rol:

| Persona | Rol | Qué enseña |
|---|---|---|
| **Laura Martín Ortega** | Admin global | Grupos y usuarios estilo Azure AD, catálogo de temas, auditoría, cola de revisión y solicitudes de toda la plataforma |
| **Carmen Ruiz Delgado** | Admin local · Huelva | Altas pendientes, solicitudes y papers de su colegio; puede resolver en nombre de sus writers |
| **Lucía Fernández Gil** | Writer · Madrid | Crear un paper (con el detector de solapes en vivo), enviarlo a revisión, pedir acceso a un paper privado, estadísticas de sus papers |
| **Ana Castillo Vega** | Reader · Madrid | Solo consulta: buscar, leer lo que tiene acceso y pedir acceso a lo demás |

El resto de autores que aparecen en los papers (Javier, Pablo, Marta, Diego, Sergio…) existen como
datos para que la demo tenga contenido realista, pero no son personajes seleccionables.

Un buen punto de partida: entra como **Lucía**, busca «leishmaniosis en perros» (aparecen trabajos en
curso y publicados, incluso en inglés), abre uno y prueba el visor protegido; después crea un paper
nuevo y observa el aviso de solapes mientras escribes el título.

## Qué es real y qué está simulado

| Funcionalidad | En la POC | En producción (specs) |
|---|---|---|
| Permisos y roles | Funciones en el navegador (`src/lib/permissions.ts`) | Políticas RLS en Postgres |
| Búsqueda semántica | Sinónimos ES/EN/CA + TF-IDF (`src/lib/search.ts`) | Embeddings multilingües + pgvector |
| Visor protegido | pdf.js renderiza el PDF en el navegador | Páginas pre-rasterizadas; el PDF nunca llega al lector |
| Marca de agua en descarga | pdf-lib en el navegador | Edge Function en el servidor |
| Chat | Local; para «responder» cambia de usuario | Supabase Realtime |
| Notificaciones | Solo in-app | In-app + email |
| Estadísticas | Actividad generada automáticamente | Eventos reales |
| Login | Selector de usuario | Supabase Auth (email, magic link, Google/Microsoft) |

## Datos y documentos

- **Personas, colegiados y datos:** todos ficticios (emails `@example.com`).
- **PDFs `demo-*.pdf`:** papers ficticios en español generados por `scripts/generate_pdfs.py`. Cada página lleva el aviso «DOCUMENTO FICTICIO».
- **PDFs `ext-*.pdf`:** artículos reales de acceso abierto, redistribuidos según su licencia y citados en la app con sus autores originales:
  - Solano-Gallego L, et al. *LeishVet guidelines for the practical management of canine leishmaniosis.* Parasites & Vectors 2011;4:86. doi:10.1186/1756-3305-4-86 — **CC BY 2.0**
  - Montoya A, et al. *Latest trends in L. infantum infection in dogs in Spain, Part II.* Parasites & Vectors 2020;13:205. doi:10.1186/s13071-020-04080-8 — **CC BY 4.0**
  - Díaz-Regañón D, et al. *Serological evaluation of selected vector-borne pathogens in owned dogs from northern Spain.* Parasites & Vectors 2020;13:301. doi:10.1186/s13071-020-04172-5 — **CC BY 4.0**

## Limitaciones conocidas

- Diseñada para pantalla de portátil: en móvil la barra lateral se oculta.
- Los PDFs subidos se guardan solo en el navegador donde se suben.
- Solo español (el producto final tendrá catalán, euskera y gallego).
