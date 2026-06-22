export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          alumni_id: string
          compatibility_score: number | null
          created_at: string
          cv_id: string | null
          id: string
          message: string | null
          position_id: string
          reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          alumni_id: string
          compatibility_score?: number | null
          created_at?: string
          cv_id?: string | null
          id?: string
          message?: string | null
          position_id: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          alumni_id?: string
          compatibility_score?: number | null
          created_at?: string
          cv_id?: string | null
          id?: string
          message?: string | null
          position_id?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "applications_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cv_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "posiciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["posicion_id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          accion: string
          fecha_registro: string
          id: string
          registro_id: string
          tabla_afectada: string
          usuario_id: string | null
          valor_nuevo: Json | null
          valor_viejo: Json | null
        }
        Insert: {
          accion: string
          fecha_registro?: string
          id?: string
          registro_id: string
          tabla_afectada: string
          usuario_id?: string | null
          valor_nuevo?: Json | null
          valor_viejo?: Json | null
        }
        Update: {
          accion?: string
          fecha_registro?: string
          id?: string
          registro_id?: string
          tabla_afectada?: string
          usuario_id?: string | null
          valor_nuevo?: Json | null
          valor_viejo?: Json | null
        }
        Relationships: []
      }
      campus: {
        Row: {
          created_at: string | null
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          nombre: string
        }
        Update: {
          created_at?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      carrera_campus: {
        Row: {
          campus_id: number
          carrera_id: number
          id: number
        }
        Insert: {
          campus_id: number
          carrera_id: number
          id?: number
        }
        Update: {
          campus_id?: number
          carrera_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "carrera_campus_v2_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrera_campus_v2_carrera_id_fkey"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "carreras"
            referencedColumns: ["id"]
          },
        ]
      }
      carreras: {
        Row: {
          created_at: string | null
          facultad_id: number | null
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string | null
          facultad_id?: number | null
          id?: number
          nombre: string
        }
        Update: {
          created_at?: string | null
          facultad_id?: number | null
          id?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "carreras_v2_facultad_id_fkey"
            columns: ["facultad_id"]
            isOneToOne: false
            referencedRelation: "facultades"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_areas_interes: {
        Row: {
          categoria: string | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      curriculum_certificaciones: {
        Row: {
          curriculum_id: string
          fecha: string | null
          id: string
          institucion: string
          nombre: string
          orden: number
          url_verificacion: string | null
        }
        Insert: {
          curriculum_id: string
          fecha?: string | null
          id?: string
          institucion: string
          nombre: string
          orden?: number
          url_verificacion?: string | null
        }
        Update: {
          curriculum_id?: string
          fecha?: string | null
          id?: string
          institucion?: string
          nombre?: string
          orden?: number
          url_verificacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_certificaciones_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_versiones: {
        Row: {
          contenido_adaptado: Json
          created_at: string
          curriculum_id: string
          id: string
          nombre_version: string
          posicion_id: string
          sugerencias_ia: Json
        }
        Insert: {
          contenido_adaptado?: Json
          created_at?: string
          curriculum_id: string
          id?: string
          nombre_version: string
          posicion_id: string
          sugerencias_ia?: Json
        }
        Update: {
          contenido_adaptado?: Json
          created_at?: string
          curriculum_id?: string
          id?: string
          nombre_version?: string
          posicion_id?: string
          sugerencias_ia?: Json
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_versiones_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curriculums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_versiones_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "posiciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_versiones_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["posicion_id"]
          },
        ]
      }
      curriculums: {
        Row: {
          created_at: string
          cursos_relevantes: string[]
          habilidades_blandas: string[]
          habilidades_tecnicas: Json
          id: string
          idiomas: Json
          proyecto_graduacion_resumen: string | null
          sobre_mi: string | null
          updated_at: string
          url_linkedin: string | null
          url_portfolio: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cursos_relevantes?: string[]
          habilidades_blandas?: string[]
          habilidades_tecnicas?: Json
          id?: string
          idiomas?: Json
          proyecto_graduacion_resumen?: string | null
          sobre_mi?: string | null
          updated_at?: string
          url_linkedin?: string | null
          url_portfolio?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          cursos_relevantes?: string[]
          habilidades_blandas?: string[]
          habilidades_tecnicas?: Json
          id?: string
          idiomas?: Json
          proyecto_graduacion_resumen?: string | null
          sobre_mi?: string | null
          updated_at?: string
          url_linkedin?: string | null
          url_portfolio?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      cv_academic_info: {
        Row: {
          academic_level: string
          career: string
          entry_year: number
          gpa: number | null
          graduation_project_description: string | null
          graduation_project_title: string | null
          profile_id: string
          relevant_courses: string[] | null
          university: string | null
        }
        Insert: {
          academic_level: string
          career: string
          entry_year: number
          gpa?: number | null
          graduation_project_description?: string | null
          graduation_project_title?: string | null
          profile_id: string
          relevant_courses?: string[] | null
          university?: string | null
        }
        Update: {
          academic_level?: string
          career?: string
          entry_year?: number
          gpa?: number | null
          graduation_project_description?: string | null
          graduation_project_title?: string | null
          profile_id?: string
          relevant_courses?: string[] | null
          university?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_academic_info_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "cv_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_certifications: {
        Row: {
          id: string
          institution: string
          issued_month: number | null
          issued_year: number | null
          name: string
          profile_id: string | null
          verification_url: string | null
        }
        Insert: {
          id?: string
          institution: string
          issued_month?: number | null
          issued_year?: number | null
          name: string
          profile_id?: string | null
          verification_url?: string | null
        }
        Update: {
          id?: string
          institution?: string
          issued_month?: number | null
          issued_year?: number | null
          name?: string
          profile_id?: string | null
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_certifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "cv_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_experiences: {
        Row: {
          bullets: string[] | null
          end_month: number | null
          end_year: number | null
          experience_type: string
          id: string
          organization: string
          profile_id: string | null
          sort_order: number
          start_month: number
          start_year: number
          title: string
        }
        Insert: {
          bullets?: string[] | null
          end_month?: number | null
          end_year?: number | null
          experience_type: string
          id?: string
          organization: string
          profile_id?: string | null
          sort_order?: number
          start_month: number
          start_year: number
          title: string
        }
        Update: {
          bullets?: string[] | null
          end_month?: number | null
          end_year?: number | null
          experience_type?: string
          id?: string
          organization?: string
          profile_id?: string | null
          sort_order?: number
          start_month?: number
          start_year?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "cv_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_profiles: {
        Row: {
          id: string
          is_complete: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_complete?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_complete?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cv_skills: {
        Row: {
          id: string
          level: string | null
          name: string
          profile_id: string | null
          skill_type: string
        }
        Insert: {
          id?: string
          level?: string | null
          name: string
          profile_id?: string | null
          skill_type: string
        }
        Update: {
          id?: string
          level?: string | null
          name?: string
          profile_id?: string | null
          skill_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "cv_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_versiones: {
        Row: {
          contenido: Json
          created_at: string
          id: string
          posicion_id: string | null
          titulo_version: string
          user_id: string
        }
        Insert: {
          contenido: Json
          created_at?: string
          id?: string
          posicion_id?: string | null
          titulo_version: string
          user_id: string
        }
        Update: {
          contenido?: Json
          created_at?: string
          id?: string
          posicion_id?: string | null
          titulo_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_versiones_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "posiciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_versiones_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["posicion_id"]
          },
        ]
      }
      donaciones: {
        Row: {
          comprobante_url: string
          confirmado_por: string | null
          created_at: string
          deleted_at: string | null
          estado: string
          exalumno_id: string
          fecha_transferencia: string
          id: string
          mensaje_estudiante: string | null
          metodo_pago: string
          moneda: string
          monto: number
          motivo_rechazo: string | null
          numero_referencia: string
          proyecto_estudiante_id: string
          updated_at: string
        }
        Insert: {
          comprobante_url: string
          confirmado_por?: string | null
          created_at?: string
          deleted_at?: string | null
          estado?: string
          exalumno_id: string
          fecha_transferencia: string
          id?: string
          mensaje_estudiante?: string | null
          metodo_pago: string
          moneda: string
          monto: number
          motivo_rechazo?: string | null
          numero_referencia: string
          proyecto_estudiante_id: string
          updated_at?: string
        }
        Update: {
          comprobante_url?: string
          confirmado_por?: string | null
          created_at?: string
          deleted_at?: string | null
          estado?: string
          exalumno_id?: string
          fecha_transferencia?: string
          id?: string
          mensaje_estudiante?: string | null
          metodo_pago?: string
          moneda?: string
          monto?: number
          motivo_rechazo?: string | null
          numero_referencia?: string
          proyecto_estudiante_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donaciones_confirmado_por_fkey"
            columns: ["confirmado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donaciones_confirmado_por_fkey"
            columns: ["confirmado_por"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "donaciones_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donaciones_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "donaciones_proyecto_estudiante_id_fkey"
            columns: ["proyecto_estudiante_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donaciones_proyecto_estudiante_id_fkey"
            columns: ["proyecto_estudiante_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      donations: {
        Row: {
          comprobante_url: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_donacion"]
          fecha_transferencia: string
          fondo_destino: string | null
          fondo_general: boolean
          id: string
          mensaje_estudiante: string | null
          metodo_pago: string
          moneda: string
          monto: number
          numero_referencia: string | null
          proyecto_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comprobante_url: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_donacion"]
          fecha_transferencia: string
          fondo_destino?: string | null
          fondo_general?: boolean
          id?: string
          mensaje_estudiante?: string | null
          metodo_pago: string
          moneda: string
          monto: number
          numero_referencia?: string | null
          proyecto_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comprobante_url?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_donacion"]
          fecha_transferencia?: string
          fondo_destino?: string | null
          fondo_general?: boolean
          id?: string
          mensaje_estudiante?: string | null
          metodo_pago?: string
          moneda?: string
          monto?: number
          numero_referencia?: string | null
          proyecto_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "donations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      estudiantes: {
        Row: {
          anio_ingreso: number
          areas_de_interes: string[]
          beca_socioeconomica: string | null
          busca_empleo: boolean
          busca_financiamiento: boolean
          busca_mentoria: boolean
          busca_pasantia: boolean
          carnet_ucr: string
          carrera: string
          escuela_facultad: string
          habilidades: string[] | null
          id: string
          nivel_academico: string
          perfil_completo: boolean
          promedio_ponderado: number | null
          proyecto_activo: boolean
          proyecto_area_tematica: string
          proyecto_descripcion: string
          proyecto_necesidades: string[] | null
            proyecto_valor_monto: number | null
            proyecto_valor_moneda: string | null
            proyecto_video_url: string | null
            proyecto_documento_url: string | null
          proyecto_porcentaje_avance: number | null
          proyecto_tipo: string
          proyecto_titulo: string
          sede: string
          user_id: string
          visible_en_directorio: boolean
        }
        Insert: {
          anio_ingreso: number
          areas_de_interes: string[]
          beca_socioeconomica?: string | null
          busca_empleo?: boolean
          busca_financiamiento?: boolean
          busca_mentoria?: boolean
          busca_pasantia?: boolean
          carnet_ucr: string
          carrera: string
          escuela_facultad: string
          habilidades?: string[] | null
          id?: string
          nivel_academico: string
          perfil_completo?: boolean
          promedio_ponderado?: number | null
          proyecto_activo?: boolean
          proyecto_area_tematica: string
          proyecto_descripcion: string
          proyecto_necesidades?: string[] | null
            proyecto_valor_monto?: number | null
            proyecto_valor_moneda?: string | null
            proyecto_video_url?: string | null
            proyecto_documento_url?: string | null
          proyecto_porcentaje_avance?: number | null
          proyecto_tipo: string
          proyecto_titulo: string
          sede: string
          user_id: string
          visible_en_directorio?: boolean
        }
        Update: {
          anio_ingreso?: number
          areas_de_interes?: string[]
          beca_socioeconomica?: string | null
          busca_empleo?: boolean
          busca_financiamiento?: boolean
          busca_mentoria?: boolean
          busca_pasantia?: boolean
          carnet_ucr?: string
          carrera?: string
          escuela_facultad?: string
          habilidades?: string[] | null
          id?: string
          nivel_academico?: string
          perfil_completo?: boolean
          promedio_ponderado?: number | null
          proyecto_activo?: boolean
          proyecto_area_tematica?: string
          proyecto_descripcion?: string
          proyecto_necesidades?: string[] | null
            proyecto_valor_monto?: number | null
            proyecto_valor_moneda?: string | null
            proyecto_video_url?: string | null
            proyecto_documento_url?: string | null
          proyecto_porcentaje_avance?: number | null
          proyecto_tipo?: string
          proyecto_titulo?: string
          sede?: string
          user_id?: string
          visible_en_directorio?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "estudiantes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudiantes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      estudiantes_carreras: {
        Row: {
          carrera_id: number
          estudiante_id: string
        }
        Insert: {
          carrera_id: number
          estudiante_id: string
        }
        Update: {
          carrera_id?: number
          estudiante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudiantes_carreras_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudiantes_carreras_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      exalumnos: {
        Row: {
          anio_graduacion: number
          anios_experiencia: number
          areas_de_interes: string[]
          bio: string | null
          cargo_actual: string
          carrera_ucr: string
          empresa_actual: string
          escuela_facultad: string
          horas_mes_mentoria: number | null
          id: string
          linkedin_url: string
          moneda_donacion: string | null
          monto_maximo_donacion: number | null
          ofrece_donacion_dinero: boolean
          ofrece_empleo: boolean
          ofrece_mentoria: boolean
          ofrece_pasantia: boolean
          ofrece_proyecto: boolean
          pais_ciudad: string
          perfil_completo: boolean
          sector_industria: string[]
          user_id: string
          visible_en_directorio: boolean
        }
        Insert: {
          anio_graduacion: number
          anios_experiencia: number
          areas_de_interes: string[]
          bio?: string | null
          cargo_actual: string
          carrera_ucr: string
          empresa_actual: string
          escuela_facultad: string
          horas_mes_mentoria?: number | null
          id?: string
          linkedin_url: string
          moneda_donacion?: string | null
          monto_maximo_donacion?: number | null
          ofrece_donacion_dinero?: boolean
          ofrece_empleo?: boolean
          ofrece_mentoria?: boolean
          ofrece_pasantia?: boolean
          ofrece_proyecto?: boolean
          pais_ciudad: string
          perfil_completo?: boolean
          sector_industria: string[]
          user_id: string
          visible_en_directorio?: boolean
        }
        Update: {
          anio_graduacion?: number
          anios_experiencia?: number
          areas_de_interes?: string[]
          bio?: string | null
          cargo_actual?: string
          carrera_ucr?: string
          empresa_actual?: string
          escuela_facultad?: string
          horas_mes_mentoria?: number | null
          id?: string
          linkedin_url?: string
          moneda_donacion?: string | null
          monto_maximo_donacion?: number | null
          ofrece_donacion_dinero?: boolean
          ofrece_empleo?: boolean
          ofrece_mentoria?: boolean
          ofrece_pasantia?: boolean
          ofrece_proyecto?: boolean
          pais_ciudad?: string
          perfil_completo?: boolean
          sector_industria?: string[]
          user_id?: string
          visible_en_directorio?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "exalumnos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exalumnos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      exalumnos_carreras: {
        Row: {
          carrera_id: number
          exalumno_id: string
        }
        Insert: {
          carrera_id: number
          exalumno_id: string
        }
        Update: {
          carrera_id?: number
          exalumno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exalumnos_carreras_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exalumnos_carreras_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      experiencia_laboral: {
        Row: {
          actualmente_aqui: boolean | null
          created_at: string | null
          descripcion: string | null
          empresa: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          puesto: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actualmente_aqui?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          empresa: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          puesto: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actualmente_aqui?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          empresa?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          puesto?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiencia_laboral_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiencia_laboral_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      facultades: {
        Row: {
          created_at: string | null
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          nombre: string
        }
        Update: {
          created_at?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      industry_sectors: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          deleted_at: string | null
          estado: string
          estudiante_id: string
          exalumno_id: string
          id: string
          iniciado_por: string
          notas_admin: string | null
          resultado: string | null
          score_match: number
          tipo_apoyo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          estado?: string
          estudiante_id: string
          exalumno_id: string
          id?: string
          iniciado_por: string
          notas_admin?: string | null
          resultado?: string | null
          score_match: number
          tipo_apoyo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          estado?: string
          estudiante_id?: string
          exalumno_id?: string
          id?: string
          iniciado_por?: string
          notas_admin?: string | null
          resultado?: string | null
          score_match?: number
          tipo_apoyo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "matches_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      password_resets: {
        Row: {
          codigo: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
        }
        Insert: {
          codigo: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
        }
        Update: {
          codigo?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      posiciones: {
        Row: {
          contexto_equipo: string | null
          created_at: string
          deleted_at: string | null
          descripcion_general: string
          empresa: string
          estado: string
          exalumno_id: string
          fecha_limite: string | null
          habilidades_requeridas: string[]
          id: string
          jornada: string | null
          lugar: string | null
          modalidad: string | null
          responsabilidades: string[]
          sector: string[]
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          contexto_equipo?: string | null
          created_at?: string
          deleted_at?: string | null
          descripcion_general: string
          empresa: string
          estado?: string
          exalumno_id: string
          fecha_limite?: string | null
          habilidades_requeridas?: string[]
          id?: string
          jornada?: string | null
          lugar?: string | null
          modalidad?: string | null
          responsabilidades?: string[]
          sector?: string[]
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          contexto_equipo?: string | null
          created_at?: string
          deleted_at?: string | null
          descripcion_general?: string
          empresa?: string
          estado?: string
          exalumno_id?: string
          fecha_limite?: string | null
          habilidades_requeridas?: string[]
          id?: string
          jornada?: string | null
          lugar?: string | null
          modalidad?: string | null
          responsabilidades?: string[]
          sector?: string[]
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posiciones_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posiciones_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic: Json | null
          anio_graduacion: number | null
          anos_experiencia: number | null
          apellidos: string | null
          areas_de_interes: string[] | null
          bio: string | null
          cargo_actual: string | null
          carrera_principal: string | null
          created_at: string | null
          email: string | null
          empresa_actual: string | null
          es_exalumno: boolean | null
          escuela_principal: string | null
          experience: Json | null
          facultad_principal: string | null
          foto_url: string | null
          full_name: string | null
          horas_mes_mentoria: number | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          moneda_donacion: string | null
          monto_maximo_donacion: number | null
          nombre: string | null
          ofrece_donacion_dinero: boolean | null
          ofrece_empleo: boolean | null
          ofrece_mentoria: boolean | null
          ofrece_pasantia: boolean | null
          ofrece_proyecto: boolean | null
          pais_ciudad: string | null
          perfil_completo: number | null
          phone: string | null
          sector_industria: string[] | null
          skills: string[] | null
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          academic?: Json | null
          anio_graduacion?: number | null
          anos_experiencia?: number | null
          apellidos?: string | null
          areas_de_interes?: string[] | null
          bio?: string | null
          cargo_actual?: string | null
          carrera_principal?: string | null
          created_at?: string | null
          email?: string | null
          empresa_actual?: string | null
          es_exalumno?: boolean | null
          escuela_principal?: string | null
          experience?: Json | null
          facultad_principal?: string | null
          foto_url?: string | null
          full_name?: string | null
          horas_mes_mentoria?: number | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          moneda_donacion?: string | null
          monto_maximo_donacion?: number | null
          nombre?: string | null
          ofrece_donacion_dinero?: boolean | null
          ofrece_empleo?: boolean | null
          ofrece_mentoria?: boolean | null
          ofrece_pasantia?: boolean | null
          ofrece_proyecto?: boolean | null
          pais_ciudad?: string | null
          perfil_completo?: number | null
          phone?: string | null
          sector_industria?: string[] | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          academic?: Json | null
          anio_graduacion?: number | null
          anos_experiencia?: number | null
          apellidos?: string | null
          areas_de_interes?: string[] | null
          bio?: string | null
          cargo_actual?: string | null
          carrera_principal?: string | null
          created_at?: string | null
          email?: string | null
          empresa_actual?: string | null
          es_exalumno?: boolean | null
          escuela_principal?: string | null
          experience?: Json | null
          facultad_principal?: string | null
          foto_url?: string | null
          full_name?: string | null
          horas_mes_mentoria?: number | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          moneda_donacion?: string | null
          monto_maximo_donacion?: number | null
          nombre?: string | null
          ofrece_donacion_dinero?: boolean | null
          ofrece_empleo?: boolean | null
          ofrece_mentoria?: boolean | null
          ofrece_pasantia?: boolean | null
          ofrece_proyecto?: boolean | null
          pais_ciudad?: string | null
          perfil_completo?: number | null
          phone?: string | null
          sector_industria?: string[] | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_types: {
        Row: {
          codigo: string
          created_at: string
          id: number
          nombre: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: number
          nombre: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      reportes_perfil: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          motivo: string
          perfil_reportado: string
          reportado_por: string
          resuelto: boolean
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          motivo: string
          perfil_reportado: string
          reportado_por: string
          resuelto?: boolean
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          motivo?: string
          perfil_reportado?: string
          reportado_por?: string
          resuelto?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reportes_perfil_perfil_reportado_fkey"
            columns: ["perfil_reportado"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_perfil_perfil_reportado_fkey"
            columns: ["perfil_reportado"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "reportes_perfil_reportado_por_fkey"
            columns: ["reportado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_perfil_reportado_por_fkey"
            columns: ["reportado_por"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      scholarship_levels: {
        Row: {
          codigo: string
          created_at: string
          id: number
          nombre: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: number
          nombre: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          id: string
          ip: string
          metadata: Json | null
          ocurrido_at: string
          ruta: string | null
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          id?: string
          ip?: string
          metadata?: Json | null
          ocurrido_at?: string
          ruta?: string | null
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          id?: string
          ip?: string
          metadata?: Json | null
          ocurrido_at?: string
          ruta?: string | null
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "user_bans_lifted_by_fkey"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_lifted_by_fkey"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      users: {
        Row: {
          activo: boolean
          apellidos: string | null
          busca_empleo: boolean | null
          busca_mentoria: boolean | null
          busca_pasantia: boolean | null
          carrera_principal_id: number | null
          created_at: string
          deleted_at: string | null
          email: string
          email_verified: boolean
          foto_url: string | null
          hobbies: string[] | null
          id: string
          nombre: string
          ofrece_mentoria: boolean | null
          reportes_recibidos: number
          rol: string
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string | null
          visible_en_directorio: boolean | null
        }
        Insert: {
          activo?: boolean
          apellidos?: string | null
          busca_empleo?: boolean | null
          busca_mentoria?: boolean | null
          busca_pasantia?: boolean | null
          carrera_principal_id?: number | null
          created_at?: string
          deleted_at?: string | null
          email: string
          email_verified?: boolean
          foto_url?: string | null
          hobbies?: string[] | null
          id?: string
          nombre: string
          ofrece_mentoria?: boolean | null
          reportes_recibidos?: number
          rol: string
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          visible_en_directorio?: boolean | null
        }
        Update: {
          activo?: boolean
          apellidos?: string | null
          busca_empleo?: boolean | null
          busca_mentoria?: boolean | null
          busca_pasantia?: boolean | null
          carrera_principal_id?: number | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          email_verified?: boolean
          foto_url?: string | null
          hobbies?: string[] | null
          id?: string
          nombre?: string
          ofrece_mentoria?: boolean | null
          reportes_recibidos?: number
          rol?: string
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          visible_en_directorio?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "users_carrera_principal_id_fkey"
            columns: ["carrera_principal_id"]
            isOneToOne: false
            referencedRelation: "carrera_campus"
            referencedColumns: ["id"]
          },
        ]
      }
      users_areas_interes: {
        Row: {
          area_id: string
          user_id: string
        }
        Insert: {
          area_id: string
          user_id: string
        }
        Update: {
          area_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_areas_interes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "catalogo_areas_interes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_areas_interes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_areas_interes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      users_carreras: {
        Row: {
          anio_graduacion: number | null
          anio_ingreso: number | null
          carrera_campus_id: number
          user_id: string
        }
        Insert: {
          anio_graduacion?: number | null
          anio_ingreso?: number | null
          carrera_campus_id: number
          user_id: string
        }
        Update: {
          anio_graduacion?: number | null
          anio_ingreso?: number | null
          carrera_campus_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_carreras_carrera_campus_id_fkey"
            columns: ["carrera_campus_id"]
            isOneToOne: false
            referencedRelation: "carrera_campus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_carreras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_carreras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_student_position_matches"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
    }
    Views: {
      security_events_resumen: {
        Row: {
          ip: string | null
          tipo: string | null
          total: number | null
          ultimo_evento: string | null
          usuarios_unicos: number | null
        }
        Relationships: []
      }
      view_student_position_matches: {
        Row: {
          created_at: string | null
          descripcion_general: string | null
          empresa: string | null
          estudiante_id: string | null
          lugar: string | null
          modalidad: string | null
          posicion_id: string | null
          score_match: number | null
          sector: string[] | null
          tipo_posicion: string | null
          titulo: string | null
        }
        Relationships: []
      }
      vista_auditoria_detallada: {
        Row: {
          accion: string | null
          email_usuario: string | null
          estado_anterior: string | null
          estado_nuevo: string | null
          fecha_registro: string | null
          log_id: string | null
          nombre_usuario: string | null
          registro_id: string | null
          rol_usuario: string | null
          tabla_afectada: string | null
          usuario_id: string | null
          valor_nuevo: Json | null
          valor_viejo: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_score_matching: {
        Args: { p_estudiante_id: string; p_exalumno_id: string }
        Returns: number
      }
      calcular_score_posicion_extendido: {
        Args: { p_estudiante_id: string; p_posicion_id: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      registrar_evento_seguridad: {
        Args: {
          p_ip?: string
          p_metadata?: Json
          p_ruta?: string
          p_tipo: string
          p_usuario_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      application_status:
        | "enviada"
        | "en_revision"
        | "seleccionado"
        | "descartado"
      estado_donacion: "pendiente" | "confirmada" | "rechazada"
      estado_match: "sugerido" | "contactado" | "activo" | "cerrado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "enviada",
        "en_revision",
        "seleccionado",
        "descartado",
      ],
      estado_donacion: ["pendiente", "confirmada", "rechazada"],
      estado_match: ["sugerido", "contactado", "activo", "cerrado"],
    },
  },
} as const
