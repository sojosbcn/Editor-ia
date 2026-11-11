# Roadmap de implementación

## Fase 0 — Auditoría técnica y prototipo de persistencia/exportación
- Inspeccionar código real, rutas, estado, almacenamiento, estructura del manuscrito y despliegue.
- Identificar cómo se representan capítulos, párrafos e imágenes.
- Auditar cómo se guardan hoy los proyectos y si alguna acción sobrescribe texto.
- Probar el mecanismo de snapshot original, versiones inmutables, eventos y recuperación.
- Probar dos o tres tecnologías de composición/PDF con un libro real.
- Medir fidelidad preview/PDF, fuentes, rendimiento y licencias.
- Resultado: decisión técnica documentada y prototipo reproducible con prueba de que el original no puede perderse.

**No avanzar al editor visual completo hasta validar persistencia/versionado y que el motor produce páginas estables.**

## Fase 1 — Núcleo editorial e historial (bloqueante)
- Guardar una versión original inmutable al crear/importar cada cuento.
- Implementar snapshots, eventos append-only, IDs estables de bloques y hashes.
- Versionar toda edición manual y operación de IA sin sobrescribir versiones previas.
- Historial visual, comparación por capítulo/párrafo y restauración como nueva versión.
- Registrar actor, fecha, instrucción/procedencia y estado de aprobación.
- Autosave, recuperación de borradores y control de conflictos.
- Perfiles A4, A5 y tamaños KDP validados.
- Márgenes, retículas, columnas y páginas maestras.
- Estilos tipográficos globales y paginación automática.
- PDF de lectura/revisión vinculado a la versión fuente.

## Fase 2 — Traducción literaria (primer idioma: catalán)
- Implementar el perfil de catalán estándar central y su guía lingüística versionada.
- Construir análisis global de la historia: personajes, cronología, tono, voz y público.
- Crear glosario por cuento/colección y memoria de traducción basada solo en decisiones aprobadas.
- Traducir por unidades coherentes con contexto global y alineación a bloques originales.
- Revisión monolingüe en catalán y contraste bilingüe para detectar omisiones, añadidos y calcos.
- Informe de dudas y adaptaciones idiomáticas/culturales.
- Guardar cada resultado como nueva versión, sin modificar el original.
- Pruebas con cuentos completos y revisión de hablantes/correctores competentes antes de declarar el módulo apto para publicación.

## Fase 3 — Composición ilustrada
- Huecos de ilustración y biblioteca de recursos.
- Página completa, media página y doble página.
- Editor visual de bloques.
- Vista de páginas enfrentadas.
- Control de recorte, resolución y medianil.
- Versionado independiente de maquetas y recursos.
- Recalcular paginación para cada idioma; no heredar saltos de página de otra lengua.

## Fase 4 — Salida KDP
- Matriz de combinaciones admitidas basada en reglas oficiales vigentes.
- PDF interior individual, sangrado y no sangrado.
- Preflight específico.
- Cubierta con plantilla oficial calculada.
- Informe de exportación que identifique versión exacta del manuscrito (y traducción, si procede), maqueta, recursos, perfil y motor.
- Guía de revisión en Previewer.

## Fase 5 — Encuadernación local
- Imposición por firmas.
- A4 apaisado a dos páginas A5.
- Volteo, plegado, marcas y hojas de prueba.
- Exportación para imprenta y folleto.

## Fase 6 — Plantillas y calidad editorial
- Presets para álbum, cuento, novela, actividades y no ficción.
- Cabeceras, pies, folios, índices y preliminares.
- Pruebas de regresión, accesibilidad y rendimiento.
- Copias de seguridad y exportación/importación de proyectos con su historial.

## Fase 7 — Mejoras posteriores
- Otros perfiles de catalán y nuevas lenguas según demanda y validación.
- EPUB reflowable/fixed-layout.
- Reglas de accesibilidad y texto alternativo.
- Perfiles para otras plataformas de impresión bajo demanda.
- Gestión de ISBN, metadatos y checklist de publicación.
- Integraciones externas solo con soporte y autorización adecuados.

## Orden de prioridad

1. Preservar el original y demostrar recuperación íntegra.
2. Versionado y trazabilidad de cambios manuales y de IA.
3. Traducción fiel, natural y validada para el primer perfil lingüístico.
4. PDF correcto y reproducible.
5. Compatibilidad real con KDP.
6. Flujo visual fácil para un editor no técnico.
7. Ilustración y álbum infantil.
8. Imposición para imprenta local.
9. Formatos digitales y otros proveedores.

## Criterio de lanzamiento

No anunciar el núcleo editorial como listo para producción hasta superar pruebas de integridad y restauración de versiones. No presentar el traductor como «perfecto» ni apto para publicación sin evaluación completa y revisión humana. No anunciar «listo para Amazon KDP» hasta completar pruebas con archivos reales y revisión en KDP Print Previewer. La primera versión comercial debe indicar claramente los perfiles validados, sus límites y la fecha de verificación de las reglas.
