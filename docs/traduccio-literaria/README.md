# Módulo de Traducción Literaria — Catalán

**Estado:** especificación funcional y lingüística; todavía no implementado.
**Rama:** `feature/traduccio-literaria-catala`.
**Primera combinación:** español → catalán estándar central (Cataluña), con variante configurable en el diseño para futuras ampliaciones.

## Objetivo

Incorporar a Editor IA un traductor literario capaz de entregar una versión completa de cada historia en catalán natural, correcta, coherente y publicable. No debe limitarse a sustituir palabras ni a traducir frase por frase: debe comprender el cuento como una obra completa, su voz narrativa, personajes, edad lectora, humor, referencias culturales, continuidad y propósito emocional.

La traducción se tratará como una **adaptación lingüística fiel**, no como una reescritura libre. Debe conservar significado, intención, tono, ritmo, caracterización, estructura y hechos. Solo podrá adaptar expresiones idiomáticas o referencias cuando una traducción literal resulte antinatural o confusa, sin cambiar el contenido narrativo.

## Principios no negociables

1. El manuscrito original permanece intacto e inmutable.
2. Cada traducción es una versión independiente vinculada a la versión exacta de origen.
3. Toda intervención de traducción, revisión o corrección queda registrada en el historial editorial.
4. La app no afirmará que una traducción es perfecta ni que ha sido validada por una persona si no lo ha sido.
5. El catalán debe sonar escrito originalmente en catalán, no a español calcado.
6. La variante lingüística se identifica y mantiene de principio a fin.
7. Los nombres propios, términos del universo narrativo y decisiones editoriales se controlan mediante una memoria terminológica por proyecto.
8. Ante ambigüedades que puedan cambiar el sentido, se señala la duda en lugar de inventar una solución.
9. La traducción conserva la estructura y las referencias a ilustraciones, escenas y bloques del original.
10. El usuario puede comparar, aceptar, editar o descartar la traducción sin perder ninguna versión.

## Documentos

- `especificacion-funcional.md`: flujo, controles, entregables y reglas de fidelidad.
- `perfil-linguistico-catala.md`: conocimiento lingüístico y decisiones normativas iniciales.
- `arquitectura-y-memoria.md`: contexto, glosario, memoria de traducción y versionado.
- `evaluacion-calidad.md`: pruebas, métricas y revisión humana.

## Qué significa «conocer el idioma»

No se pretende almacenar una supuesta copia completa del catalán ni confiar en que un único prompt contenga todas sus reglas. El sistema combinará:
- un modelo lingüístico con capacidad real de catalán;
- una guía de estilo y perfil normativo versionados;
- fuentes lingüísticas y terminológicas fiables, consultables cuando sea necesario;
- glosario y memoria de traducción del proyecto;
- contexto completo del cuento;
- controles automáticos y revisión humana en casos sensibles.

La documentación lingüística debe poder actualizarse sin reescribir el motor. Las fuentes externas se consultarán respetando sus licencias y condiciones de uso.

## Alcance inicial

- Traducción de cuentos completos del español al catalán.
- Catalán estándar central como perfil inicial.
- Prosa infantil y juvenil, diálogos, títulos, dedicatorias, notas y textos de apoyo.
- Conservación de capítulos, párrafos, cursivas, negritas, marcadores de ilustración y estructura.
- Comparación bilingüe y revisión por segmentos.
- Glosario por colección/personajes y memoria reutilizable entre cuentos del mismo universo.
- Exportación de la traducción como nueva versión del manuscrito, lista para pasar al taller de maquetación.

No incluye inicialmente traducción jurada, localización legal ni certificación oficial.
