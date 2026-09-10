# App de Reporte Ciudadano

Aplicación web para reportar actividades sospechosas, recibir alertas de seguridad, participar en encuestas ciudadanas y chatear con autoridades. Desarrollada con React, Vite, Tailwind CSS y Supabase.

El diseño original está disponible en Figma: https://www.figma.com/design/qTBcccdj61HoEFJQRb0IMx/App-de-Reporte-Ciudadano

---

## Tecnologías

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase Edge Functions (Deno + Hono)
- **Base de datos:** PostgreSQL en Supabase
- **Despliegue frontend:** GitHub Pages mediante GitHub Actions
- **Despliegue backend:** Supabase CLI

---

## Requisitos previos

- Node.js 20 o superior
- Cuenta en GitHub
- Proyecto en Supabase
- Supabase CLI instalado localmente:
  ```bash
  npx supabase login
  ```

---

## Ejecutar en local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre http://localhost:3000 en tu navegador.

---

## Configuración de Supabase

La aplicación se conecta a un proyecto de Supabase. Las credenciales del frontend se encuentran en:

```
src/utils/supabase/info.tsx
```

Actualiza `projectId` y `publicAnonKey` con los valores de tu proyecto de Supabase.

### Crear la tabla de datos

En el SQL Editor de tu proyecto de Supabase, ejecuta:

```sql
CREATE TABLE IF NOT EXISTS kv_store_1cd2eafa (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### Desplegar la Edge Function

La función backend se encuentra en:

```
supabase/functions/make-server-1cd2eafa/index.ts
```

Para desplegarla:

```bash
npx supabase link --project-ref <TU_PROJECT_REF>
npx supabase functions deploy make-server-1cd2eafa
```

Para probar que funciona:

```bash
curl https://<TU_PROJECT_REF>.supabase.co/functions/v1/make-server-1cd2eafa/health \
  -H "Authorization: Bearer <TU_PUBLIC_ANON_KEY>"
```

---

## Despliegue del frontend

El frontend se despliega automáticamente en GitHub Pages mediante GitHub Actions cada vez que se hace push a la rama `main`.

### Pasos para desplegar

1. Sube los cambios a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```

2. Ve a la pestaña **Actions** de tu repositorio y espera a que el workflow termine.

3. La aplicación estará disponible en:
   ```
   https://jobenites.github.io/app-ciudadano
   ```

### Configurar GitHub Pages

Si es la primera vez que despliegas, ve a:

> `https://github.com/jobenites/app-ciudadano/settings/pages`

Selecciona **Source: GitHub Actions**.

---

## Estructura del proyecto

```
app-ciudadano/
├── .github/workflows/deploy.yml   # Workflow de despliegue a GitHub Pages
├── public/                        # Archivos estáticos
├── src/
│   ├── components/                # Componentes de React
│   ├── utils/supabase/info.tsx    # Credenciales de Supabase
│   ├── App.tsx                    # Componente principal
│   └── main.tsx                   # Punto de entrada
├── supabase/
│   ├── functions/
│   │   └── make-server-1cd2eafa/
│   │       └── index.ts           # Edge Function de Supabase
│   └── migrations/
│       └── 0001_create_kv_store.sql  # Schema de la base de datos
├── index.html
├── package.json
├── README.md
└── vite.config.ts
```

---

## Notas importantes

- El `publicAnonKey` es la clave pública de Supabase y puede incluirse en el frontend.
- El `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse en el frontend; solo se usa dentro de la Edge Function.
- Las Edge Functions de Supabase tienen acceso automático a las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- La tabla `kv_store_1cd2eafa` utiliza Row Level Security (RLS) por defecto, pero la Edge Function la ignora porque usa el service role key.

---

## Licencia

Proyecto privado. Todos los derechos reservados.
