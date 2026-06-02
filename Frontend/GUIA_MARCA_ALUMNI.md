# 📘 MANUAL DE IDENTIDAD Y DIRECTRICES DE DESARROLLO - ALUMNI UCR
> [cite_start]**Versión:** 1.0 (Septiembre 2025) [cite: 4]
> [cite_start]**Propósito:** Guía de uso estricto para la generación de código, maquetación UI/UX, diseño visual y contenido para la Fundación Exalumnos de la Universidad de Costa Rica[cite: 5, 178].

---

## 🎨 1. SISTEMA VISUAL Y SIGNIFICADO
[cite_start]Todos los elementos gráficos se apoyan en formas geométricas simples y colores vibrantes[cite: 24]:
* [cite_start]**Círculos:** Representan a los exalumnos formando comunidad[cite: 66].
* [cite_start]**Columnas/Arcos estilizados:** Inspirados en el campus de la UCR (referencia arquitectónica sutil)[cite: 67].
* [cite_start]**Puente/Caminos que se unen:** Simbolizan el regreso de los exalumnos para fortalecer a la universidad[cite: 69].
* [cite_start]**Bloques geométricos:** Representan solidez y estructura[cite: 26].
* [cite_start]**Flor:** Asociación directa al girasol de la universidad[cite: 26].

---

## 📐 2. DIRECTRICES DEL LOGO Y VARIACIONES
[cite_start]El logotipo solo puede aparecer en las versiones y combinaciones oficiales[cite: 72]. [cite_start]Se debe mantener un espacio libre mínimo designado alrededor del logotipo equivalente a la altura de los 3 círculos del mismo[cite: 123, 124].

### 🔹 Dimensiones Mínimas en Digital
* [cite_start]**Versión Vertical:** Mínimo **52 px** de ancho[cite: 127]. (Uso: Espacios reducidos, cuadrados, elementos centrados y protagonistas) [cite_start][cite: 96, 100].
* [cite_start]**Versión Horizontal:** Mínimo **100 px** de ancho[cite: 127]. (Uso: Formatos rectangulares, lectura lineal, aplicaciones corporativas formales) [cite_start][cite: 103, 105, 106].
* [cite_start]**Emblema (Solo Isotipo):** Mínimo **33 px** de ancho[cite: 129]. (Uso: Escala reducida, íconos, favicons) [cite_start][cite: 128].

### 🟢 Combinaciones de Color Permitidas
* [cite_start]**Logo Blanco:** Aplicable únicamente sobre fondos de color sólido[cite: 73].
* [cite_start]**Logo Esmeralda:** Aplicable sobre fondo blanco y colores degradados primarios[cite: 74].
* [cite_start]**Logo Negro:** Aplicable exclusivamente sobre fondos blancos[cite: 75].

---

## 🎨 3. PALETA DE COLORES OFICIALES

### 🔴 Colores Primarios
| Color | HEX | RGB | CMYK | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Esmeralda** | `#004C63` | `0, 76, 99` | `100, 23, 0, 61` | [cite_start]Fondos, textos institucionales, logo[cite: 74, 133]. |
| **Celeste** | `#54BCEB` | `84, 188, 255` | `59, 7, 0, 0` | [cite_start]Elementos destacados, interfaces, fondos[cite: 133]. |
| **Amarillo** | `#FF9B18` | `255, 155, 24` | `0, 39, 91, 0` | [cite_start]Acentos visuales, formas geométricas[cite: 133]. |
| **Naranja** | `#F34B26` | `243, 75, 38` | `0, 69, 84, 5` | [cite_start]Bloques de impacto, banners[cite: 133]. |
| **Negro** | `#141414` | `20, 20, 20` | `72, 66, 65, 79` | [cite_start]Texto base, contrastes de alta lectura[cite: 133]. |
| **Blanco** | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | [cite_start]Fondos limpios, texto en fondos oscuros[cite: 133]. |

### 🟡 Colores Disminuidos Autorizados
[cite_start]*(Uso exclusivo en titulares secundarios, decoración y fondos específicos)* [cite: 136]
* [cite_start]**Celeste Alterno:** `#006AD3` (RGB: `0, 106, 211`) [cite: 137]
* [cite_start]**Turquesa:** `#004C63` (Degradación autorizada) [cite: 135, 137]
* [cite_start]**Beige:** `#FF9B18` (Degradación autorizada) [cite: 135, 137]
* [cite_start]**Rosa:** `#F34B26` (Degradación autorizada) [cite: 135, 137]

---

## 🔤 4. JERARQUÍA TIPOGRÁFICA STRICTA

1. [cite_start]**TÍOS Y ENCABEZADOS (H1, H2):** * **Fuente:** `Barlow Semi Condensed` (Estilos: *Bold* o *Black*)[cite: 153, 155].
   * [cite_start]**Regla:** Siempre en **MAYÚSCULAS**, de 10 palabras o menos[cite: 170, 171].
2. [cite_start]**SUBTÍTULOS:** * **Fuente:** `Elza Text` (Estilo: *Bold*)[cite: 173].
   * [cite_start]**Regla:** Siempre en **MAYÚSCULAS**[cite: 173].
3. [cite_start]**DESTACADOS / FRASES CLAVE:** * **Fuente:** `Elza Text` (Estilo: *Bold*)[cite: 174].
   * [cite_start]**Regla:** Uso de Mayúsculas y Minúsculas convencionales[cite: 174].
4. [cite_start]**CUERPO DE TEXTO:** * **Fuente:** `Elza Text` (Estilos: *Regular* o *Medium*)[cite: 175].
5. **FALLBACK / TIPOGRAFÍA ALTERNA:** * **Fuente:** `Work Sans`[cite: 165].
   * [cite_start]**Regla:** Utilizar **ÚNICAMENTE** si `Elza Text` no está disponible en la plataforma[cite: 165, 166].

---

## 💻 5. ESTÁNDARES DE CÓDIGO Y BUENAS PRÁCTICAS
Al generar código para esta marca, se deben cumplir obligatoriamente las siguientes directrices técnicas:

* 🚫 **PROHIBIDO estilos inline o en JS:** Toda la capa visual se maneja de forma centralizada en archivos `.css` independientes.
* 🚫 **PROHIBIDO el uso de etiquetas `<form>` tradicionales:** Toda interacción, envío o manejo de datos se procesa de forma dinámica utilizando exclusivamente el evento click (`onClick`) en los elementos interactivos del DOM.
* 🟢 **Nombres en Español:** Todas las funciones, componentes lógicos y variables del backend/frontend deben nombrarse en español claro y descriptivo.
* 🟢 **Verde Funcional:** En la documentación técnica o comentarios de código, utilizar marcas o letras verdes para especificar la ubicación y flujo de las funciones.