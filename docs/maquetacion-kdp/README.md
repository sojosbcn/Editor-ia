# Taller de Maquetación y Preparación para Impresión (KDP)

**Estado:** especificación funcional y técnica — fase de diseño, no implementación.
**Fecha:** 10 de noviembre de 2026.
**Rama:** `feature/taller-maquetacion-kdp`.

## 1. Propósito

Añadir a Editor IA un departamento editorial independiente que transforme manuscritos, metadatos e ilustraciones en libros y publicaciones maquetadas, revisables y exportables. Su primer objetivo comercial es preparar interiores y cubiertas para Amazon Kindle Direct Publishing (KDP), sin limitar el producto a KDP ni confundir una maqueta visual con un PDF técnicamente validado.

El departamento debe servir también para folletos A4, cuadernillos plegados, materiales educativos, revistas y libros para impresión local.

## 2. Principio de producto

**El manuscrito y la maqueta son entidades separadas.** El texto corregido permanece intacto en el proyecto editorial. La maquetación crea una composición derivada con bloques vinculados al contenido. Cambiar tamaño, tipografía, plantilla o distribución no debe reescribir ni perder el original.

Flujo principal:

1. Seleccionar proyecto y versión aprobada del manuscrito.
2. Elegir destino: KDP, impresión local/folleto o lectura digital.
3. Definir formato, encuadernación, papel, tinta y sangrado.
4. Elegir plantilla visual y estilos tipográficos.
5. Distribuir capítulos, texto, ilustraciones, pies, blancos y elementos preliminares/finales.
6. Revisar páginas en vista individual y enfrentada.
7. Ejecutar preflight técnico y resolver incidencias.
8. Exportar PDF de interior, cubierta calculada por separado y paquete de control.

## 3. Departamentos y módulos

- **Proyecto de libro:** metadatos, versiones, idioma, público, colección, ISBN si procede y destino.
- **Configuración de publicación:** formato, orientación, encuadernación, tinta, papel, sangrado y dirección de lectura.
- **Sistema de diseño:** plantillas, retículas, márgenes, columnas, tipografías, jerarquías y estilos reutilizables.
- **Composición:** páginas, cajas de texto, imágenes, pies, ornamentos y saltos.
- **Ilustración:** huecos reservados, imágenes finales, página completa, doble página conceptual, media página y colocación libre.
- **Paginación:** folios, numeración romana/arábiga, secciones, páginas sin número visible y reinicio controlado.
- **Preflight:** fuentes, resolución, sangrado, márgenes, páginas vacías, desbordamientos y dimensiones.
- **Exportación:** PDF interior KDP, PDF de impresión local, pliego/cuadernillo impuesto y PDF de revisión.
- **Cubierta:** cálculo de lomo y plantilla descargada/generada según especificaciones vigentes de KDP; cubierta completa como archivo independiente.

## 4. Perfiles de salida

### A. Amazon KDP — interior de libro

Generar PDF en páginas individuales y en orden de lectura. No imponer pliegos ni colocar dos páginas del libro en una hoja: KDP realiza la imposición de producción. Configurar tamaño de corte, interior con o sin sangrado, blanco y negro o color, papel y tipo de encuadernación según las opciones que KDP ofrezca para el mercado y producto concretos.

### B. Amazon KDP — cubierta

Exportar cubierta completa (contraportada + lomo + portada) usando la plantilla vigente calculada para tamaño de corte, número final de páginas, papel y tipo de tinta/encuadernación. El ancho del lomo no debe estimarse con una constante. Si cambian páginas o papel, recalcular. Respetar zona de código de barras y áreas seguras.

### C. Impresión local / folleto

Permitir A4 vertical u horizontal, A5, carta y dimensiones personalizadas. Distinguir:
- página de diseño (por ejemplo, A4 apaisado con dos columnas);
- página final de lectura (por ejemplo, A5);
- pliego de impresión (dos páginas colocadas en una hoja);
- imposición de cuadernillo para plegado y encuadernación.

La imposición se ofrece solo para impresión local. Admitir cuadernillos de 4 páginas por pliego y múltiplos de cuatro, con firmas configurables y páginas blancas automáticas cuando corresponda.

### D. Lectura digital

Exportación de PDF de lectura y, en una fase posterior, EPUB reflowable o fixed-layout según el tipo de libro. No reutilizar automáticamente la imposición de impresión.

## 5. Experiencia de usuario

La interfaz debe ofrecer un asistente guiado y después un editor visual:
- panel de configuración y estilos;
- lienzo central con páginas;
- miniaturas navegables;
- vista de página individual, doble página y pliegos;
- panel de propiedades del elemento seleccionado;
- lista de incidencias y estado de preflight;
- acciones deshacer/rehacer, duplicar, bloquear, alinear y distribuir.

Debe ser usable en escritorio/tablet. En móvil, priorizar revisión, comentarios y cambios sencillos; no prometer edición de precisión equivalente a escritorio.

## 6. Entregables de esta especificación

- `requisitos-funcionales.md`: alcance y comportamiento esperado.
- `formatos-y-kdp.md`: reglas de publicación e impresión.
- `arquitectura-tecnica.md`: modelo de datos y componentes propuestos.
- `preflight-y-pruebas.md`: validaciones y criterios de aceptación.
- `roadmap.md`: fases y dependencias.

## 7. Límite de esta entrega

Esta rama documenta la especificación. **No incorpora todavía componentes React, motor de paginación, generador PDF ni integración API con KDP.** El repositorio debe inspeccionarse a nivel de código antes de fijar puntos de integración y dependencias. La aprobación técnica de un PDF debe contrastarse siempre con las especificaciones vigentes del producto KDP elegido; ningún validador propio puede garantizar la aceptación de Amazon.
