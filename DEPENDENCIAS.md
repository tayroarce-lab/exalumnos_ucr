# 📦 Documentación de Dependencias
## Plataforma Digital — Fundación Exalumnos UCR

> **Versión del documento:** 1.0.0  
> **Stack:** Next.js 14 · Supabase · NextAuth v5 · Resend · Anthropic Claude  
> **Última actualización:** Junio 2026

---

## Índice

1. [Core del Framework](#1-core-del-framework)
2. [Base de Datos y Backend](#2-base-de-datos-y-backend)
3. [Autenticación](#3-autenticación)
4. [Comunicaciones y Correo](#4-comunicaciones-y-correo)
5. [Inteligencia Artificial](#5-inteligencia-artificial)
6. [Interfaz de Usuario y Estilos](#6-interfaz-de-usuario-y-estilos)
7. [Validación y Tipado](#7-validación-y-tipado)
8. [Herramientas de Desarrollo](#8-herramientas-de-desarrollo)

---

## 1. Core del Framework

### `next` — `^14.2.0`
**Requerimiento:** Toda la plataforma.

Next.js 14 con App Router es el núcleo de la plataforma. Se eligió esta versión específica porque el **App Router** habilita React Server Components (RSC), lo que permite renderizar en el servidor las vistas del panel administrativo (datos sensibles de becas y auditoría) sin exponer lógica al cliente. Los **Server Actions** integrados simplifican la mutación de datos del directorio de estudiantes y exalumnos sin necesidad de crear endpoints REST adicionales.

> **Razón técnica:** Sin Next.js 14, el middleware de Row Level Security de Supabase no puede interceptar rutas correctamente en modo servidor, rompiendo la separación de roles `admin / estudiante / exalumno`.

---

### `react` — `^18.3.0` y `react-dom` — `^18.3.0`
**Requerimiento:** Base de renderizado de toda la UI.

React 18 introduce el modelo de Concurrent Rendering que es requisito de Next.js 14 App Router. El hook `useTransition` y `startTransition` se usarán específicamente en el módulo de **Streaming del CV con IA**, permitiendo que la interfaz siga respondiendo mientras Claude va generando el texto del CV adaptado en tiempo real.

---

## 2. Base de Datos y Backend

### `@supabase/supabase-js` — `^2.44.4`
**Requerimiento:** Toda la capa de persistencia (Módulos 1–6).

Es el cliente universal de Supabase para JavaScript. Gestiona:
- **CRUD** de las tablas de `estudiantes`, `exalumnos`, `donaciones`, `vacantes`, `reportes` y `versiones_cv`.
- **Supabase Storage**: subida y validación de comprobantes de donación (máximo 5 MB) y verificación de documentos de identidad del directorio.
- **Realtime**: notificaciones en el panel admin cuando llega una nueva denuncia o donación.

---

### `@supabase/ssr` — `^0.4.0`
**Requerimiento:** Autenticación con RLS · Protección de rutas sensibles · Módulo de becas.

Este paquete es **crítico y no intercambiable** con el cliente estándar. La razón es que maneja las cookies de sesión tanto en **Server Components** como en **Middleware de Next.js**, lo que permite que el Row Level Security (RLS) de PostgreSQL funcione correctamente en el servidor.

**Flujo concreto:** Cuando un `estudiante` con beca nivel 4 accede a `/dashboard/estudiante`, el middleware de Next.js usa `@supabase/ssr` para leer la cookie de sesión en el servidor, pasar el token de acceso al cliente de Supabase, y que la política RLS `auth.uid() = estudiante_id` se evalúe correctamente antes de devolver cualquier dato al cliente. Sin este paquete, el RLS solo funcionaría en el cliente (navegador), dejando los datos de becas expuestos en peticiones directas al API.

---

## 3. Autenticación

### `next-auth` — `5.0.0-beta.19`
**Requerimiento:** Módulo de autenticación · Magic Links · Sesiones de 30 días.

NextAuth v5 (también llamado Auth.js) fue elegido sobre alternativas como Clerk o Auth0 por tres razones estratégicas:

1. **Integración nativa con App Router:** La v5 expone un helper `auth()` que funciona en Server Components, Middleware y Route Handlers sin configuración adicional. Las versiones v4 y anteriores no son compatibles con el App Router de Next.js 14.

2. **Magic Links transaccionales:** La plataforma requiere que tanto estudiantes como exalumnos reciban un enlace de verificación por correo electrónico (sin contraseña). NextAuth v5 soporta el proveedor `Email` (Magic Links) que se conectará con el SDK de **Resend** como transporte SMTP personalizado.

3. **Sesiones de 30 días con JWT seguros:** Se configurará `session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }` para mantener la sesión activa 30 días. Los tokens JWT se firmarán con `AUTH_SECRET` y se almacenarán en cookies `httpOnly` y `Secure`, cumpliendo con las políticas de seguridad de datos universitarios.

---

## 4. Comunicaciones y Correo

### `resend` — `^3.3.0`
**Requerimiento:** Magic Links · Notificaciones de donación · Alertas de denuncia.

Resend es el proveedor de correo transaccional seleccionado por su API REST moderna y su SDK oficial para Node.js/TypeScript. Se utilizará para enviar:

- **Magic Links de acceso:** Correos de verificación al registrarse o iniciar sesión (sin contraseña) integrados como adaptador de transporte en NextAuth v5.
- **Confirmaciones de donación:** Email automático al donante (exalumno) y al receptor (estudiante) cuando se aprueba un comprobante de SINPE/IBAN.
- **Alertas administrativas:** Notificación al equipo de la Fundación cuando un perfil acumula 3 denuncias y es suspendido automáticamente.

> Se elegió Resend sobre SendGrid o Mailgun por su SDK más limpio, soporte nativo de React Email para plantillas, y mejor deliverability en dominios `.ucr.ac.cr`.

---

## 5. Inteligencia Artificial

### `@anthropic-ai/sdk` — `^0.24.3`
**Requerimiento:** Módulo de Empleabilidad · Optimización de CV con IA en tiempo real.

El SDK oficial de Anthropic para Node.js/TypeScript es el único mecanismo de acceso al modelo `claude-sonnet` requerido en el documento de especificaciones. Su uso en la plataforma es específico y técnicamente justificado:

**Flujo de Streaming del CV:**
1. El estudiante pega su CV actual y selecciona una vacante publicada por un exalumno.
2. El Route Handler en `app/api/cv/adaptar/route.ts` invoca `anthropic.messages.stream()` con el modelo `claude-sonnet`.
3. El SDK transforma la respuesta en un `ReadableStream` compatible con la API Web Streams del servidor de Next.js.
4. El cliente recibe los fragmentos del CV adaptado en tiempo real (token a token) mientras Claude los genera.

**Restricciones implementadas mediante prompt engineering:**
- Máximo 120 caracteres por viñeta (validado en el prompt del sistema).
- Formato ATS estricto (sin tablas, sin imágenes, encabezados simples).
- Máximo 10 versiones guardadas por estudiante (controlado en la base de datos).

> **Por qué no OpenAI:** El documento de requerimientos especifica explícitamente el modelo `claude-sonnet` de Anthropic. Además, Claude tiene un contexto de 200K tokens, lo que permite procesar CVs largos y descripciones de vacantes completas en una sola llamada.

---

## 6. Interfaz de Usuario y Estilos

### `tailwindcss` — `^3.4.4` · `postcss` — `^8.4.39` · `autoprefixer` — `^10.4.19`
**Requerimiento:** Sistema de diseño de toda la plataforma.

Tailwind CSS es el framework de estilos base. Se eligió sobre CSS Modules o Styled Components por su integración directa con Shadcn/ui, que es el sistema de componentes declarado en los requerimientos. `postcss` y `autoprefixer` son dependencias peer obligatorias de Tailwind.

---

### `lucide-react` — `^0.395.0`
**Requerimiento:** Iconografía consistente en toda la UI.

Librería de iconos SVG requerida en el stack. Se usa en conjunto con Shadcn/ui para los iconos del menú de navegación, acciones del panel administrativo (exportar CSV, suspender cuenta), estados de donaciones y el módulo de empleabilidad.

---

### `clsx` — `^2.1.1` · `tailwind-merge` — `^2.3.0` · `class-variance-authority` — `^0.7.0`
**Requerimiento:** Arquitectura de componentes de Shadcn/ui.

Estas tres utilidades son la infraestructura de Shadcn/ui:
- **`clsx`**: Combina clases CSS condicionalmente en los componentes.
- **`tailwind-merge`**: Resuelve conflictos de clases Tailwind cuando se sobreescriben estilos (ej: el botón de "Suspender cuenta" en el panel admin tiene variantes de color distintas al botón estándar).
- **`class-variance-authority` (CVA)**: Define variantes tipadas de componentes (ej: `Button` con variantes `destructive`, `outline`, `ghost`) sin repetir código CSS.

---

### Primitivos de `@radix-ui`
**Requerimiento:** Accesibilidad y componentes interactivos complejos.

Los paquetes `@radix-ui/react-*` son las dependencias de bajo nivel sobre las que Shadcn/ui construye sus componentes. Son headless (sin estilos propios), accesibles por defecto (WAI-ARIA) y altamente personalizables:

| Paquete | Uso en la plataforma |
|---|---|
| `@radix-ui/react-dialog` | Modal de confirmación de donaciones y suspensión de cuentas |
| `@radix-ui/react-dropdown-menu` | Menú de acciones en tablas del panel admin |
| `@radix-ui/react-label` | Labels accesibles en formularios de registro |
| `@radix-ui/react-separator` | Divisores visuales en el dashboard |
| `@radix-ui/react-toast` | Notificaciones no intrusivas (donación recibida, CV guardado) |
| `@radix-ui/react-avatar` | Fotos de perfil en directorios de estudiantes y exalumnos |
| `@radix-ui/react-slot` | Composición de componentes Button como enlaces (`<Button asChild>`) |

---

## 7. Validación y Tipado

### `zod` — `^3.23.8`
**Requerimiento:** Validación de formularios · Schemas de Server Actions · Tipos de API.

Zod es la librería de validación de schemas en TypeScript. Su uso es transversal a toda la plataforma:

- **Registro de usuarios:** Valida RUC de empresa del exalumno, carné universitario del estudiante, y nivel de beca (solo acepta valores 4 o 5).
- **Donaciones:** Valida que el monto sea positivo, que el IBAN tenga formato costarricense (`CR + 20 dígitos`), y que el comprobante adjunto sea una imagen de máximo 5 MB.
- **Server Actions:** Cada acción del servidor envuelta en `"use server"` valida su input con un schema Zod antes de tocar la base de datos.
- **Webhook de Resend:** Valida el payload del webhook de entrega de correos para el sistema de auditoría.

---

## 8. Herramientas de Desarrollo

### `typescript` — `^5.5.2`
**Requerimiento:** Calidad del código · Seguridad de tipos en toda la plataforma.

TypeScript es obligatorio en un proyecto con múltiples roles de usuario (`admin`, `estudiante`, `exalumno`), datos sensibles de becas, y lógica financiera (donaciones). El sistema de tipos previene errores en tiempo de compilación como asignar datos de un `estudiante` a la interfaz de un `exalumno`.

---

### `supabase` (CLI) — `^1.178.2` (devDependency)
**Requerimiento:** Gestión de migraciones · Entorno local de desarrollo · Tipos TypeScript.

La CLI de Supabase es una herramienta de desarrollo que permite:
- Ejecutar un entorno local de Supabase (PostgreSQL + Auth + Storage) con `supabase start`.
- Crear y aplicar **migraciones SQL** en la carpeta `supabase/migrations/` para la creación de tablas, índices, políticas RLS y funciones de matching score.
- Generar automáticamente los tipos TypeScript de la base de datos con `supabase gen types typescript`, que alimenta el archivo `types/supabase.ts`.

---

## Resumen de Decisiones Arquitectónicas

| Decisión | Alternativa Descartada | Razón |
|---|---|---|
| `@supabase/ssr` para cookies | `@supabase/supabase-js` solo en cliente | RLS no se evaluaría en el servidor |
| `next-auth v5` para Magic Links | `clerk`, `auth0` | Soporte nativo App Router + control total sobre el adaptador de email |
| `@anthropic-ai/sdk` (Claude) | `openai` SDK | Requisito explícito del cliente: modelo `claude-sonnet` |
| `resend` para correos | `nodemailer`, `sendgrid` | SDK más moderno, soporte React Email, mejor deliverability |
| `zod` para validación | `yup`, `joi` | Integración nativa con TypeScript y Server Actions de Next.js |

---

*Documento generado por el equipo de arquitectura de la Fundación Exalumnos UCR.*
