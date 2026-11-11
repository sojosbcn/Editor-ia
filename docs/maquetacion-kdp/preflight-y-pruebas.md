# Preflight, control de calidad y pruebas

## 1. Niveles de validación

- **Error bloqueante:** el archivo no puede marcarse como listo (por ejemplo, recurso ausente, PDF corrupto, tamaño incorrecto o texto cortado).
- **Advertencia:** puede imprimirse, pero requiere revisión (por ejemplo, imagen con resolución baja, texto cerca del medianil, viudas/huérfanas).
- **Información:** dato de control (por ejemplo, fuentes incrustadas, total de páginas, perfil aplicado).

El panel debe diferenciar los tres niveles y permitir saltar a la página y elemento afectado.

## 2. Pruebas geométricas

- Conversión exacta entre mm, pulgadas, puntos y píxeles de vista previa.
- Tamaños de página sin sangrado y con sangrado.
- Márgenes distintos en páginas pares/impares.
- Medianil según perfil y recuento.
- Columnas y medianiles de columna.
- Orientación vertical/horizontal.
- Zonas seguras y elementos fuera de página.

## 3. Pruebas tipográficas

- Fuentes incrustadas y sustituciones.
- Caracteres españoles: á, é, í, ó, ú, ü, ñ, ¿, ¡ y comillas.
- Negrita/cursiva y variantes reales.
- Glifos ausentes.
- Saltos y reflujo al cambiar fuente o tamaño.
- Viudas, huérfanas, líneas sueltas y títulos aislados.
- Índice y folios después de recomponer.
- Texto largo, listas, notas y párrafos extensos.

## 4. Pruebas de ilustración

- Imagen a página completa con y sin sangrado.
- Doble página con dos salidas individuales y continuidad visual.
- Zona central protegida.
- Resolución efectiva al tamaño final.
- Transparencia y formatos no admitidos.
- Recorte, cubrir/contener y proporciones.
- Hueco reservado que no se confunde con una imagen final.
- Imagen vinculada ausente o modificada.

## 5. Pruebas de imposición local

Usar cuadernillos de 4, 8, 12, 16, 24 y 32 páginas:
- comprobar orden de lectura tras plegado;
- comprobar frente/reverso y giro;
- encuadernación izquierda y derecha;
- firma y páginas blancas;
- impresión a doble cara con volteo por borde corto/largo;
- imprimir prototipo numerado y verificar físicamente.

La imposición no se considera validada solo porque el PDF abra correctamente.

## 6. Pruebas de aceptación KDP

Para cada combinación de formato, papel, tinta, sangrado y encuadernación:
1. generar interior PDF de páginas individuales;
2. comprobar tamaño, recuento, fuentes, imágenes y márgenes;
3. generar cubierta desde plantilla específica;
4. revisar interior y cubierta en KDP Print Previewer;
5. registrar incidencias y versión de especificaciones consultadas;
6. corregir y repetir.

Criterio: el preflight interno no presenta errores bloqueantes y el Previewer oficial no muestra incidencias sin resolver. La aceptación final depende de KDP y no puede garantizarse desde Editor IA.

## 7. Casos de regresión imprescindibles

- Manuscrito de 8 páginas y libro de 300 páginas.
- Cambio de fuente que aumenta el número de páginas.
- Añadir/eliminar ilustración y recalcular cubierta.
- Título largo que ocupa varias líneas.
- Capítulo que debe comenzar en página impar.
- Página intencional sin folio visible.
- Imagen a doble página con texto próximo al lomo.
- Texto que desborda tras modificar un párrafo.
- Documento A4 horizontal a dos columnas.
- Cuadernillo A4 doblado a A5.
- Exportación repetida de la misma versión para comparar consistencia.

## 8. Definición de “listo para exportar”

Una maqueta solo obtiene estado listo si:
- no hay errores bloqueantes;
- todos los recursos están disponibles;
- no existen desbordamientos;
- fuentes y caracteres son válidos;
- dimensiones y sangrado coinciden con el perfil;
- paginación e índice están actualizados;
- el tipo de exportación corresponde al destino;
- el informe registra motor, perfil y versión de reglas.

Para KDP se añadirá el estado posterior “revisado en Previewer”, que requiere confirmación explícita del usuario.
