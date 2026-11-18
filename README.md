<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0ce5fd15-d7d7-4150-b49d-e7f6eb2e3591

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Configuración del servidor

Copia `.env.example` a `.env` y configura al menos una credencial de IA:

- `GEMINI_API_KEY`: clave de Google AI Studio.
- `GROQ_API_KEY`: opcional, para utilizar Groq.

El servidor expone `GET /api/health` para comprobar el estado de configuración sin revelar secretos.

### Publicación CMS segura

La publicación está desactivada por defecto. Para habilitarla, configura en el entorno del servidor:

- `CMS_WEBHOOK_URL`: URL HTTPS fija del webhook del CMS.
- `CMS_WEBHOOK_ALLOWED_HOSTS`: hostname exacto permitido, sin protocolo ni ruta.

Ejemplo: si la URL es `https://cms.example.com/hooks/editorial`, el host permitido será `cms.example.com`. Se rechazan destinos que no usen HTTPS, hosts no incluidos en la lista y redirecciones HTTP. La URL de destino nunca se acepta desde el navegador.

### Límites de API

Las rutas API aplican límites por IP y los cuerpos JSON tienen un máximo de 12 MB. Los límites son locales a cada instancia; para despliegues con varias instancias se recomienda sustituirlos por un almacén compartido y configurar explícitamente la topología del proxy de confianza.

### Comprobación

```bash
npm ci
npm run lint
npm run build
npm start
```

La integración continua ejecuta comprobación de tipos y compilación de producción en cada push a ramas de trabajo y en las solicitudes de integración a `main`.
