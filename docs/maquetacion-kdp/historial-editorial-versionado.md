# Historial editorial, versionado y trazabilidad por cuento

**Estado:** requisito funcional y técnico obligatorio para el núcleo de Editor IA.
**Fecha:** 10 de noviembre de 2026.
**Ámbito:** todos los proyectos editoriales, desde el primer borrador hasta las exportaciones finales.

## 1. Objetivo y regla inviolable

Cada cuento debe conservar íntegramente su texto inicial y todas las versiones posteriores. Ninguna corrección, reescritura de IA, edición manual, cambio estructural, importación, maquetación o exportación puede sobrescribir ni destruir una versión anterior.

**Regla de oro: el original nunca se modifica.** Se guarda como una versión fuente inmutable. Toda intervención genera una nueva versión o un evento recuperable. Restaurar una versión antigua crea una versión nueva basada en aquella; nunca borra el recorrido posterior.

El historial debe permitir responder:
- ¿Cuál era exactamente el texto que se importó o escribió inicialmente?
- ¿Qué cambió entre dos versiones y dónde?
- ¿Quién o qué hizo el cambio: usuario, IA, importador o proceso automático?
- ¿Cuándo ocurrió y con qué instrucción, modelo y configuración?
- ¿Qué versión fue aprobada y cuál se utilizó para cada maqueta o PDF?
- ¿Podemos recuperar cualquier estado anterior sin perder el trabajo posterior?

## 2. Dos historiales relacionados, pero independientes

No mezclar el historial del contenido con el de diseño:

### A. Historial del manuscrito
Registra el texto y su estructura: título, capítulos, escenas, párrafos, diálogos, notas y metadatos editoriales. Cada versión debe poder compararse con otra.

### B. Historial de maquetación
Registra formato, plantilla, tipografías, tamaños, estilos, márgenes, columnas, paginación, posición y recorte de ilustraciones, páginas maestras y demás decisiones visuales.

Una modificación de tipografía o de tamaño de página no debe crear una nueva versión textual. Una reescritura no debe alterar silenciosamente la maqueta aprobada. Cada maqueta debe apuntar a la versión exacta del manuscrito con la que fue compuesta.

## 3. Ciclo de vida de un cuento

1. **Creación/importación:** guardar una captura original íntegra antes de cualquier procesamiento. Conservar, cuando exista, el archivo original importado y sus metadatos.
2. **Procesamiento:** corrección ortográfica, análisis, sugerencias y reescritura se ejecutan sobre una copia de trabajo, nunca sobre el original.
3. **Edición:** cada guardado relevante genera una versión recuperable; el autosave protege el trabajo en curso.
4. **Revisión:** permitir comparar versiones y aceptar/rechazar cambios propuestos por bloques.
5. **Aprobación:** marcar una versión como aprobada/publicable sin convertirla en inmutable para siempre; las ediciones siguientes generan nuevas versiones.
6. **Maquetación:** vincular cada composición a una versión concreta del manuscrito y a una versión concreta de sus recursos.
7. **Exportación:** registrar qué versiones exactas, perfil, fuentes, recursos y motor produjeron cada PDF/EPUB.
8. **Restauración:** recuperar una versión anterior creando una nueva versión derivada, dejando intacto todo el historial.

## 4. Tipos de registro

Cada entrada del historial debe incluir, como mínimo:

- identificador único del evento y del proyecto;
- tipo de entidad afectada (manuscrito, bloque, ilustración, maqueta, perfil o exportación);
- acción realizada y resumen legible;
- fecha/hora UTC y presentación en la zona horaria del usuario;
- actor: usuario, asistente IA, importador o sistema;
- versión anterior y versión resultante;
- identificadores estables de los bloques afectados;
- motivo o instrucción, cuando exista;
- origen y procedencia: manual, IA, importación, plantilla o automatización;
- estado: borrador, propuesta, aceptada, rechazada, aprobada o restaurada;
- referencias a los recursos y hashes relevantes.

Para operaciones de IA, registrar además el proveedor/modelo, versión disponible, prompt/instrucción aplicada, parámetros relevantes y alcance de la operación. No registrar claves API, credenciales ni secretos. Si un proveedor no permite recuperar el texto completo de la instrucción, conservar al menos la instrucción que Editor IA envió.

## 5. Versionado y almacenamiento

Se recomienda un modelo híbrido:

- **Registro de eventos append-only:** los eventos se añaden; no se editan ni eliminan desde las funciones normales del producto.
- **Snapshots completos:** guardar una instantánea íntegra del manuscrito en la versión inicial y en hitos definidos. Permiten recuperar rápido sin reconstruir toda la secuencia.
- **Deltas/diffs:** almacenar o calcular diferencias entre snapshots para comparar cambios y reducir duplicación.
- **Bloques con IDs estables:** capítulos, escenas y párrafos deben conservar identificadores al editarse cuando sea posible. Así el diff puede mostrar inserciones, eliminaciones y cambios por fragmento, no solo comparar documentos completos.
- **Hash de integridad:** calcular hash del contenido y de los archivos originales para detectar alteraciones o corrupción.
- **Versiones de esquema:** identificar la versión del formato de datos para poder migrar proyectos antiguos sin perder historial.

La estrategia concreta de base de datos, almacenamiento de archivos y frecuencia de snapshots se decide tras auditar la arquitectura real del repositorio. No asumir que Git es el historial de los cuentos: Git versiona el código de la aplicación, no sustituye el historial editorial de cada proyecto de usuario.

## 6. Interfaz del historial

Dentro de cada cuento debe existir una sección visible **Historial** con:

- línea temporal ordenada y filtros por tipo de acción, actor y fecha;
- etiqueta clara para Original, Borrador, Revisión, Aprobada y Exportada;
- vista comparativa lado a lado y vista de cambios resaltados;
- comparación por capítulo, escena o párrafo;
- detalle de cada operación de IA: qué se pidió y qué fragmentos cambió;
- acciones para abrir, duplicar, nombrar, aprobar y restaurar una versión;
- opción de descargar o copiar el original íntegro;
- relación entre versión textual, maqueta y archivo exportado.

No presentar una acción destructiva como "volver atrás". Usar **Restaurar como nueva versión** y explicar que el historial posterior se conserva.

## 7. Seguridad, recuperación y conflictos

- Autosave con indicador de guardado y recuperación de borradores tras cierre inesperado.
- No confirmar un guardado si la persistencia ha fallado; mostrar el error y mantener el contenido local recuperable.
- Control de concurrencia para evitar que dos pestañas o usuarios se sobrescriban silenciosamente.
- Copias de seguridad y política de retención documentadas.
- Eliminación de un proyecto, si se permite, debe tener confirmación, periodo de recuperación y política explícita; nunca borrar versiones por una simple acción de edición.
- Exportaciones atómicas: un archivo incompleto no puede presentarse como entrega final.
- El usuario debe poder exportar una copia de seguridad del proyecto y su historial en un formato documentado.

## 8. Criterios de aceptación obligatorios

1. Al crear/importar un cuento, queda guardado un original íntegro e identificable.
2. Ejecutar una corrección o reescritura no cambia el original.
3. Cada acción que modifica contenido crea una versión/evento recuperable con actor, fecha y resumen.
4. Se puede comparar el original con cualquier versión posterior por bloques.
5. Restaurar una versión crea una nueva versión y conserva todas las posteriores.
6. Cambiar solo la maquetación no altera el manuscrito ni su historial textual.
7. Cada PDF/EPUB identifica la versión de manuscrito y maqueta que lo generó.
8. Un fallo de guardado o cierre inesperado no se presenta como guardado correcto y permite recuperar el trabajo pendiente.
9. Los hashes permiten verificar que el original y los recursos archivados no han cambiado.
10. Pruebas automatizadas demuestran que ninguna ruta de edición, IA, importación o exportación sobrescribe la versión original.

## 9. Prioridad de implementación

Este requisito es **bloqueante para el núcleo editorial** y debe adelantarse respecto a funciones avanzadas de maquetación. Orden recomendado:

1. auditoría de persistencia y modelo de datos actual;
2. captura inmutable del original y snapshots;
3. creación de versiones para edición manual y acciones IA;
4. historial visual, diff y restauración no destructiva;
5. vínculo entre manuscrito, maqueta y exportación;
6. recuperación, copias de seguridad, concurrencia y pruebas de integridad.

No declarar el flujo editorial listo para producción hasta superar los criterios de aceptación anteriores.
