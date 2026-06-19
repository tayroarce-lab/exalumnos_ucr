# Briefing Técnico y de Negocio: Plataforma Exalumnos UCR

Este documento consolida los hallazgos técnicos extraídos directamente del código fuente y arquitectura del proyecto. Su objetivo es servir como insumo base (Ground Truth) para la redacción del pitch final.

## 1. El Problema Detectado en el Código
El código evidencia que la plataforma busca resolver dos grandes cuellos de botella para los estudiantes con beca socioeconómica y exalumnos UCR:
*   **Falta de optimización para la empleabilidad (Sistemas ATS):** Gran parte de los estudiantes no sabe redactar un currículum atractivo. El sistema integra un módulo de IA configurado estrictamente como un "Reclutador Profesional Senior" (`src/app/api/cv/adaptar/route.ts`) que no solo reescribe logros para hacerlos accionables y medibles, sino que cuenta con salvaguardas (guardrails) rigurosas para no alucinar información.
*   **Fricción en el networking y búsqueda de apoyo:** Encontrar un mentor o apoyo financiero suele ser manual y desestructurado. El código base implementa un algoritmo matemático nativo en base de datos (`calcular_score_matching` en PL/pgSQL) para vincular de forma automática la oferta y la demanda, eliminando la fricción de buscar a ciegas.

## 2. El Catálogo de Funcionalidades "Vendibles"

### Módulo/Feature: Adaptador de CV con IA (AI ATS Optimizer)
*   **Complejidad Técnica:** Utiliza Vercel AI SDK con `streamObject` y el modelo `gpt-4o-mini` para generar sugerencias estructuradas en tiempo real. Utiliza validación estricta de esquemas (Zod) para asegurar que el output devuelva el bloque afectado, el texto original y la sugerencia. Tiene reglas "anti-alucinación" explícitas en el prompt y mecanismos "Fail-Soft" (ej. en `cv/rewrite/route.ts` maneja límites de caracteres estrictos).
*   **Beneficio para el Pitch:** El estudiante obtiene un currículum perfecto, adaptado milimétricamente a la posición a la que aplica con 1 solo clic. Incrementa radicalmente sus probabilidades de contratación sin tener experiencia previa redactando CVs.

### Módulo/Feature: Algoritmo de Matching Automatizado
*   **Complejidad Técnica:** Lógica pesada delegada al motor de base de datos (Supabase/PostgreSQL). Calcula un `score_match` (0-100 pts) evaluando 4 criterios: afinidad de carrera (+30), intersección de áreas de interés (+30), afinidad sector-proyecto (+20) y tipo de apoyo cruzado (+20). Actualiza estados tipados (`sugerido`, `contactado`, `activo`, `cerrado`).
*   **Beneficio para el Pitch:** No somos un simple directorio telefónico. Somos un "Tinder Profesional Inteligente" que ahorra decenas de horas; el exalumno y el estudiante son vinculados por verdadera afinidad matemática de habilidades e intereses.

### Módulo/Feature: Bolsa de Empleo y Tracking de Aplicaciones Seguras
*   **Complejidad Técnica:** Implementación robusta de Row Level Security (RLS) en Supabase (`10_job_applications.sql`). El sistema garantiza por arquitectura de base de datos que un exalumno únicamente puede ver y modificar los estados (`enviada`, `en_revision`, `seleccionado`) de los aplicantes a *sus* posiciones, con almacenamiento seguro en buckets privados.
*   **Beneficio para el Pitch:** Privacidad nivel empresarial. Garantizamos a los exalumnos corporativos que los datos y currículums son completamente privados y su gestión está blindada, generando la confianza necesaria para que publiquen puestos de alto nivel.

## 3. El "Demo Flow" (El Momento WOW)
Este es el flujo más impresionante que el código permite demostrar en vivo:
1.  **El Match Inicial:** El estudiante hace login. Automáticamente en su dashboard (rutas `mis-matches`), el motor SQL ya hizo el trabajo pesado y le sugiere al "Exalumno Perfecto" con un score de 95/100, validando que coinciden en carrera e interés.
2.  **La Oportunidad:** El estudiante entra al perfil del exalumno y ve una "Posición" (Mentoría o Empleo) abierta.
3.  **La Magia de la IA (El WOW):** Antes de aplicar, el estudiante va a su módulo de CV. Presiona "Adaptar a Puesto". En pantalla, de forma dinámica (Streaming UI), la IA comienza a reescribir sus viñetas genéricas en viñetas de impacto (con verbos de acción y métricas) y le pide que complete los datos faltantes justificando por qué un reclutador lo necesita.
4.  **Exportación y Aplicación:** El estudiante aprueba los cambios, genera instantáneamente un PDF pulido a nivel visual y hace clic en "Aplicar". Del lado del exalumno, la solicitud entra de forma segura en un panel de revisión de estado.

## 4. La Ventaja Competitiva Técnica
El stack tecnológico y las dependencias (`package.json`) demuestran que **no es un prototipo ni un mockup, es software listo para escalar**:
*   **Framework Premium:** Construido en Next.js 14 App Router, React 18, y TypeScript, asegurando rendimiento y tipado seguro de extremo a extremo.
*   **Backend as a Service Nivel Enterprise:** Supabase integrado para Autenticación, Base de Datos PostgreSQL, y Storage. Esto elimina cuellos de botella de infraestructura y nos da "Realtime" out-of-the-box.
*   **Vercel AI SDK Integration:** No usamos simples llamadas a APIs que fallan por timeouts. Se utiliza streaming avanzado (`@ai-sdk/openai`) y validación esquemática para una experiencia de usuario sin bloqueos.
*   **Exportación Nativa PDF:** Gracias a `@react-pdf/renderer` y `jspdf`, evitamos dependencias a servicios de terceros caros para generar los documentos, haciendo el sistema más barato de operar.

## 5. Robustez del MVP
El proyecto exhibe una madurez técnica inusual para un Hackathon. En `supabase/migrations/` existen **45 archivos de migración**, lo que prueba:
*   Un modelo de datos altamente normalizado (Carreras, Facultades, Áreas de Interés separadas).
*   Seguridad estricta: Implementación de RLS (Row Level Security) masivo para proteger datos personales (ej. la migración `20260617132400_fix_all_rls_tipo_to_rol.sql`).
*   Auditoría Profesional: Cuenta con tablas y triggers específicos para logs de auditoría (`13_audit_logs_table.sql` y `14_audit_triggers.sql`) y borrado lógico en cascada para no perder datos históricos (`15_soft_deletes_profiles_positions.sql`).

Esto certifica que el producto tiene una arquitectura backend que soporta operaciones reales de inmediato.
