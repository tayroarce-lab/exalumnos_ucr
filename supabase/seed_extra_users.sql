-- Seed script for 20 exalumnos and 20 estudiantes

-- Auth Users for estudiante
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES 
(
            '753fcf3d-95dc-4eb8-be2b-9a01817da6fb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'andres.fernandez621@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Andres","apellidos":"Fernandez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '91f8ea3d-ede3-4e53-b1dd-c603b62857c4', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'elena.fernandez43@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Elena","apellidos":"Fernandez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '473f1708-012c-4cbc-bfbd-3877870efb2f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'pedro.perez443@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Pedro","apellidos":"Perez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '157d6e67-5ecd-4d73-92d5-75ff638c11b9', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'valeria.diaz409@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Valeria","apellidos":"Diaz","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '48f76d4b-ef62-4eab-85ce-04822dc7cc4c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'ana.molina650@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Ana","apellidos":"Molina","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'a890cc8c-419d-42e1-9f83-fb3bafdd8ea1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'camila.ortiz853@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Camila","apellidos":"Ortiz","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'laura.fernandez225@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Laura","apellidos":"Fernandez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '600627b2-e568-48e9-a234-999abcd9338b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'laura.castro788@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Laura","apellidos":"Castro","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'd95dc713-31ac-4dfe-a0e5-5effe80bc9be', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'isabella.castro420@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Isabella","apellidos":"Castro","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '2a36232e-5ff1-45a3-8e2a-4449f224bf67', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'ana.fernandez620@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Ana","apellidos":"Fernandez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'f9dc3c0a-951d-4fff-b42d-0e4bad343186', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'daniel.ruiz50@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Daniel","apellidos":"Ruiz","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'juan.suarez607@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Juan","apellidos":"Suarez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'cc69e718-92bb-4288-953e-3bd48ad538ba', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'diego.perez29@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Diego","apellidos":"Perez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'c9a6f246-ba51-4d4f-8458-2aa66835f11d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'marco.gomez778@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Marco","apellidos":"Gomez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            'ca5d2c83-803b-4bf0-9c08-10fee2b1c612', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'isabella.molina92@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Isabella","apellidos":"Molina","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '6ec717ac-1fd8-4bad-9eea-5c8f254cf365', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'camila.rodriguez93@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Camila","apellidos":"Rodriguez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '65491b2b-6f15-4b2e-8ee6-0eb373fb6e57', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'daniel.rodriguez835@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Daniel","apellidos":"Rodriguez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '55a2bb2a-9216-4ded-8d0c-1ee29dd8183e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'elena.fernandez227@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Elena","apellidos":"Fernandez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'ana.ortiz453@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Ana","apellidos":"Ortiz","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        ),
(
            '421820f5-f1c9-4b02-8955-89d54197365a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'pedro.alvarez733@ucr.ac.cr', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Pedro","apellidos":"Alvarez","rol":"estudiante"}',
            now(), now(), '', '', '', ''
        )
ON CONFLICT DO NOTHING;

-- Auth Identities for estudiante
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES 
(
            '753fcf3d-95dc-4eb8-be2b-9a01817da6fb', '753fcf3d-95dc-4eb8-be2b-9a01817da6fb', '753fcf3d-95dc-4eb8-be2b-9a01817da6fb', format('{"sub":"%s","email":"%s"}','753fcf3d-95dc-4eb8-be2b-9a01817da6fb','andres.fernandez621@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '91f8ea3d-ede3-4e53-b1dd-c603b62857c4', '91f8ea3d-ede3-4e53-b1dd-c603b62857c4', '91f8ea3d-ede3-4e53-b1dd-c603b62857c4', format('{"sub":"%s","email":"%s"}','91f8ea3d-ede3-4e53-b1dd-c603b62857c4','elena.fernandez43@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '473f1708-012c-4cbc-bfbd-3877870efb2f', '473f1708-012c-4cbc-bfbd-3877870efb2f', '473f1708-012c-4cbc-bfbd-3877870efb2f', format('{"sub":"%s","email":"%s"}','473f1708-012c-4cbc-bfbd-3877870efb2f','pedro.perez443@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '157d6e67-5ecd-4d73-92d5-75ff638c11b9', '157d6e67-5ecd-4d73-92d5-75ff638c11b9', '157d6e67-5ecd-4d73-92d5-75ff638c11b9', format('{"sub":"%s","email":"%s"}','157d6e67-5ecd-4d73-92d5-75ff638c11b9','valeria.diaz409@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '48f76d4b-ef62-4eab-85ce-04822dc7cc4c', '48f76d4b-ef62-4eab-85ce-04822dc7cc4c', '48f76d4b-ef62-4eab-85ce-04822dc7cc4c', format('{"sub":"%s","email":"%s"}','48f76d4b-ef62-4eab-85ce-04822dc7cc4c','ana.molina650@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'a890cc8c-419d-42e1-9f83-fb3bafdd8ea1', 'a890cc8c-419d-42e1-9f83-fb3bafdd8ea1', 'a890cc8c-419d-42e1-9f83-fb3bafdd8ea1', format('{"sub":"%s","email":"%s"}','a890cc8c-419d-42e1-9f83-fb3bafdd8ea1','camila.ortiz853@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd', 'ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd', 'ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd', format('{"sub":"%s","email":"%s"}','ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd','laura.fernandez225@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '600627b2-e568-48e9-a234-999abcd9338b', '600627b2-e568-48e9-a234-999abcd9338b', '600627b2-e568-48e9-a234-999abcd9338b', format('{"sub":"%s","email":"%s"}','600627b2-e568-48e9-a234-999abcd9338b','laura.castro788@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'd95dc713-31ac-4dfe-a0e5-5effe80bc9be', 'd95dc713-31ac-4dfe-a0e5-5effe80bc9be', 'd95dc713-31ac-4dfe-a0e5-5effe80bc9be', format('{"sub":"%s","email":"%s"}','d95dc713-31ac-4dfe-a0e5-5effe80bc9be','isabella.castro420@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '2a36232e-5ff1-45a3-8e2a-4449f224bf67', '2a36232e-5ff1-45a3-8e2a-4449f224bf67', '2a36232e-5ff1-45a3-8e2a-4449f224bf67', format('{"sub":"%s","email":"%s"}','2a36232e-5ff1-45a3-8e2a-4449f224bf67','ana.fernandez620@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'f9dc3c0a-951d-4fff-b42d-0e4bad343186', 'f9dc3c0a-951d-4fff-b42d-0e4bad343186', 'f9dc3c0a-951d-4fff-b42d-0e4bad343186', format('{"sub":"%s","email":"%s"}','f9dc3c0a-951d-4fff-b42d-0e4bad343186','daniel.ruiz50@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b', 'e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b', 'e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b', format('{"sub":"%s","email":"%s"}','e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b','juan.suarez607@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'cc69e718-92bb-4288-953e-3bd48ad538ba', 'cc69e718-92bb-4288-953e-3bd48ad538ba', 'cc69e718-92bb-4288-953e-3bd48ad538ba', format('{"sub":"%s","email":"%s"}','cc69e718-92bb-4288-953e-3bd48ad538ba','diego.perez29@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'c9a6f246-ba51-4d4f-8458-2aa66835f11d', 'c9a6f246-ba51-4d4f-8458-2aa66835f11d', 'c9a6f246-ba51-4d4f-8458-2aa66835f11d', format('{"sub":"%s","email":"%s"}','c9a6f246-ba51-4d4f-8458-2aa66835f11d','marco.gomez778@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            'ca5d2c83-803b-4bf0-9c08-10fee2b1c612', 'ca5d2c83-803b-4bf0-9c08-10fee2b1c612', 'ca5d2c83-803b-4bf0-9c08-10fee2b1c612', format('{"sub":"%s","email":"%s"}','ca5d2c83-803b-4bf0-9c08-10fee2b1c612','isabella.molina92@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '6ec717ac-1fd8-4bad-9eea-5c8f254cf365', '6ec717ac-1fd8-4bad-9eea-5c8f254cf365', '6ec717ac-1fd8-4bad-9eea-5c8f254cf365', format('{"sub":"%s","email":"%s"}','6ec717ac-1fd8-4bad-9eea-5c8f254cf365','camila.rodriguez93@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '65491b2b-6f15-4b2e-8ee6-0eb373fb6e57', '65491b2b-6f15-4b2e-8ee6-0eb373fb6e57', '65491b2b-6f15-4b2e-8ee6-0eb373fb6e57', format('{"sub":"%s","email":"%s"}','65491b2b-6f15-4b2e-8ee6-0eb373fb6e57','daniel.rodriguez835@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '55a2bb2a-9216-4ded-8d0c-1ee29dd8183e', '55a2bb2a-9216-4ded-8d0c-1ee29dd8183e', '55a2bb2a-9216-4ded-8d0c-1ee29dd8183e', format('{"sub":"%s","email":"%s"}','55a2bb2a-9216-4ded-8d0c-1ee29dd8183e','elena.fernandez227@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677', '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677', '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677', format('{"sub":"%s","email":"%s"}','1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677','ana.ortiz453@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        ),
(
            '421820f5-f1c9-4b02-8955-89d54197365a', '421820f5-f1c9-4b02-8955-89d54197365a', '421820f5-f1c9-4b02-8955-89d54197365a', format('{"sub":"%s","email":"%s"}','421820f5-f1c9-4b02-8955-89d54197365a','pedro.alvarez733@ucr.ac.cr')::jsonb, 'email', now(), now(), now()
        )
ON CONFLICT DO NOTHING;

-- Public Users for estudiante
INSERT INTO public.users (id, email, nombre, apellidos, rol, email_verified, activo, foto_url, busca_mentoria, busca_empleo, busca_pasantia, ofrece_mentoria, visible_en_directorio, reportes_recibidos, created_at) VALUES 
(
            '753fcf3d-95dc-4eb8-be2b-9a01817da6fb', 'andres.fernandez621@ucr.ac.cr', 'Andres', 'Fernandez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '91f8ea3d-ede3-4e53-b1dd-c603b62857c4', 'elena.fernandez43@ucr.ac.cr', 'Elena', 'Fernandez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '473f1708-012c-4cbc-bfbd-3877870efb2f', 'pedro.perez443@ucr.ac.cr', 'Pedro', 'Perez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '157d6e67-5ecd-4d73-92d5-75ff638c11b9', 'valeria.diaz409@ucr.ac.cr', 'Valeria', 'Diaz', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '48f76d4b-ef62-4eab-85ce-04822dc7cc4c', 'ana.molina650@ucr.ac.cr', 'Ana', 'Molina', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'a890cc8c-419d-42e1-9f83-fb3bafdd8ea1', 'camila.ortiz853@ucr.ac.cr', 'Camila', 'Ortiz', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd', 'laura.fernandez225@ucr.ac.cr', 'Laura', 'Fernandez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '600627b2-e568-48e9-a234-999abcd9338b', 'laura.castro788@ucr.ac.cr', 'Laura', 'Castro', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'd95dc713-31ac-4dfe-a0e5-5effe80bc9be', 'isabella.castro420@ucr.ac.cr', 'Isabella', 'Castro', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '2a36232e-5ff1-45a3-8e2a-4449f224bf67', 'ana.fernandez620@ucr.ac.cr', 'Ana', 'Fernandez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'f9dc3c0a-951d-4fff-b42d-0e4bad343186', 'daniel.ruiz50@ucr.ac.cr', 'Daniel', 'Ruiz', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b', 'juan.suarez607@ucr.ac.cr', 'Juan', 'Suarez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'cc69e718-92bb-4288-953e-3bd48ad538ba', 'diego.perez29@ucr.ac.cr', 'Diego', 'Perez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'c9a6f246-ba51-4d4f-8458-2aa66835f11d', 'marco.gomez778@ucr.ac.cr', 'Marco', 'Gomez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            'ca5d2c83-803b-4bf0-9c08-10fee2b1c612', 'isabella.molina92@ucr.ac.cr', 'Isabella', 'Molina', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '6ec717ac-1fd8-4bad-9eea-5c8f254cf365', 'camila.rodriguez93@ucr.ac.cr', 'Camila', 'Rodriguez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '65491b2b-6f15-4b2e-8ee6-0eb373fb6e57', 'daniel.rodriguez835@ucr.ac.cr', 'Daniel', 'Rodriguez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '55a2bb2a-9216-4ded-8d0c-1ee29dd8183e', 'elena.fernandez227@ucr.ac.cr', 'Elena', 'Fernandez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677', 'ana.ortiz453@ucr.ac.cr', 'Ana', 'Ortiz', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        ),
(
            '421820f5-f1c9-4b02-8955-89d54197365a', 'pedro.alvarez733@ucr.ac.cr', 'Pedro', 'Alvarez', 'estudiante', TRUE, TRUE, NULL,
            TRUE, TRUE, FALSE, FALSE, TRUE, 0, now()
        )
ON CONFLICT DO NOTHING;

-- Estudiantes profiles
INSERT INTO public.estudiantes (id, user_id, carnet_ucr, carrera, escuela_facultad, sede, anio_ingreso, nivel_academico, proyecto_titulo, proyecto_descripcion, proyecto_area_tematica, proyecto_tipo, areas_de_interes, habilidades, visible_en_directorio, perfil_completo) VALUES 
(
                '753fcf3d-95dc-4eb8-be2b-9a01817da6fb', '753fcf3d-95dc-4eb8-be2b-9a01817da6fb', 'B95488', 'Medicina y Cirugía', 'Facultad Generica', 'Rodrigo Facio',
                2022, 'bachillerato', 'Proyecto TFG Andres', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Emprendimiento y Negocios'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '91f8ea3d-ede3-4e53-b1dd-c603b62857c4', '91f8ea3d-ede3-4e53-b1dd-c603b62857c4', 'B85913', 'Arquitectura', 'Facultad Generica', 'Occidente',
                2022, 'bachillerato', 'Proyecto TFG Elena', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Medio Ambiente y Sostenibilidad'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '473f1708-012c-4cbc-bfbd-3877870efb2f', '473f1708-012c-4cbc-bfbd-3877870efb2f', 'B66953', 'Dirección de Empresas', 'Facultad Generica', 'Occidente',
                2021, 'bachillerato', 'Proyecto TFG Pedro', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Educación y Pedagogía'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '157d6e67-5ecd-4d73-92d5-75ff638c11b9', '157d6e67-5ecd-4d73-92d5-75ff638c11b9', 'B57794', 'Ciencias de la Computación e Informática', 'Facultad Generica', 'Rodrigo Facio',
                2023, 'bachillerato', 'Proyecto TFG Valeria', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Salud y Bienestar'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '48f76d4b-ef62-4eab-85ce-04822dc7cc4c', '48f76d4b-ef62-4eab-85ce-04822dc7cc4c', 'B59782', 'Ciencias de la Computación e Informática', 'Facultad Generica', 'Atlántico',
                2020, 'bachillerato', 'Proyecto TFG Ana', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Medio Ambiente y Sostenibilidad'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'a890cc8c-419d-42e1-9f83-fb3bafdd8ea1', 'a890cc8c-419d-42e1-9f83-fb3bafdd8ea1', 'B96561', 'Derecho', 'Facultad Generica', 'Rodrigo Facio',
                2022, 'bachillerato', 'Proyecto TFG Camila', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Salud y Bienestar'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd', 'ecdbecfe-e8f6-44d0-92c1-f90bda96f5fd', 'B85885', 'Derecho', 'Facultad Generica', 'Rodrigo Facio',
                2022, 'bachillerato', 'Proyecto TFG Laura', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Salud y Bienestar'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '600627b2-e568-48e9-a234-999abcd9338b', '600627b2-e568-48e9-a234-999abcd9338b', 'B38808', 'Medicina y Cirugía', 'Facultad Generica', 'Atlántico',
                2020, 'bachillerato', 'Proyecto TFG Laura', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Educación y Pedagogía'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'd95dc713-31ac-4dfe-a0e5-5effe80bc9be', 'd95dc713-31ac-4dfe-a0e5-5effe80bc9be', 'B75615', 'Arquitectura', 'Facultad Generica', 'Rodrigo Facio',
                2020, 'bachillerato', 'Proyecto TFG Isabella', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Tecnología e Innovación'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '2a36232e-5ff1-45a3-8e2a-4449f224bf67', '2a36232e-5ff1-45a3-8e2a-4449f224bf67', 'B63386', 'Ingeniería Eléctrica', 'Facultad Generica', 'Atlántico',
                2022, 'bachillerato', 'Proyecto TFG Ana', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Educación y Pedagogía'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'f9dc3c0a-951d-4fff-b42d-0e4bad343186', 'f9dc3c0a-951d-4fff-b42d-0e4bad343186', 'B46810', 'Psicología', 'Facultad Generica', 'Rodrigo Facio',
                2023, 'bachillerato', 'Proyecto TFG Daniel', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Educación y Pedagogía'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b', 'e3a8aa23-6e7e-49e6-bcef-90d23ab4a15b', 'B82857', 'Arquitectura', 'Facultad Generica', 'Occidente',
                2020, 'bachillerato', 'Proyecto TFG Juan', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Educación y Pedagogía'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'cc69e718-92bb-4288-953e-3bd48ad538ba', 'cc69e718-92bb-4288-953e-3bd48ad538ba', 'B24807', 'Arquitectura', 'Facultad Generica', 'Rodrigo Facio',
                2020, 'bachillerato', 'Proyecto TFG Diego', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Emprendimiento y Negocios'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'c9a6f246-ba51-4d4f-8458-2aa66835f11d', 'c9a6f246-ba51-4d4f-8458-2aa66835f11d', 'B20328', 'Dirección de Empresas', 'Facultad Generica', 'Rodrigo Facio',
                2023, 'bachillerato', 'Proyecto TFG Marco', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Emprendimiento y Negocios'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                'ca5d2c83-803b-4bf0-9c08-10fee2b1c612', 'ca5d2c83-803b-4bf0-9c08-10fee2b1c612', 'B21544', 'Ingeniería Eléctrica', 'Facultad Generica', 'Occidente',
                2023, 'bachillerato', 'Proyecto TFG Isabella', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Medio Ambiente y Sostenibilidad'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '6ec717ac-1fd8-4bad-9eea-5c8f254cf365', '6ec717ac-1fd8-4bad-9eea-5c8f254cf365', 'B10572', 'Ingeniería Eléctrica', 'Facultad Generica', 'Atlántico',
                2023, 'bachillerato', 'Proyecto TFG Camila', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Salud y Bienestar'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '65491b2b-6f15-4b2e-8ee6-0eb373fb6e57', '65491b2b-6f15-4b2e-8ee6-0eb373fb6e57', 'B40840', 'Arquitectura', 'Facultad Generica', 'Rodrigo Facio',
                2021, 'bachillerato', 'Proyecto TFG Daniel', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Educación y Pedagogía'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '55a2bb2a-9216-4ded-8d0c-1ee29dd8183e', '55a2bb2a-9216-4ded-8d0c-1ee29dd8183e', 'B15414', 'Dirección de Empresas', 'Facultad Generica', 'Occidente',
                2020, 'bachillerato', 'Proyecto TFG Elena', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Educación y Pedagogía'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677', '1d6f9ba5-7bdb-4c24-ad15-f70fbe1b8677', 'B56605', 'Dirección de Empresas', 'Facultad Generica', 'Occidente',
                2022, 'bachillerato', 'Proyecto TFG Ana', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Medio Ambiente y Sostenibilidad'], ARRAY['Liderazgo'], TRUE, TRUE
            ),
(
                '421820f5-f1c9-4b02-8955-89d54197365a', '421820f5-f1c9-4b02-8955-89d54197365a', 'B69050', 'Medicina y Cirugía', 'Facultad Generica', 'Atlántico',
                2020, 'bachillerato', 'Proyecto TFG Pedro', 'Descripcion de proyecto', 'Tecnologia', 'tfg',
                ARRAY['Medio Ambiente y Sostenibilidad'], ARRAY['Liderazgo'], TRUE, TRUE
            )
ON CONFLICT DO NOTHING;

-- Auth Users for exalumno
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES 
(
            '2d93ae88-a0aa-4ec0-8c54-6509f89472b9', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'juan.garcia361@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Juan","apellidos":"Garcia","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'cbd7411c-ac70-484b-b148-2836cd04f55e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'juan.martinez99@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Juan","apellidos":"Martinez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '68281038-1be4-4f65-bb99-fa61731a5484', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'elena.molina540@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Elena","apellidos":"Molina","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '89a64e41-9e09-433d-b52b-4790cfbc7244', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'gabriel.perez91@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Gabriel","apellidos":"Perez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'd2a850bc-0b75-4d6e-b90c-85b299bd8826', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'jose.martinez978@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Jose","apellidos":"Martinez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '47282ce0-45a6-439d-8b8d-f350f71eb067', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'jose.castro171@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Jose","apellidos":"Castro","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '1e65d386-c9b8-4c94-b065-0e9c1c1acbad', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'gabriel.diaz10@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Gabriel","apellidos":"Diaz","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'a4580bbf-804c-4da2-8129-6ae2b15d4fad', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'luis.fernandez515@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Luis","apellidos":"Fernandez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '9414f0a7-873e-4532-8514-d4235935d71f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'luis.perez541@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Luis","apellidos":"Perez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'bf5496e4-e9c2-4dbd-8e28-6aecdef40be5', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'camila.romero578@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Camila","apellidos":"Romero","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'jose.romero198@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Jose","apellidos":"Romero","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '3e762f6c-d0e8-4193-ad3d-88e6a9628963', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'elena.molina558@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Elena","apellidos":"Molina","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'camila.garcia526@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Camila","apellidos":"Garcia","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'ceb4c272-e5fe-4b18-80a5-52fb64ad0381', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'juan.suarez896@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Juan","apellidos":"Suarez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '12fd3a5f-dba6-419d-b460-6931acd70d82', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'valeria.diaz391@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Valeria","apellidos":"Diaz","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'e3099286-f08e-4502-9644-33f78e6f01c3', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'pedro.nunez936@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Pedro","apellidos":"Nunez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'd6bd70a3-c5ed-4aec-9ce1-779f8c64694e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'diego.castro824@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Diego","apellidos":"Castro","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '928826a8-98cd-4277-b498-8f081048008f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'ana.diaz338@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Ana","apellidos":"Diaz","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            'ef6d6cc0-c992-4f26-a523-053c3dbea47c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'daniel.sosa157@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Daniel","apellidos":"Sosa","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        ),
(
            '0e0a84b7-8951-43a1-b354-4d868a216afb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'daniel.sanchez990@gmail.com', crypt('UCRAlumni2026!', gen_salt('bf')), now(), now(),
            '{"provider":"email","providers":["email"]}', '{"nombre":"Daniel","apellidos":"Sanchez","rol":"exalumno"}',
            now(), now(), '', '', '', ''
        )
ON CONFLICT DO NOTHING;

-- Auth Identities for exalumno
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES 
(
            '2d93ae88-a0aa-4ec0-8c54-6509f89472b9', '2d93ae88-a0aa-4ec0-8c54-6509f89472b9', '2d93ae88-a0aa-4ec0-8c54-6509f89472b9', format('{"sub":"%s","email":"%s"}','2d93ae88-a0aa-4ec0-8c54-6509f89472b9','juan.garcia361@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'cbd7411c-ac70-484b-b148-2836cd04f55e', 'cbd7411c-ac70-484b-b148-2836cd04f55e', 'cbd7411c-ac70-484b-b148-2836cd04f55e', format('{"sub":"%s","email":"%s"}','cbd7411c-ac70-484b-b148-2836cd04f55e','juan.martinez99@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '68281038-1be4-4f65-bb99-fa61731a5484', '68281038-1be4-4f65-bb99-fa61731a5484', '68281038-1be4-4f65-bb99-fa61731a5484', format('{"sub":"%s","email":"%s"}','68281038-1be4-4f65-bb99-fa61731a5484','elena.molina540@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '89a64e41-9e09-433d-b52b-4790cfbc7244', '89a64e41-9e09-433d-b52b-4790cfbc7244', '89a64e41-9e09-433d-b52b-4790cfbc7244', format('{"sub":"%s","email":"%s"}','89a64e41-9e09-433d-b52b-4790cfbc7244','gabriel.perez91@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'd2a850bc-0b75-4d6e-b90c-85b299bd8826', 'd2a850bc-0b75-4d6e-b90c-85b299bd8826', 'd2a850bc-0b75-4d6e-b90c-85b299bd8826', format('{"sub":"%s","email":"%s"}','d2a850bc-0b75-4d6e-b90c-85b299bd8826','jose.martinez978@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '47282ce0-45a6-439d-8b8d-f350f71eb067', '47282ce0-45a6-439d-8b8d-f350f71eb067', '47282ce0-45a6-439d-8b8d-f350f71eb067', format('{"sub":"%s","email":"%s"}','47282ce0-45a6-439d-8b8d-f350f71eb067','jose.castro171@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '1e65d386-c9b8-4c94-b065-0e9c1c1acbad', '1e65d386-c9b8-4c94-b065-0e9c1c1acbad', '1e65d386-c9b8-4c94-b065-0e9c1c1acbad', format('{"sub":"%s","email":"%s"}','1e65d386-c9b8-4c94-b065-0e9c1c1acbad','gabriel.diaz10@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'a4580bbf-804c-4da2-8129-6ae2b15d4fad', 'a4580bbf-804c-4da2-8129-6ae2b15d4fad', 'a4580bbf-804c-4da2-8129-6ae2b15d4fad', format('{"sub":"%s","email":"%s"}','a4580bbf-804c-4da2-8129-6ae2b15d4fad','luis.fernandez515@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '9414f0a7-873e-4532-8514-d4235935d71f', '9414f0a7-873e-4532-8514-d4235935d71f', '9414f0a7-873e-4532-8514-d4235935d71f', format('{"sub":"%s","email":"%s"}','9414f0a7-873e-4532-8514-d4235935d71f','luis.perez541@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'bf5496e4-e9c2-4dbd-8e28-6aecdef40be5', 'bf5496e4-e9c2-4dbd-8e28-6aecdef40be5', 'bf5496e4-e9c2-4dbd-8e28-6aecdef40be5', format('{"sub":"%s","email":"%s"}','bf5496e4-e9c2-4dbd-8e28-6aecdef40be5','camila.romero578@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1', '3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1', '3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1', format('{"sub":"%s","email":"%s"}','3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1','jose.romero198@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '3e762f6c-d0e8-4193-ad3d-88e6a9628963', '3e762f6c-d0e8-4193-ad3d-88e6a9628963', '3e762f6c-d0e8-4193-ad3d-88e6a9628963', format('{"sub":"%s","email":"%s"}','3e762f6c-d0e8-4193-ad3d-88e6a9628963','elena.molina558@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb', '2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb', '2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb', format('{"sub":"%s","email":"%s"}','2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb','camila.garcia526@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'ceb4c272-e5fe-4b18-80a5-52fb64ad0381', 'ceb4c272-e5fe-4b18-80a5-52fb64ad0381', 'ceb4c272-e5fe-4b18-80a5-52fb64ad0381', format('{"sub":"%s","email":"%s"}','ceb4c272-e5fe-4b18-80a5-52fb64ad0381','juan.suarez896@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '12fd3a5f-dba6-419d-b460-6931acd70d82', '12fd3a5f-dba6-419d-b460-6931acd70d82', '12fd3a5f-dba6-419d-b460-6931acd70d82', format('{"sub":"%s","email":"%s"}','12fd3a5f-dba6-419d-b460-6931acd70d82','valeria.diaz391@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'e3099286-f08e-4502-9644-33f78e6f01c3', 'e3099286-f08e-4502-9644-33f78e6f01c3', 'e3099286-f08e-4502-9644-33f78e6f01c3', format('{"sub":"%s","email":"%s"}','e3099286-f08e-4502-9644-33f78e6f01c3','pedro.nunez936@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'd6bd70a3-c5ed-4aec-9ce1-779f8c64694e', 'd6bd70a3-c5ed-4aec-9ce1-779f8c64694e', 'd6bd70a3-c5ed-4aec-9ce1-779f8c64694e', format('{"sub":"%s","email":"%s"}','d6bd70a3-c5ed-4aec-9ce1-779f8c64694e','diego.castro824@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '928826a8-98cd-4277-b498-8f081048008f', '928826a8-98cd-4277-b498-8f081048008f', '928826a8-98cd-4277-b498-8f081048008f', format('{"sub":"%s","email":"%s"}','928826a8-98cd-4277-b498-8f081048008f','ana.diaz338@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            'ef6d6cc0-c992-4f26-a523-053c3dbea47c', 'ef6d6cc0-c992-4f26-a523-053c3dbea47c', 'ef6d6cc0-c992-4f26-a523-053c3dbea47c', format('{"sub":"%s","email":"%s"}','ef6d6cc0-c992-4f26-a523-053c3dbea47c','daniel.sosa157@gmail.com')::jsonb, 'email', now(), now(), now()
        ),
(
            '0e0a84b7-8951-43a1-b354-4d868a216afb', '0e0a84b7-8951-43a1-b354-4d868a216afb', '0e0a84b7-8951-43a1-b354-4d868a216afb', format('{"sub":"%s","email":"%s"}','0e0a84b7-8951-43a1-b354-4d868a216afb','daniel.sanchez990@gmail.com')::jsonb, 'email', now(), now(), now()
        )
ON CONFLICT DO NOTHING;

-- Public Users for exalumno
INSERT INTO public.users (id, email, nombre, apellidos, rol, email_verified, activo, foto_url, busca_mentoria, busca_empleo, busca_pasantia, ofrece_mentoria, visible_en_directorio, reportes_recibidos, created_at) VALUES 
(
            '2d93ae88-a0aa-4ec0-8c54-6509f89472b9', 'juan.garcia361@gmail.com', 'Juan', 'Garcia', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'cbd7411c-ac70-484b-b148-2836cd04f55e', 'juan.martinez99@gmail.com', 'Juan', 'Martinez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '68281038-1be4-4f65-bb99-fa61731a5484', 'elena.molina540@gmail.com', 'Elena', 'Molina', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '89a64e41-9e09-433d-b52b-4790cfbc7244', 'gabriel.perez91@gmail.com', 'Gabriel', 'Perez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'd2a850bc-0b75-4d6e-b90c-85b299bd8826', 'jose.martinez978@gmail.com', 'Jose', 'Martinez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '47282ce0-45a6-439d-8b8d-f350f71eb067', 'jose.castro171@gmail.com', 'Jose', 'Castro', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '1e65d386-c9b8-4c94-b065-0e9c1c1acbad', 'gabriel.diaz10@gmail.com', 'Gabriel', 'Diaz', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'a4580bbf-804c-4da2-8129-6ae2b15d4fad', 'luis.fernandez515@gmail.com', 'Luis', 'Fernandez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '9414f0a7-873e-4532-8514-d4235935d71f', 'luis.perez541@gmail.com', 'Luis', 'Perez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'bf5496e4-e9c2-4dbd-8e28-6aecdef40be5', 'camila.romero578@gmail.com', 'Camila', 'Romero', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1', 'jose.romero198@gmail.com', 'Jose', 'Romero', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '3e762f6c-d0e8-4193-ad3d-88e6a9628963', 'elena.molina558@gmail.com', 'Elena', 'Molina', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb', 'camila.garcia526@gmail.com', 'Camila', 'Garcia', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'ceb4c272-e5fe-4b18-80a5-52fb64ad0381', 'juan.suarez896@gmail.com', 'Juan', 'Suarez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '12fd3a5f-dba6-419d-b460-6931acd70d82', 'valeria.diaz391@gmail.com', 'Valeria', 'Diaz', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'e3099286-f08e-4502-9644-33f78e6f01c3', 'pedro.nunez936@gmail.com', 'Pedro', 'Nunez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'd6bd70a3-c5ed-4aec-9ce1-779f8c64694e', 'diego.castro824@gmail.com', 'Diego', 'Castro', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '928826a8-98cd-4277-b498-8f081048008f', 'ana.diaz338@gmail.com', 'Ana', 'Diaz', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            'ef6d6cc0-c992-4f26-a523-053c3dbea47c', 'daniel.sosa157@gmail.com', 'Daniel', 'Sosa', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        ),
(
            '0e0a84b7-8951-43a1-b354-4d868a216afb', 'daniel.sanchez990@gmail.com', 'Daniel', 'Sanchez', 'exalumno', TRUE, TRUE, NULL,
            FALSE, FALSE, FALSE, TRUE, TRUE, 0, now()
        )
ON CONFLICT DO NOTHING;

-- Exalumnos profiles
INSERT INTO public.exalumnos (id, user_id, carrera_ucr, escuela_facultad, anio_graduacion, empresa_actual, cargo_actual, sector_industria, areas_de_interes, pais_ciudad, anios_experiencia, linkedin_url, ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_proyecto, visible_en_directorio, perfil_completo) VALUES 
(
                '2d93ae88-a0aa-4ec0-8c54-6509f89472b9', '2d93ae88-a0aa-4ec0-8c54-6509f89472b9', 'Derecho', 'Facultad Generica', 2014,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Educación y Pedagogía'], 'Costa Rica', 6,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'cbd7411c-ac70-484b-b148-2836cd04f55e', 'cbd7411c-ac70-484b-b148-2836cd04f55e', 'Derecho', 'Facultad Generica', 2016,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Medio Ambiente y Sostenibilidad'], 'Costa Rica', 9,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '68281038-1be4-4f65-bb99-fa61731a5484', '68281038-1be4-4f65-bb99-fa61731a5484', 'Medicina y Cirugía', 'Facultad Generica', 2010,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Tecnología e Innovación'], 'Costa Rica', 3,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '89a64e41-9e09-433d-b52b-4790cfbc7244', '89a64e41-9e09-433d-b52b-4790cfbc7244', 'Dirección de Empresas', 'Facultad Generica', 2010,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Salud y Bienestar'], 'Costa Rica', 6,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'd2a850bc-0b75-4d6e-b90c-85b299bd8826', 'd2a850bc-0b75-4d6e-b90c-85b299bd8826', 'Derecho', 'Facultad Generica', 2013,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Emprendimiento y Negocios'], 'Costa Rica', 2,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '47282ce0-45a6-439d-8b8d-f350f71eb067', '47282ce0-45a6-439d-8b8d-f350f71eb067', 'Dirección de Empresas', 'Facultad Generica', 2011,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Tecnología e Innovación'], 'Costa Rica', 8,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '1e65d386-c9b8-4c94-b065-0e9c1c1acbad', '1e65d386-c9b8-4c94-b065-0e9c1c1acbad', 'Dirección de Empresas', 'Facultad Generica', 2014,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Tecnología e Innovación'], 'Costa Rica', 4,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'a4580bbf-804c-4da2-8129-6ae2b15d4fad', 'a4580bbf-804c-4da2-8129-6ae2b15d4fad', 'Medicina y Cirugía', 'Facultad Generica', 2018,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Tecnología e Innovación'], 'Costa Rica', 1,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '9414f0a7-873e-4532-8514-d4235935d71f', '9414f0a7-873e-4532-8514-d4235935d71f', 'Ingeniería Eléctrica', 'Facultad Generica', 2013,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Educación y Pedagogía'], 'Costa Rica', 10,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'bf5496e4-e9c2-4dbd-8e28-6aecdef40be5', 'bf5496e4-e9c2-4dbd-8e28-6aecdef40be5', 'Derecho', 'Facultad Generica', 2010,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Medio Ambiente y Sostenibilidad'], 'Costa Rica', 1,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1', '3a5bc78d-a3f1-4d4f-9c71-3a5095dd63c1', 'Ciencias de la Computación e Informática', 'Facultad Generica', 2019,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Educación y Pedagogía'], 'Costa Rica', 3,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '3e762f6c-d0e8-4193-ad3d-88e6a9628963', '3e762f6c-d0e8-4193-ad3d-88e6a9628963', 'Dirección de Empresas', 'Facultad Generica', 2018,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Tecnología e Innovación'], 'Costa Rica', 2,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb', '2a5fd66d-88ca-4bb5-b82e-92858ec8aeeb', 'Psicología', 'Facultad Generica', 2019,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Salud y Bienestar'], 'Costa Rica', 5,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'ceb4c272-e5fe-4b18-80a5-52fb64ad0381', 'ceb4c272-e5fe-4b18-80a5-52fb64ad0381', 'Ingeniería Eléctrica', 'Facultad Generica', 2010,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Educación y Pedagogía'], 'Costa Rica', 7,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '12fd3a5f-dba6-419d-b460-6931acd70d82', '12fd3a5f-dba6-419d-b460-6931acd70d82', 'Derecho', 'Facultad Generica', 2015,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Medio Ambiente y Sostenibilidad'], 'Costa Rica', 2,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'e3099286-f08e-4502-9644-33f78e6f01c3', 'e3099286-f08e-4502-9644-33f78e6f01c3', 'Ciencias de la Computación e Informática', 'Facultad Generica', 2014,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Medio Ambiente y Sostenibilidad'], 'Costa Rica', 7,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'd6bd70a3-c5ed-4aec-9ce1-779f8c64694e', 'd6bd70a3-c5ed-4aec-9ce1-779f8c64694e', 'Arquitectura', 'Facultad Generica', 2016,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Emprendimiento y Negocios'], 'Costa Rica', 9,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '928826a8-98cd-4277-b498-8f081048008f', '928826a8-98cd-4277-b498-8f081048008f', 'Psicología', 'Facultad Generica', 2014,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Medio Ambiente y Sostenibilidad'], 'Costa Rica', 2,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                'ef6d6cc0-c992-4f26-a523-053c3dbea47c', 'ef6d6cc0-c992-4f26-a523-053c3dbea47c', 'Psicología', 'Facultad Generica', 2010,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Educación y Pedagogía'], 'Costa Rica', 4,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            ),
(
                '0e0a84b7-8951-43a1-b354-4d868a216afb', '0e0a84b7-8951-43a1-b354-4d868a216afb', 'Psicología', 'Facultad Generica', 2012,
                'Empresa Mock', 'Senior Mock', ARRAY['Tecnologia'], ARRAY['Medio Ambiente y Sostenibilidad'], 'Costa Rica', 10,
                'https://linkedin.com/in/mock', TRUE, FALSE, FALSE, FALSE, TRUE, TRUE
            )
ON CONFLICT DO NOTHING;

