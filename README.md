# Plataforma Digital Fundación Exalumnos UCR

> **Plataforma MVP que conecta a exalumnos de la Universidad de Costa Rica con estudiantes becados mediante donaciones y oportunidades de empleabilidad.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](#)

---

## The Problem

Los estudiantes con beca socioeconómica de la UCR enfrentan desafíos económicos constantes y barreras significativas para la inserción laboral. Al mismo tiempo, los exalumnos que desean retribuir a su comunidad universitaria carecen de un canal estructurado, seguro y transparente para realizar donaciones verificadas o compartir oportunidades profesionales directamente con los estudiantes que más lo necesitan.

## The Solution

Una plataforma integral que conecta ambos perfiles a través de verificación de identidad con seguridad estricta a nivel de base de datos (RLS). Facilita y audita el proceso de donaciones, y además incluye un módulo de empleabilidad potenciado por Inteligencia Artificial (Claude), el cual adapta en tiempo real el currículum del estudiante a las vacantes publicadas por los exalumnos, asegurando formatos profesionales óptimos para sistemas ATS.

---

## Architecture

┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Client (Next.js) ───→  Server Actions ───→  Supabase  │
│    (RSC / CSR)           & Route Handlers   (Postgres)  │
│         ↑                        │                      │
│     Realtime  ←──────────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

La arquitectura está basada en Next.js (App Router). El cliente envía datos a través de *Server Actions* y *Route Handlers* donde la autenticación se verifica a nivel servidor. Esto asegura que todas las consultas a Supabase pasen por políticas estrictas de *Row Level Security (RLS)*. Para funcionalidades en tiempo real, como notificaciones de denuncias y donaciones, se emplean los canales de *Supabase Realtime*.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 + React 18 + Tailwind | App router habilita RSC, protegiendo datos sensibles en el panel y reduciendo carga en el cliente. |
| Backend | Next.js Server Actions | Simplifica la mutación de datos unificando la API con el Frontend en el mismo stack. |
| Database | PostgreSQL + Supabase | Permite almacenar datos relacionales robustos con control de acceso por roles (RLS). |
| Auth | NextAuth v5 + Supabase SSR | Facilita "Magic Links" y autenticación cruzada con control completo de cookies en el servidor. |
| AI | Anthropic Claude Sonnet | Amplio contexto (200k tokens) e integración fluida en streaming para adaptación de CVs. |
| Email | Resend | Excelente SDK y deliverability para Magic Links, alertas y notificaciones transaccionales. |

> **Design decisions worth noting:**
> — **Uso estricto de `@supabase/ssr`:** Necesario sobre el cliente normal de Supabase para forzar la evaluación de las políticas RLS en el servidor (SSR) e impedir filtraciones de datos si se hacen llamadas directas a la API.
> — **NextAuth v5 (Auth.js) para transacciones email:** Se optó por usar el proveedor de email propio (Magic Links transaccionales) con Resend en Next.js, logrando así sesiones seguras sin contraseña para todos los perfiles de forma nativa.

---

## Key Features

- **Gestión de Donaciones** — Procesamiento y validación de donaciones (SINPE/IBAN) con comprobantes, estados de auditoría y confirmaciones automáticas por email.
- **Módulo de Empleabilidad con IA** — Permite que los estudiantes comparen y optimicen sus currículums (hasta en 10 versiones) contra vacantes activas. Todo se renderiza en tiempo real mediante *streaming* con Claude-Sonnet.
- **Directorio Inteligente y Perfiles** — Gestión segmentada (admin, estudiante, exalumno) con políticas de seguridad de datos garantizadas a nivel BD; los estudiantes no ven información administrativa.
- **Auditoría y Realtime** — Panel administrativo con notificaciones en vivo de reportes, alertas de suspensión automática de cuentas y validación de documentos y perfiles.

---

## Getting Started

### Prerequisites

```bash
node >= 18.17.0
supabase-cli >= 1.178.2 # (Opcional, para desarrollo local)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/tayroarce-lab/fundacion-exalumnos-ucr.git
cd fundacion-exalumnos-ucr/exalumnos_ucr

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values (Supabase, Resend, Anthropic, Auth Secret)

# Run local database services (Supabase)
npm run supabase:start

# Or run locally against a remote DB
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase Anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role for bypass RLS | ✅ |
| `AUTH_SECRET` | NextAuth JWT signing secret | ✅ |
| `ANTHROPIC_API_KEY` | Claude API key para el generador de CVs | ✅ |
| `RESEND_API_KEY` | Resend API key para envío de correos | ✅ |

---

## API Reference

Dado el uso de Next.js y Server Actions, las mutaciones se hacen a nivel de funciones y no existen rutas REST convencionales, a excepción de las integraciones con servicios web (ej. Webhooks).

> Todas las invocaciones principales a la API se validan mediante **Zod Schemas** (`zod`).

```typescript
// Ejemplos conceptuales del flujo de Server Actions

POST   /api/auth/[...nextauth]    Autenticación y envío de Magic Links

STREAM /api/cv/adaptar/route.ts   Adapta un CV en tiempo real con Anthropic

ACTION suspenderCuenta(id)        Suspende a un usuario tras reportes

ACTION crearDonacion(data)        Sube el comprobante y registra donación
```

---

## Project Structure

```text
src/
├── app/             # Next.js App Router (Páginas, layouts, server components)
├── components/      # Componentes UI reutilizables (Shadcn UI, Radix)
├── config/          # Validación de entorno y configuración general
├── lib/             # Clientes compartidos (Supabase, Resend, Anthropic)
├── middlewares/     # Middleware de Next.js (Protección de rutas)
├── models/          # Definición de tipos TypeScript y esquemas de Zod
└── supabase/        # Migraciones SQL, tipos generados, funciones PL/pgSQL
```


---

## Authors

- Joaquín Aguilar,
- Ransés Alvir,
- Daniela Fernandez,
- Alejandro Hernández,
- Gerson Dinarte,
- Mariel Lefebre,
- Tayro Arce
Full Stack Developers · AI Automation Engineers  
