# Roadmap de implementación

## Fase 0 — Auditoría técnica y prototipo de exportación
- Inspeccionar código real, rutas, estado, almacenamiento, estructura del manuscrito y despliegue.
- Identificar cómo se representan capítulos, párrafos e imágenes.
- Probar dos o tres tecnologías de composición/PDF con un libro real.
- Medir fidelidad preview/PDF, fuentes, rendimiento y licencias.
- Resultado: decisión técnica documentada y prototipo reproducible.

**No avanzar al editor visual completo hasta validar que el motor produce páginas estables.**

## Fase 1 — Núcleo editorial
- Modelo BookProject/ManuscriptSnapshot.
- Perfiles A4, A5 y tamaños KDP validados.
- Márgenes, retículas, columnas y páginas maestras.
- Estilos tipográficos globales.
- Paginación automática y secciones.
- PDF de lectura/revisión.

## Fase 2 — Composición ilustrada
- Huecos de ilustración y biblioteca de recursos.
- Página completa, media página y doble página.
- Editor visual de bloques.
- Vista de páginas enfrentadas.
- Control de recorte, resolución y medianil.

## Fase 3 — Salida KDP
- Matriz de combinaciones admitidas basada en reglas oficiales vigentes.
- PDF interior individual, sangrado y no sangrado.
- Preflight específico.
- Cubierta con plantilla oficial calculada.
- Informe de exportación y guía de revisión en Previewer.

## Fase 4 — Encuadernación local
- Imposición por firmas.
- A4 apaisado a dos páginas A5.
- Volteo, plegado, marcas y hojas de prueba.
- Exportación para imprenta y folleto.

## Fase 5 — Plantillas y calidad editorial
- Presets para álbum, cuento, novela, actividades y no ficción.
- Cabeceras, pies, folios, índices y preliminares.
- Pruebas de regresión, accesibilidad y rendimiento.
- Guardado/versionado y recuperación.

## Fase 6 — Mejoras posteriores
- EPUB reflowable/fixed-layout.
- Reglas de accesibilidad y texto alternativo.
- Perfiles para otras plataformas de impresión bajo demanda.
- Gestión de ISBN, metadatos y checklist de publicación.
- Integraciones externas solo con soporte y autorización adecuados.

## Orden de prioridad

1. PDF correcto y reproducible.
2. Compatibilidad real con KDP.
3. Flujo visual fácil para un editor no técnico.
4. Ilustración y álbum infantil.
5. Imposición para imprenta local.
6. Formatos digitales y otros proveedores.

## Criterio de lanzamiento

No anunciar “listo para Amazon KDP” hasta completar pruebas con archivos reales y revisión en KDP Print Previewer. La primera versión comercial debe indicar claramente los perfiles validados, sus límites y la fecha de verificación de las reglas.
