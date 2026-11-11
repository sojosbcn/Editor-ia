# Arquitectura y memoria de traducción

## 1. Separación de responsabilidades

La traducción debe ser un servicio editorial independiente, reutilizable desde el editor de cuentos y desde el taller de maquetación. No debe quedar acoplada a una pantalla concreta ni alterar directamente el manuscrito fuente.

Flujo lógico:

`ManuscriptVersion` → `TranslationJob` → análisis global → memoria/glosario → traducción → revisión automática → revisión editorial → `TranslatedManuscriptVersion`

## 2. Entidades propuestas

- `TranslationJob`: idioma origen/destino, variante, perfil de estilo, versión fuente, estado, fecha y configuración.
- `StoryContext`: sinopsis, personajes, relaciones, cronología, reglas del universo, tono, público y decisiones editoriales.
- `TranslationSegment`: bloque de origen, bloque traducido, IDs estables, estado de revisión y alineación.
- `GlossaryEntry`: término origen, equivalente, categoría, contexto, ejemplos propios, decisión (obligatorio/preferido/prohibido), notas y alcance.
- `TranslationMemoryEntry`: segmento aprobado, original, traducción, idioma, variante, contexto y procedencia.
- `LanguageProfileVersion`: variedad, normativa, guía de estilo, fuentes y fecha.
- `TranslationIssue`: tipo, gravedad, bloque afectado, explicación y propuesta.
- `TranslationDecision`: decisión humana o automatizada, autor, motivo y fecha.
- `TranslatedManuscriptVersion`: snapshot inmutable de la traducción aprobada o en revisión, vinculado a la versión original.
- `TranslationAuditEvent`: evento append-only de cada acción relevante.

## 3. Contexto completo sin saturar el modelo

El sistema no debe enviar indiscriminadamente todo el material lingüístico en cada petición ni depender de una instrucción gigantesca. Debe recuperar contexto relevante por capas:

1. **Contexto fijo:** perfil de catalán, variedad, ortografía, guía editorial y reglas de fidelidad.
2. **Contexto del libro:** sinopsis, narrador, personajes, tono, edad, hechos y cronología.
3. **Memoria del universo:** nombres, términos, frases recurrentes y decisiones aprobadas de otros cuentos de la misma colección.
4. **Contexto local:** bloque actual, párrafos anteriores y posteriores, capítulo y escena.
5. **Fuentes de consulta:** entradas normativas o terminológicas necesarias para resolver una duda concreta.

Cada fragmento recuperado debe incluir procedencia, versión y relevancia. Evitar que una entrada antigua o una traducción rechazada se imponga a una decisión aprobada más reciente.

## 4. Jerarquía de autoridad

Ante conflicto, aplicar este orden:
1. instrucción explícita aprobada por el autor/editor para ese proyecto;
2. glosario y decisiones terminológicas aprobadas para el libro/colección;
3. perfil de variedad y guía de estilo seleccionados;
4. normativa y fuentes lingüísticas fiables;
5. memoria de traducción aprobada y contextualizada;
6. propuesta del modelo.

Una traducción anterior no es autoridad normativa por el mero hecho de existir. Solo se reutiliza si encaja con el sentido, la variedad, el registro y el contexto actuales.

## 5. Segmentación y alineación

- Mantener IDs estables de capítulos, escenas y bloques.
- No cortar diálogos, frases o unidades semánticas en puntos arbitrarios.
- Cada segmento traducido conserva referencia al bloque de origen.
- Permitir que un bloque de origen se corresponda con uno o varios bloques traducidos cuando la sintaxis lo exija.
- Registrar movimientos, fusiones y divisiones sin perder trazabilidad.
- Al re-traducir un fragmento, revisar las dependencias cercanas y los términos repetidos.

## 6. Versionado y seguridad editorial

- Nunca sobrescribir la versión original.
- Cada ejecución crea un trabajo y un resultado nuevos.
- Correcciones posteriores crean nuevas versiones o eventos recuperables.
- Restaurar una traducción anterior crea una nueva versión.
- Registrar modelo/proveedor, perfil, instrucciones, glosario, fuentes consultadas y cambios aceptados.
- No incorporar automáticamente al glosario una propuesta no aprobada.
- Separar memoria del usuario/proyecto de los datos de entrenamiento del proveedor; no afirmar que el modelo «aprende» permanentemente de cada corrección.
- Respetar privacidad y permisos de los manuscritos.

## 7. Estrategia de generación

Para cuentos extensos:
1. analizar la obra completa;
2. preparar contexto y glosario;
3. traducir por unidades coherentes;
4. ejecutar revisión de consistencia global;
5. realizar lectura monolingüe completa;
6. realizar contraste bilingüe;
7. consolidar en una versión única.

Las llamadas por fragmentos deben ser reproducibles y no depender de que el modelo recuerde conversaciones anteriores. El contexto se recupera desde datos persistidos.

## 8. Integración con maquetación

La versión traducida conserva estructura semántica y estilos del original, pero la paginación se calcula de nuevo: el catalán puede ocupar más o menos espacio. No copiar a ciegas saltos de página del español.

Toda maqueta y exportación debe identificar:
- versión original;
- versión traducida;
- variante lingüística;
- versión de perfil y glosario;
- versión de maqueta;
- motor y recursos utilizados.

La traducción se entrega como nuevo manuscrito dentro del mismo proyecto, disponible para maquetación KDP, impresión local y lectura digital.
