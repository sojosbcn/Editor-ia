# Guía de integración para Editor IA

## Objetivo

Usar la memoria como apoyo de investigación y criterio editorial al generar cuentos, sin convertirla en una plantilla rígida ni presentar los patrones de éxito como garantías.

## Flujo de consulta

1. **Perfil lector:** edad exacta o tramo, lectura autónoma/compartida, nivel de vocabulario, longitud y tolerancia a tensión.
2. **Intención:** entretener, emocionar, explicar, acompañar una transición, despertar curiosidad o combinar objetivos.
3. **Recuperación de referencias:** seleccionar 3–7 obras relevantes por edad, forma, tema y tradición. Incluir como mínimo una referencia no comercial o histórica cuando aporte valor.
4. **Comparación:** identificar recursos transferibles en términos abstractos: estructura, ritmo, tipo de conflicto, humor, repetición, voz, texto-imagen, relectura.
5. **Originalidad:** crear personajes, mundo, conflicto, secuencias y lenguaje propios. No pedir «escribe como [autor vivo]» ni reproducir una franquicia.
6. **Diseño narrativo:** logline, protagonista, deseo, obstáculo, decisiones, escalada, giro, clímax, resolución y cambio emocional.
7. **Redacción:** adecuar sintaxis, vocabulario, longitud de frase y carga conceptual a la edad; comprobar la lectura en voz alta.
8. **Evaluación:** valorar claridad, emoción, ritmo, causalidad, originalidad, representación, coherencia, potencial visual y adecuación.
9. **Edición:** realizar una pasada literaria, otra de edad/lectura, otra de continuidad y otra de derechos/originalidad.

## Matriz de evaluación propuesta

Puntuar de 1 a 5 y justificar cada nota:
- Gancho inicial
- Claridad del deseo del protagonista
- Conflicto y progresión
- Agencia del personaje infantil
- Ritmo y musicalidad
- Emoción y resonancia
- Calidad del cierre
- Relación texto-imagen
- Adecuación a edad
- Originalidad y distancia respecto a obras conocidas
- Potencial de relectura
- Interés comercial plausible (señal cualitativa, nunca predicción garantizada)

La puntuación no sustituye la lectura humana ni debe ocultar problemas graves mediante un promedio.

## Instrucción de sistema sugerida

«Consulta la memoria de literatura infantil cuando diseñes o evalúes cuentos. Distingue canon, crítica y datos comerciales. Toda afirmación de ventas debe incluir territorio, periodo, formato, cobertura y fuente. Usa las obras como referencias de análisis, nunca como moldes para copiar. No imites la voz de autores vivos ni reproduzcas elementos protegidos. Prioriza una historia original, emocionalmente verosímil, adecuada a la edad y con decisiones que produzcan consecuencias. Si los datos disponibles no cubren el mercado objetivo, dilo y no extrapoles rankings extranjeros.»

## Requisito técnico futuro

La documentación de este directorio aún no está conectada automáticamente al prompt ni al flujo de generación de la aplicación. Para que la IA la consulte en tiempo de ejecución, habrá que implementar una capa RAG o un servicio de recuperación documental:
- indexar Markdown/JSON en fragmentos con metadatos;
- filtrar por edad, idioma, tema, género, país y fecha;
- recuperar fuentes y evidencia junto con cada referencia;
- inyectar contexto limitado y relevante en el prompt;
- registrar qué fuentes se usaron en cada generación;
- permitir actualización editorial sin desplegar el frontend;
- añadir pruebas de recuperación y de no alucinación de cifras.

No declarar la memoria «integrada en la IA» hasta implementar y probar este paso.
