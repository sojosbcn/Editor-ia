# Arquitectura técnica propuesta

**Estado:** diseño preliminar; requiere inspección del código real antes de implementar.

## 1. Principios

1. Manuscrito fuente inmutable y separado de la composición.
2. Modelo de documento estructurado, no una colección de coordenadas sueltas.
3. Motor de composición determinista: mismos contenidos, fuentes, recursos y configuración deben producir el mismo resultado.
4. Vista previa y PDF deben compartir reglas geométricas.
5. Perfiles de salida independientes (KDP, imprenta local, cuadernillo, lectura digital).
6. Preflight como servicio separado del renderizado.
7. Versionado de maquetas y recursos.
8. Exportaciones reproducibles y trazables.

## 2. Modelo de dominio sugerido

- `BookProject`: metadatos, idioma, destino y versión fuente.
- `ManuscriptSnapshot`: copia versionada y estructurada del texto aprobado.
- `PublicationProfile`: tamaño, unidades, encuadernación, papel, tinta, sangrado y reglas.
- `DesignTheme`: paleta, fuentes, estilos de párrafo y carácter.
- `PageMaster`: retícula, márgenes, columnas, cabecera, pie y folio.
- `Section`: preliminares, cuerpo, capítulos, anexos y páginas finales.
- `Page`: número lógico, sección, master y lista ordenada de elementos.
- `LayoutNode`: texto, imagen, hueco, forma, pie, folio o elemento decorativo.
- `ImageAsset`: archivo, dimensiones, resolución, licencia, crédito y hash.
- `SpreadComposition`: escena que visualmente abarca dos páginas; se renderiza en páginas individuales.
- `PaginationRule`: sistema, inicio, reinicio, visibilidad y ubicación.
- `ImpositionPlan`: tamaño de pliego, firma, plegado, orden y volteo.
- `PreflightReport`: reglas ejecutadas, incidencias, severidad y versión de reglas.
- `ExportArtifact`: archivo, perfil, versión de maqueta, fecha y hash.

## 3. Componentes de aplicación

### Frontend
- Wizard de publicación.
- Biblioteca de plantillas y temas.
- Editor de páginas con miniaturas.
- Vista de página, spread y pliego.
- Inspector de tipografía, geometría e imagen.
- Panel de capas y estructura.
- Panel de preflight y exportaciones.

### Servicios de dominio
- Importador de manuscrito.
- Compositor/paginador.
- Gestor de recursos.
- Servicio de estilos y fuentes.
- Paginador/índice.
- Motor de imposición para impresión local.
- Renderizador PDF.
- Validador/preflight.
- Gestor de versiones y artefactos.

### Persistencia
Guardar estructura y configuración como datos versionables; almacenar imágenes y PDFs como recursos, no como cadenas embebidas en el documento. Mantener referencias estables y hashes para detectar cambios.

## 4. Motor de composición

El motor debe:
- convertir unidades físicas a coordenadas internas consistentes;
- calcular cajas de texto e imagen;
- resolver estilos heredados y overrides locales;
- componer párrafos y saltos;
- detectar overflow, viudas y huérfanas;
- distribuir bloques entre páginas;
- recalcular folios e índice;
- generar páginas con geometría exacta;
- producir un mapa de incidencias y posiciones.

No basar la paginación final en una captura de pantalla o en el DOM sin medición controlada. La métrica de fuente, el renderizador de preview y el PDF deben coincidir suficientemente para evitar cambios de línea al exportar.

## 5. Renderizado PDF

Evaluar librerías según:
- control preciso de unidades, páginas y cajas;
- incrustación de fuentes;
- soporte de imágenes, transparencias y color;
- metadatos y enlaces;
- rendimiento con libros extensos;
- licencia compatible con el producto;
- capacidad de producir páginas individuales y documentos grandes.

La decisión de librería se toma después de un prototipo técnico que compare fidelidad preview/PDF, fuentes, saltos, imágenes y rendimiento. No seleccionar dependencia únicamente por popularidad.

## 6. Separación entre composición e imposición

El documento maestro siempre representa páginas en orden de lectura. El exportador KDP genera esas páginas tal cual, individualmente. El exportador local puede aplicar después una transformación de imposición para formar pliegos.

La imposición no modifica el libro maestro. Debe permitir:
- firma de 4, 8, 12, 16 o más páginas según la encuadernación;
- orientación/volteo del reverso;
- encuadernación izquierda o derecha;
- páginas blancas de compensación;
- marcas opcionales para imprenta local;
- hoja de prueba de plegado.

## 7. Interoperabilidad

- Importar manuscrito desde la estructura editorial existente.
- Vincular ilustraciones generadas o cargadas desde el proyecto.
- Exportar informe de preflight junto al PDF.
- Mantener futura opción de exportar EPUB sin acoplarla al motor de imposición.
- No integrar carga automática a KDP sin API oficial, permisos, revisión legal y decisión explícita del usuario.

## 8. Requisitos no funcionales

- Autosave, recuperación tras fallo y undo/redo.
- Rendimiento aceptable con libros de cientos de páginas.
- Accesibilidad de controles y contraste.
- Seguridad de archivos y validación de tipos/tamaños.
- Registro de versión del motor y perfiles.
- Errores claros y exportación atómica (no dejar archivos parciales como finales).
- Pruebas automatizadas de geometría, paginación e imposición.

## 9. Decisiones pendientes de inspección

El repositorio usa React, Vite, TypeScript y servidor Node/Gemini según package.json consultado. Aún debe inspeccionarse la estructura real de componentes, estado, almacenamiento, rutas y despliegue para definir integración, librerías y migraciones. Esta especificación no presupone una arquitectura de carpetas ni un backend que no se haya verificado.


## 10. Historial editorial y versionado (requisito obligatorio)

El historial no puede delegarse a Git ni confundirse con el versionado del código. Es información de dominio por cada proyecto de usuario.

### Entidades adicionales propuestas

- `EditorialEvent`: evento append-only con proyecto, actor, acción, fecha UTC, resumen, entidad afectada, versión anterior/nueva, instrucción/procedencia y metadatos no sensibles.
- `ManuscriptVersion`: snapshot estructurado e inmutable del manuscrito, número/ID de versión, estado, autoría, fecha y hash.
- `ContentBlock`: capítulo, escena, párrafo u otro bloque con ID estable para comparar cambios granulares.
- `VersionDiff`: diferencias calculadas entre dos versiones, por bloque; puede materializarse para rendimiento, pero debe poder reconstruirse.
- `LayoutVersion`: snapshot de la composición visual, independiente de las versiones textuales.
- `AIActionRecord`: operación de IA con proveedor/modelo, instrucción enviada, parámetros relevantes, alcance, resultado y aceptación/rechazo.
- `SourceAsset`: archivo original importado y recursos originales con metadatos, ubicación de almacenamiento y hash.
- `ExportArtifact`: debe referenciar de forma explícita `ManuscriptVersion`, `LayoutVersion`, perfil de salida, versión del motor y hashes de recursos.

### Reglas de persistencia

1. La primera escritura/importación crea un `ManuscriptVersion` original inmutable antes de ejecutar correcciones o normalizaciones.
2. Toda mutación de contenido crea una nueva versión o un evento recuperable; no se permite actualización destructiva del snapshot.
3. Los eventos se añaden, no se editan desde el flujo normal de la aplicación.
4. Los snapshots se combinan con diffs/eventos para equilibrar integridad, rendimiento y almacenamiento.
5. Restaurar una versión antigua crea una versión nueva basada en su contenido; no mueve el puntero destruyendo el historial.
6. Las versiones de maqueta nunca mutan versiones textuales.
7. Cada exportación queda vinculada a las versiones exactas que la originaron.
8. Guardado, autosave y recuperación deben informar del estado real de persistencia; no confirmar éxito ante un fallo.

La base de datos y la estrategia de almacenamiento se definirán después de inspeccionar el backend real. Se deben probar concurrencia, recuperación ante fallos, integridad de hashes y migración de esquemas.
