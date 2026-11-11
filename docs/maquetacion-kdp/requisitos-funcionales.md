# Requisitos funcionales — Taller de Maquetación

**Estado:** propuesta de producto para implementación.

## 1. Gestión del proyecto editorial

Cada proyecto de maquetación debe guardar:
- título, subtítulo, autoría, ilustración, editorial/sello y colección;
- idioma, dirección de lectura y público/edad orientativa;
- descripción, palabras clave y categorías como metadatos de referencia;
- versión exacta del manuscrito fuente y fecha de importación;
- destino(s) de publicación y perfil de salida;
- estado: borrador, en maquetación, revisión, preflight con incidencias, listo para exportar, exportado.

Los metadatos comerciales de KDP se preparan como ficha de apoyo; la publicación y carga en KDP seguirán siendo acciones del usuario salvo integración oficial futura.

## 2. Formatos y geometría

El usuario podrá seleccionar:
- tamaños predefinidos por perfil y tamaños personalizados;
- unidades mm, cm, pulgadas y puntos;
- orientación vertical u horizontal;
- páginas simples, páginas enfrentadas o pliegos;
- encuadernación izquierda/derecha cuando el idioma/destino lo requiera;
- interior sin sangrado o con sangrado;
- márgenes superior, inferior, exterior e interior (medianil);
- zona segura, sangrado y, para impresión local, marcas de corte opcionales;
- número de columnas, separación entre columnas y retícula.

No presentar todas las dimensiones como compatibles con KDP: el selector debe filtrar según mercado, formato de libro, tinta, papel y encuadernación vigentes. Los tamaños personalizados deben marcarse como impresión local si KDP no los admite para esa combinación.

## 3. Tipografía y sistema de estilos

Permitir elegir fuentes disponibles y legalmente utilizables, con control de:
- familia, variante, peso, tamaño, color y alineación;
- interlineado, espaciado antes/después y sangría;
- versalitas/mayúsculas, ligaduras y guionado;
- estilos de párrafo: cuerpo, título, subtítulo, capítulo, entradilla, cita, pie de imagen, nota, índice, créditos y colofón;
- estilos de carácter: énfasis, negrita, cursiva, versalitas y enlaces;
- jerarquía consistente y aplicación global por estilo.

Requisitos de fuente:
- comprobar licencia y permiso de incrustación;
- incrustar fuentes en el PDF cuando la licencia lo permita;
- detectar sustituciones, fuentes ausentes y glifos no soportados;
- no convertir texto en imagen como solución general;
- conservar caracteres españoles, acentos, signos, comillas y alfabetos del idioma del libro.

Ofrecer combinaciones tipográficas sugeridas por género/edad como presets editables, nunca como reglas obligatorias. La selección debe incluir vista previa real de caracteres y párrafos.

## 4. Paginación y secciones

El sistema debe permitir:
- folio arábigo, romano mayúsculo/minúsculo, letras o sin numeración;
- ubicación superior/inferior, interior/exterior o centrada;
- folio en páginas pares/impares y control de páginas enfrentadas;
- ocultar el número visible en portada, portadilla, páginas de cortesía y comienzos de capítulo sin perder la posición lógica;
- numeración preliminar romana y cuerpo arábigo;
- iniciar/reiniciar numeración por sección;
- cabeceras y pies variables por sección, capítulo o título;
- índice automático con folios actualizado tras recomposición;
- páginas en blanco intencionales y reglas para evitar que un capítulo comience en página incorrecta.

Los números de página se calculan después de la composición; nunca deben escribirse manualmente en el texto fuente.

## 5. Composición de texto

- Importar el manuscrito aprobado desde Editor IA y mapear títulos, capítulos, párrafos, listas, notas y separadores.
- Conservar vínculo entre cada bloque maquetado y el fragmento fuente.
- Ajuste automático de texto con detección de desbordamientos.
- Control de viudas y huérfanas, líneas sueltas, títulos aislados y saltos.
- Separación silábica configurable y control de ríos tipográficos en fase avanzada.
- Saltos de página/sección manuales, con avisos si el contenido cambia.
- Índice, dedicatoria, prólogo, créditos, agradecimientos, bibliografía y colofón como elementos opcionales.
- Texto de relleno solo en previsualizaciones, claramente marcado y nunca exportable por accidente.

## 6. Ilustraciones y recursos visuales

Cada hueco de ilustración debe ser un objeto con:
- tipo: página completa, doble página, media página, tercio, cuarto, banda, columna, libre o decorativo;
- orientación y relación de aspecto;
- posición, tamaño, ajuste y alineación;
- modo de imagen: contener, cubrir, recortar o ajuste manual;
- texto alternativo/descripción interna, pie, crédito y titularidad/licencia;
- resolución efectiva al tamaño final;
- condición: placeholder, imagen vinculada, imagen incrustada, baja resolución o aprobada.

El usuario decide:
- cantidad de ilustraciones por página/capítulo;
- páginas con ilustración completa;
- escenas que ocupan dos páginas enfrentadas;
- imagen y texto en la misma página o separados;
- huecos reservados para ilustraciones pendientes;
- si una ilustración puede cruzar el medianil.

**Doble página:** almacenar la escena como una composición única asociada a dos páginas enfrentadas, pero generar dos páginas PDF independientes. Mostrar advertencia sobre pérdida/ocultación de contenido en el canal del lomo. Para KDP, no colocar información esencial en el área central de unión. Las imágenes que llegan al borde requieren perfil con sangrado y resolución adecuada.

Comprobaciones: resolución efectiva recomendada de 300 ppp para imágenes rasterizadas de impresión; transparencia, perfil de color, proporciones, recortes y recursos ausentes. El sistema debe advertir sobre imágenes pequeñas ampliadas. No inventar detalle mediante escalado IA sin consentimiento.

## 7. Plantillas y presets

Crear y guardar plantillas con:
- formato y perfil de impresión;
- márgenes, retícula y columnas;
- familias y estilos tipográficos;
- cabeceras, pies y folios;
- estilos de capítulo y páginas maestras;
- reglas para imágenes y pies;
- elementos preliminares/finales;
- reglas de saltos y blancos.

Plantillas iniciales recomendadas:
1. álbum ilustrado infantil;
2. cuento ilustrado con texto e imagen alternados;
3. novela infantil/juvenil;
4. libro de actividades;
5. libro de no ficción con recuadros;
6. folleto A4 apaisado a dos columnas;
7. cuadernillo A5 plegado desde A4;
8. libro de relatos;
9. interior minimalista de lectura.

## 8. Editor visual

- Seleccionar página, bloque de texto, ilustración o elemento decorativo.
- Cambiar tamaño, posición, alineación, ajuste y orden de capas.
- Bloquear elementos, duplicar, copiar estilo y deshacer/rehacer.
- Arrastrar una ilustración a un hueco y conservar el vínculo al recurso original.
- Mostrar guías, márgenes, sangrado, medianil y zona segura.
- Alertar ante elementos fuera de página o zonas no imprimibles.
- Reflujo automático cuando cambia texto, tipografía o tamaño; mostrar páginas afectadas.
- Permitir fijar manualmente ciertos saltos y composiciones, pero avisar de que pueden desajustarse al cambiar el manuscrito.

## 9. Exportaciones

- PDF interior KDP: páginas individuales en orden de lectura, tamaño final correcto, sangrado según perfil, sin imposición ni marcas de corte.
- PDF de cubierta KDP: archivo independiente, calculado con plantilla vigente del producto concreto.
- PDF de lectura: sin marcas técnicas, con enlaces/índice si procede.
- PDF de imprenta local: opciones de sangrado, marcas y perfil acordado con imprenta.
- PDF de cuadernillo impuesto: pliegos, orden de imposición, firmas y marcas opcionales.
- Informe de preflight y ficha de exportación con dimensiones, páginas, fuentes, imágenes y configuración.

## 10. Seguridad editorial y recuperación

- Guardado automático y versiones de maqueta.
- No sobrescribir el manuscrito original.
- Guardar recursos con nombres estables y evitar enlaces rotos.
- Confirmación antes de reemplazar imágenes o descartar cambios.
- Exportaciones identificadas por versión y fecha.
- Mostrar errores de generación; nunca ofrecer un archivo incompleto como listo para imprenta.
