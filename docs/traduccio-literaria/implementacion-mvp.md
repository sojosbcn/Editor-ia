# Implementación inicial del traductor literario

**Estado:** primer prototipo integrado en frontend y backend. No se considera todavía apto para publicación sin validación.
**Rama:** `feature/traduccio-literaria-catala`.

## Cambios realizados

### Backend — `server.ts`
- El endpoint `POST /api/translate` valida el texto, idioma de destino y longitud máxima de 120.000 caracteres.
- Catalán central de Cataluña configurado como perfil inicial.
- Instrucciones lingüísticas específicas para morfología, sintaxis, pronoms febles, régimen preposicional, ortografía, apóstrofos, diacríticos, expresiones idiomáticas, diálogos y literatura infantil.
- Análisis contextual de la obra completa antes de traducir: personajes, cronología, narrador, tono y términos recurrentes.
- Dos pasadas de IA: traducción inicial y revisión bilingüe de fidelidad/naturalidad.
- El endpoint devuelve el estado de la segunda revisión y el identificador del perfil aplicado.
- El texto de origen no se modifica en el endpoint.

### Cliente — `src/lib/gemini.ts`
- La función de cliente acepta metadatos editoriales y glosario.
- Devuelve el texto y el estado de revisión, no solo una cadena sin procedencia.

### Interfaz — `src/App.tsx`
- Catalán estándar central como idioma predeterminado.
- Glosario editable por proyecto para nombres, conceptos y equivalencias aprobadas.
- Historial local de resultados con copia de origen, traducción, idioma, perfil, rama fuente, fecha y estado de revisión.
- El historial y glosario se incluyen en el guardado/restauración del proyecto que ya utiliza la aplicación.

## Límites conocidos y trabajo pendiente

1. **No hay consulta automática en tiempo real a IEC, DIEC, Optimot o TERMCAT.** El perfil contiene instrucciones lingüísticas inspiradas en esas referencias, pero no consulta sus bases de datos ni puede afirmar que ha verificado cada duda.
2. El glosario es manual y por proyecto. Todavía no existe memoria terminológica compartida entre todos los cuentos de una colección ni un flujo formal de aprobación de términos.
3. El historial se guarda mediante el mecanismo actual del navegador (localStorage). No equivale a una base de datos editorial duradera, sincronizada ni a un registro append-only resistente a manipulación. Para producción debe migrarse a persistencia backend con snapshots inmutables, eventos y copias de seguridad.
4. La traducción de más de 120.000 caracteres se rechaza. Aún no existe un sistema de segmentación por capítulos con continuidad global y reanudación.
5. La revisión es una segunda pasada del modelo, no una corrección humana nativa. El estado debe seguir indicando que la revisión humana está pendiente.
6. No se ha ejecutado todavía `npm run lint`, `npm run build` ni pruebas de integración en un entorno de ejecución. La integración está confirmada a nivel de cambios guardados en GitHub, no de compilación.
7. No se ha medido todavía calidad con un corpus catalán revisado por especialistas.

## Pruebas de aceptación antes de producción

- Compilación TypeScript y build sin errores.
- Traducción de cuentos cortos, medianos y extensos dentro del límite.
- Contraste por un corrector nativo de catalán central.
- Pruebas específicas de pronoms febles, régimen preposicional, falsos amigos, diálogos, humor, rimas y nombres ficticios.
- Verificación de que el resultado nunca reemplaza el texto original.
- Restauración del proyecto y recuperación de traducciones guardadas.
- Pruebas de cuota/recuperación del almacenamiento local y migración a backend.
- Confirmar que los resultados de la segunda pasada no introducen omisiones o reescrituras innecesarias.

## Próxima fase recomendada

1. Ejecutar lint/build en Google AI Studio o entorno local y corregir cualquier error.
2. Probar con un cuento real de la colección Leo.
3. Hacer revisión nativa del catalán y corregir el perfil/glosario.
4. Implementar persistencia backend, snapshots inmutables y memoria terminológica aprobada.
5. Añadir segmentación/reanudación para libros largos.
