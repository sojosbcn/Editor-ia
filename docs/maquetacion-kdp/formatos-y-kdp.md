# Formatos de impresión, cuadernillos y Amazon KDP

**Documento operativo.** Las especificaciones de KDP cambian y dependen de mercado, encuadernación, tinta, papel, tamaño y número de páginas. Antes de exportar debe verificarse la documentación/calculadora oficial vigente para el producto elegido.

## 1. Conceptos que la interfaz debe distinguir

- **Formato de corte (trim size):** dimensiones de cada página terminada del libro.
- **Página de composición:** superficie donde se distribuye texto e imagen.
- **Pliego:** hoja física que puede contener varias páginas.
- **Página enfrentada/doble página:** dos páginas contiguas vistas juntas en el libro abierto.
- **Imposición:** orden especial de páginas sobre pliegos para plegado/encuadernación.
- **Sangrado (bleed):** extensión de imagen/fondo más allá de la línea de corte.
- **Medianil (gutter):** margen interior que compensa la zona de encuadernación.
- **Zona segura:** área donde debe permanecer el contenido importante.

No usar estos términos como sinónimos.

## 2. Perfiles principales

### Perfil A — KDP tapa blanda

Configurar:
- tamaño de corte admitido para la combinación seleccionada;
- interior blanco y negro o color, tipo de papel disponible;
- encuadernación y dirección de lectura;
- con/sin sangrado;
- número final de páginas;
- márgenes interiores/exteriores conforme a la tabla oficial vigente;
- cubierta completa según plantilla calculada.

El interior se entrega en PDF de páginas individuales y secuenciales. No generar imposición de cuadernillo ni spreads de dos páginas en el PDF de interior.

### Perfil B — KDP tapa dura

Activar solo combinaciones que KDP admita en ese momento. Reglas de cubierta, lomo, guardas, áreas seguras y dimensiones no deben extrapolarse de tapa blanda. La plantilla de cubierta debe ser específica de tapa dura.

### Perfil C — KDP libro infantil ilustrado

Presets para páginas con ilustraciones abundantes, color, sangrado y páginas enfrentadas. No asumir que todos los tamaños apaisados, cuadrados o tipos de papel están disponibles en todas las opciones. El asistente debe validar la combinación concreta antes de etiquetarla como compatible.

### Perfil D — folleto y cuadernillo de impresión local

Ejemplo: hoja A4 horizontal doblada para formar páginas A5. La composición de lectura se crea como páginas A5. Después, el motor de imposición coloca las páginas en el pliego A4 en el orden correcto.

Para un cuadernillo de una sola firma de 16 páginas, el par de páginas de cada cara se determina por la fórmula de imposición, no por orden visual. En un ejemplo convencional de lectura izquierda-a-derecha, el primer pliego incluye las páginas 16 y 1 en una cara y 2 y 15 en la otra; la orientación exacta depende de volteo, impresora y plegado. La aplicación debe mostrar esquema de prueba y permitir imprimir una maqueta de control.

El número de páginas de cuadernillo se completa a múltiplos de cuatro. Para libros extensos, dividir en firmas configurables según papel, gramaje y encuadernación; no asumir que una única firma sirve para cualquier grosor.

## 3. Cubierta KDP

La cubierta es un archivo diferente del interior. Su dimensión total depende de:
- altura y anchura de corte;
- lomo, determinado por número de páginas y especificación del papel/tinta;
- sangrado;
- tipo de encuadernación;
- áreas de seguridad y zona de código de barras.

Proceso obligatorio:
1. Fijar tamaño, papel, tinta, encuadernación y paginación final.
2. Obtener la plantilla de cubierta oficial/calculada para esa combinación.
3. Componer portada, lomo y contraportada dentro de la plantilla.
4. Validar textos, elementos y fondos respecto a sangrado y zonas seguras.
5. Exportar cubierta como PDF independiente.
6. Si cambia el número de páginas o el papel, invalidar la plantilla anterior y recalcular.

No estimar ancho del lomo mediante una cifra fija ni reutilizar una plantilla de otro libro.

## 4. Sangrado y dimensiones

La aplicación debe manejar el sangrado como parámetro del perfil, no como un valor global. Para KDP, aplicar las dimensiones y extensiones indicadas por la guía oficial vigente para el tipo de interior. Una página con sangrado necesita que los elementos que llegan al borde se extiendan fuera de la línea de corte; el tamaño de página PDF cambia en consecuencia.

No añadir marcas de corte al PDF KDP salvo que la especificación oficial del producto las solicite expresamente. Mantener contenido crítico dentro de la zona segura.

## 5. Fuentes, imágenes y color

- Incrustar fuentes compatibles y verificar que no se sustituyan.
- Evitar fuentes con restricciones de incrustación.
- Usar imágenes con resolución efectiva suficiente al tamaño de impresión; objetivo recomendado habitual: 300 ppp.
- Comprobar transparencias, recortes, perfiles y elementos rasterizados.
- No prometer una correspondencia cromática absoluta entre pantalla e impresión.
- Informar que la conversión de color y el resultado físico pueden variar según el proceso de impresión.

## 6. Preflight de KDP

Comprobar como mínimo:
- tamaño PDF y tamaño de corte esperado;
- número de páginas y orden;
- compatibilidad de la combinación de formato;
- sangrado correcto;
- márgenes y medianil según páginas;
- fuentes incrustadas y glifos;
- resolución de imágenes;
- imágenes y fondos que alcanzan el borde;
- texto fuera de zona segura;
- páginas vacías accidentales;
- páginas con contenido cortado o desbordado;
- elementos esenciales cerca del lomo;
- cubierta y lomo recalculados con datos finales.

La aplicación puede decir **“preflight interno superado”**, nunca “Amazon garantiza la aceptación”. El usuario debe revisar el archivo en el Previewer de KDP y el resultado físico de una prueba cuando sea posible.

## 7. Fuentes oficiales a mantener en el sistema

Guardar enlaces versionados y fecha de última comprobación a:
- KDP Help: Paperback Manuscript Formatting.
- KDP Help: Hardcover Manuscript Formatting.
- KDP Help: Paperback Cover Templates / Cover Calculator.
- KDP Help: Trim Size, Bleed and Margins.
- KDP Help: Print Options and Color Ink.
- KDP Print Previewer.

La implementación debe consultar o actualizar estas reglas desde fuentes oficiales; no codificar como eternos valores que pueden cambiar. Si no hay API oficial disponible para una validación, presentar una lista de comprobación actualizada y enlazar la fuente.
