-- =============================================================================
-- MIGRACIÓN 17: RF-04 Directorio de Exalumnos
-- Descripción : Agrega la extensión unaccent para búsquedas sin acentos.
--               Crea índices funcionales para optimizar búsquedas ILIKE.
--               Crea la función RPC buscar_directorio_exalumnos con soporte
--               para filtros estrictos (AND) y paginación.
-- =============================================================================

BEGIN;

-- 1. Habilitar extensión unaccent para la búsqueda agnóstica a acentos
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Crear índices funcionales para la tabla profiles
CREATE INDEX IF NOT EXISTS idx_profiles_unaccent_pais_ciudad 
ON public.profiles (unaccent(lower(pais_ciudad)));

CREATE INDEX IF NOT EXISTS idx_profiles_unaccent_nombres 
ON public.profiles (unaccent(lower(COALESCE(nombre, '') || ' ' || COALESCE(apellidos, ''))));

-- 3. Función RPC para buscar en el directorio
CREATE OR REPLACE FUNCTION public.buscar_directorio_exalumnos(
  p_search text DEFAULT NULL,
  p_facultad text DEFAULT NULL,
  p_escuela text DEFAULT NULL,
  p_carreras text[] DEFAULT NULL,
  p_sectores text[] DEFAULT NULL,
  p_areas text[] DEFAULT NULL,
  p_apoyos text[] DEFAULT NULL,
  p_pais_ciudad text DEFAULT NULL,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  nombre text,
  apellidos text,
  foto_url text,
  pais_ciudad text,
  carrera_principal text,
  escuela_principal text,
  facultad_principal text,
  anio_graduacion int,
  empresa_actual text,
  cargo_actual text,
  sector_industria text[],
  areas_de_interes text[],
  ofrece_mentoria boolean,
  ofrece_empleo boolean,
  ofrece_pasantia boolean,
  ofrece_proyecto boolean,
  ofrece_donacion_dinero boolean,
  score_match integer,
  created_at timestamptz,
  total_count bigint
) AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_perfil_completo int;
BEGIN
  -- Validar que haya sesión (SECURITY DEFINER permite ejecutar a anon, pero forzamos auth)
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autorizado. Se requiere sesión activa.';
  END IF;

  -- Verificar si el usuario actual tiene perfil completo
  SELECT perfil_completo INTO v_perfil_completo FROM public.profiles WHERE public.profiles.id = v_uid;

  RETURN QUERY
  WITH filtered_profiles AS (
    SELECT 
      p.id,
      p.nombre,
      p.apellidos,
      p.foto_url,
      p.pais_ciudad,
      p.carrera_principal,
      p.escuela_principal,
      p.facultad_principal,
      p.anio_graduacion,
      p.empresa_actual,
      p.cargo_actual,
      p.sector_industria,
      p.areas_de_interes,
      p.ofrece_mentoria,
      p.ofrece_empleo,
      p.ofrece_pasantia,
      p.ofrece_proyecto,
      p.ofrece_donacion_dinero,
      p.created_at,
      m.score_match
    FROM public.profiles p
    JOIN public.users u ON p.id = u.id
    LEFT JOIN public.matches m ON 
      ((m.estudiante_id = v_uid AND m.exalumno_id = p.id) OR (m.exalumno_id = v_uid AND m.estudiante_id = p.id))
      AND COALESCE(v_perfil_completo, 0) = 100
    WHERE p.es_exalumno = true
      AND u.visible_en_directorio = true
      AND u.deleted_at IS NULL
      AND (
        p_search IS NULL OR LENGTH(TRIM(p_search)) < 2 OR
        unaccent(lower(COALESCE(p.nombre, '') || ' ' || COALESCE(p.apellidos, ''))) ILIKE '%' || unaccent(lower(TRIM(p_search))) || '%' OR
        unaccent(lower(COALESCE(p.cargo_actual, ''))) ILIKE '%' || unaccent(lower(TRIM(p_search))) || '%' OR
        unaccent(lower(COALESCE(p.empresa_actual, ''))) ILIKE '%' || unaccent(lower(TRIM(p_search))) || '%'
      )
      AND (p_facultad IS NULL OR p_facultad = '' OR p.facultad_principal = p_facultad)
      AND (p_escuela IS NULL OR p_escuela = '' OR p.escuela_principal = p_escuela)
      AND (p_carreras IS NULL OR ARRAY_LENGTH(p_carreras, 1) IS NULL OR p.carrera_principal = ANY(p_carreras))
      AND (p_sectores IS NULL OR ARRAY_LENGTH(p_sectores, 1) IS NULL OR p.sector_industria @> p_sectores)
      AND (p_areas IS NULL OR ARRAY_LENGTH(p_areas, 1) IS NULL OR p.areas_de_interes @> p_areas)
      AND (
        p_apoyos IS NULL OR ARRAY_LENGTH(p_apoyos, 1) IS NULL OR
        (
          (NOT 'ofrece_mentoria' = ANY(p_apoyos) OR p.ofrece_mentoria = true) AND
          (NOT 'ofrece_empleo' = ANY(p_apoyos) OR p.ofrece_empleo = true) AND
          (NOT 'ofrece_pasantia' = ANY(p_apoyos) OR p.ofrece_pasantia = true) AND
          (NOT 'ofrece_proyecto' = ANY(p_apoyos) OR p.ofrece_proyecto = true) AND
          (NOT 'ofrece_donacion_dinero' = ANY(p_apoyos) OR p.ofrece_donacion_dinero = true)
        )
      )
      AND (
        p_pais_ciudad IS NULL OR p_pais_ciudad = '' OR
        unaccent(lower(p.pais_ciudad)) ILIKE '%' || unaccent(lower(TRIM(p_pais_ciudad))) || '%'
      )
  ),
  counted AS (
    SELECT COUNT(*) AS total FROM filtered_profiles
  )
  SELECT 
    f.id,
    f.nombre,
    f.apellidos,
    f.foto_url,
    f.pais_ciudad,
    f.carrera_principal,
    f.escuela_principal,
    f.facultad_principal,
    f.anio_graduacion,
    f.empresa_actual,
    f.cargo_actual,
    f.sector_industria,
    f.areas_de_interes,
    f.ofrece_mentoria,
    f.ofrece_empleo,
    f.ofrece_pasantia,
    f.ofrece_proyecto,
    f.ofrece_donacion_dinero,
    COALESCE(f.score_match::integer, 0) as score_match,
    f.created_at,
    (SELECT total FROM counted) as total_count
  FROM filtered_profiles f
  ORDER BY 
    CASE WHEN COALESCE(v_perfil_completo, 0) = 100 THEN f.score_match END DESC NULLS LAST,
    f.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.buscar_directorio_exalumnos(text, text, text, text[], text[], text[], text[], text, int, int) IS
    'Retorna el directorio de exalumnos con filtro AND estricto, búsqueda de texto con unaccent, y ordenamiento dinámico por score_match (si el perfil está completo al 100%) o por fecha.';

COMMIT;
