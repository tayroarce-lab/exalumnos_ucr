DO $$
DECLARE
    v_exalumno_id UUID;
    v_estudiante_id UUID;
    v_taller1_id UUID := gen_random_uuid();
    v_taller2_id UUID := gen_random_uuid();
    v_taller3_id UUID := gen_random_uuid();
    v_taller4_id UUID := gen_random_uuid();
    v_taller5_id UUID := gen_random_uuid();
    v_taller6_id UUID := gen_random_uuid();
BEGIN
    -- 1. Intentar obtener el primer usuario disponible (que servirá como Exalumno creador)
    SELECT id INTO v_exalumno_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    -- 2. Obtener un segundo usuario distinto (que servirá como el Estudiante que se postula)
    SELECT id INTO v_estudiante_id FROM auth.users WHERE id != v_exalumno_id ORDER BY created_at DESC LIMIT 1;

    -- Si no hay usuarios en la base de datos, abortar
    IF v_exalumno_id IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios en auth.users para asignar a los talleres. Crea al menos un usuario primero.';
    END IF;

    -- 3. Insertar Talleres
    INSERT INTO public.talleres (id, exalumno_id, titulo, descripcion, fecha_taller, modalidad, estado, ubicacion_url, cupos, multimedia_urls)
    VALUES 
    (v_taller1_id, v_exalumno_id, 'Introducción a React y Next.js', 'Aprende los fundamentos del framework más popular para la web moderna. Construiremos un dashboard en tiempo real usando Supabase, Tailwind CSS y componentes de servidor.', (now() + interval '5 days'), 'ONLINE', 'APROBADO', 'https://meet.google.com/abc-defg-hij', 30, ARRAY['https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop']),
    
    (v_taller2_id, v_exalumno_id, 'Taller de Oratoria y Liderazgo', 'Potencia tus habilidades blandas. Este taller te dará las herramientas prácticas necesarias para comunicarte de forma asertiva en entornos corporativos y entrevistas de trabajo.', (now() + interval '12 days'), 'PRESENCIAL', 'APROBADO', 'Auditorio de Ciencias Económicas, Sede Rodrigo Facio', 15, ARRAY['https://images.unsplash.com/photo-1475721028070-2051152a55ce?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop']),
    
    (v_taller3_id, v_exalumno_id, 'Finanzas Personales para Universitarios', '¿Cómo manejar tus primeros ingresos? Estrategias de ahorro, tarjetas de crédito, fondos de inversión básicos e introducción a la bolsa de valores.', (now() + interval '15 days'), 'HIBRIDO', 'PENDIENTE', 'Aula 104 y Microsoft Teams', 50, ARRAY['https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop']),

    (v_taller4_id, v_exalumno_id, 'Arquitectura de Software Cloud', 'Conceptos avanzados de AWS, Azure y Google Cloud Platform. Exclusivo para estudiantes avanzados de computación e informática. Incluye laboratorio práctico.', (now() + interval '2 days'), 'ONLINE', 'APROBADO', 'https://zoom.us/j/123456789', 100, ARRAY['https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop']),

    (v_taller5_id, v_exalumno_id, 'Design Thinking y UX/UI', 'Taller creativo para entender a los usuarios y diseñar interfaces increíbles. Aprenderemos metodologías ágiles y Figma.', (now() + interval '20 days'), 'PRESENCIAL', 'RECHAZADO', 'Laboratorio de Diseño, Facultad de Artes', 20, ARRAY['https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop']),
    
    (v_taller6_id, v_exalumno_id, 'Preparación para el TOEIC', 'Sesión intensiva de listening and reading. Repaso de vocabulario de negocios y tips de tiempo para el examen estandarizado.', (now() + interval '8 days'), 'ONLINE', 'APROBADO', 'https://meet.google.com/xyz-abcd-efg', 40, ARRAY['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop']);

    -- 4. Insertar Postulaciones de prueba
    -- Solo insertamos si pudimos encontrar un segundo usuario para actuar como estudiante
    IF v_estudiante_id IS NOT NULL THEN
        INSERT INTO public.talleres_postulaciones (taller_id, estudiante_id, estado, mensaje)
        VALUES 
        (v_taller1_id, v_estudiante_id, 'ACEPTADO', '¡Me encantaría participar! Llevo tiempo queriendo aprender React y esto me ayudaría muchísimo en mi proyecto de graduación.'),
        
        (v_taller2_id, v_estudiante_id, 'PENDIENTE', 'Siento que me pongo muy nervioso exponiendo en clase. Necesito mejorar mis habilidades de presentación y oratoria. Prometo ser muy participativo y atento.'),
        
        (v_taller4_id, v_estudiante_id, 'RECHAZADO', 'Lamentablemente no cuento con base de programación en nube pero soy muy entusiasta.');
    END IF;

END $$;
