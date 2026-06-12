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
      aplicaciones: {
        Row: {
          created_at: string
          curriculum_version_id: string | null
          estado: string
          estudiante_id: string
          id: string
          mensaje_presentacion: string | null
          posicion_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curriculum_version_id?: string | null
          estado?: string
          estudiante_id: string
          id?: string
          mensaje_presentacion?: string | null
          posicion_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curriculum_version_id?: string | null
          estado?: string
          estudiante_id?: string
          id?: string
          mensaje_presentacion?: string | null
          posicion_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aplicaciones_curriculum_version_id_fkey"
            columns: ["curriculum_version_id"]
            isOneToOne: false
            referencedRelation: "curriculum_versiones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicaciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aplicaciones_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "posiciones"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum: {
        Row: {
          created_at: string
          cursos_relevantes: string[]
          estudiante_id: string
          habilidades_blandas: string[]
          habilidades_tecnicas: Json
          id: string
          idiomas: Json
          proyecto_graduacion_resumen: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cursos_relevantes?: string[]
          estudiante_id: string
          habilidades_blandas?: string[]
          habilidades_tecnicas?: Json
          id?: string
          idiomas?: Json
          proyecto_graduacion_resumen?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cursos_relevantes?: string[]
          estudiante_id?: string
          habilidades_blandas?: string[]
          habilidades_tecnicas?: Json
          id?: string
          idiomas?: Json
          proyecto_graduacion_resumen?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: true
            referencedRelation: "users"
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
            referencedRelation: "curriculum"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_experiencia: {
        Row: {
          bullets: string[]
          curriculum_id: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          orden: number
          organizacion: string
          tipo: string
          titulo: string
        }
        Insert: {
          bullets?: string[]
          curriculum_id: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          orden?: number
          organizacion: string
          tipo: string
          titulo: string
        }
        Update: {
          bullets?: string[]
          curriculum_id?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          orden?: number
          organizacion?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_experiencia_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curriculum"
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
            referencedRelation: "curriculum"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curriculum_versiones_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "posiciones"
            referencedColumns: ["id"]
          },
        ]
      }
      donaciones: {
        Row: {
          id: string
          alumni_id: string | null
          proyecto_destino: string
          monto: number
          moneda: string
          metodo_pago: string
          fecha_transferencia: string
          numero_referencia: string | null
          comprobante_url: string
          mensaje_estudiante: string | null
          estado: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          alumni_id?: string | null
          proyecto_destino?: string
          monto: number
          moneda: string
          metodo_pago: string
          fecha_transferencia: string
          numero_referencia?: string | null
          comprobante_url: string
          mensaje_estudiante?: string | null
          estado?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          alumni_id?: string | null
          proyecto_destino?: string
          monto?: number
          moneda?: string
          metodo_pago?: string
          fecha_transferencia?: string
          numero_referencia?: string | null
          comprobante_url?: string
          mensaje_estudiante?: string | null
          estado?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donaciones_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
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
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          skills: string[] | null
          twitter_url: string | null
          instagram_url: string | null
          experience: Json
          foto_url: string | null
          pais_ciudad: string | null
          linkedin_url: string | null
          bio: string | null
          academic: Json
          empresa_actual: string | null
          cargo_actual: string | null
          sector_industria: string[] | null
          anos_experiencia: number | null
          areas_de_interes: string[] | null
          ofrece_mentoria: boolean
          horas_mes_mentoria: number | null
          ofrece_empleo: boolean
          ofrece_pasantia: boolean
          ofrece_proyecto: boolean
          ofrece_donacion_dinero: boolean
          monto_maximo_donacion: number | null
          moneda_donacion: string | null
          donacion_monto_max: number | null
          donacion_moneda: string | null
          es_exalumno: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          instagram_url?: string | null
          experience?: Json
          foto_url?: string | null
          pais_ciudad?: string | null
          linkedin_url?: string | null
          bio?: string | null
          academic?: Json
          empresa_actual?: string | null
          cargo_actual?: string | null
          sector_industria?: string[] | null
          anos_experiencia?: number | null
          areas_de_interes?: string[] | null
          ofrece_mentoria?: boolean
          horas_mes_mentoria?: number | null
          ofrece_empleo?: boolean
          ofrece_pasantia?: boolean
          ofrece_proyecto?: boolean
          ofrece_donacion_dinero?: boolean
          monto_maximo_donacion?: number | null
          moneda_donacion?: string | null
          donacion_monto_max?: number | null
          donacion_moneda?: string | null
          es_exalumno?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          skills?: string[] | null
          twitter_url?: string | null
          instagram_url?: string | null
          experience?: Json
          foto_url?: string | null
          pais_ciudad?: string | null
          linkedin_url?: string | null
          bio?: string | null
          academic?: Json
          empresa_actual?: string | null
          cargo_actual?: string | null
          sector_industria?: string[] | null
          anos_experiencia?: number | null
          areas_de_interes?: string[] | null
          ofrece_mentoria?: boolean
          horas_mes_mentoria?: number | null
          ofrece_empleo?: boolean
          ofrece_pasantia?: boolean
          ofrece_proyecto?: boolean
          ofrece_donacion_dinero?: boolean
          monto_maximo_donacion?: number | null
          moneda_donacion?: string | null
          donacion_monto_max?: number | null
          donacion_moneda?: string | null
          es_exalumno?: boolean
          created_at?: string
          updated_at?: string
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
            foreignKeyName: "matches_exalumno_id_fkey"
            columns: ["exalumno_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        ]
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
            foreignKeyName: "reportes_perfil_reportado_por_fkey"
            columns: ["reportado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          activo: boolean
          bio: string | null
          busca_empleo: boolean
          busca_financiamiento: boolean
          busca_mentoria: boolean
          busca_pasantia: boolean
          carrera_principal_id: number | null
          created_at: string
          deleted_at: string | null
          email: string
          email_verified: boolean
          escuela_facultad: string | null
          foto_url: string | null
          id: string
          nombre: string
          ofrece_donacion_dinero: boolean
          ofrece_empleo: boolean
          ofrece_mentoria: boolean
          ofrece_pasantia: boolean
          reportes_recibidos: number
          rol: string
          sector_industria: string[] | null
          tipo: string
          visible_en_directorio: boolean
        }
        Insert: {
          activo?: boolean
          bio?: string | null
          busca_empleo?: boolean
          busca_financiamiento?: boolean
          busca_mentoria?: boolean
          busca_pasantia?: boolean
          carrera_principal_id?: number | null
          created_at?: string
          deleted_at?: string | null
          email: string
          email_verified?: boolean
          escuela_facultad?: string | null
          foto_url?: string | null
          id?: string
          nombre: string
          proyecto_area_tematica?: string | null
          proyecto_descripcion?: string | null
          proyecto_porcentaje_avance?: number | null
          proyecto_tipo?: string | null
          proyecto_titulo?: string | null
          reportes_recibidos?: number
          rol: string
          sede?: string | null
          tipo: string
          visible_en_directorio?: boolean | null
        }
        Update: {
          activo?: boolean
          bio?: string | null
          busca_empleo?: boolean
          busca_financiamiento?: boolean
          busca_mentoria?: boolean
          busca_pasantia?: boolean
          carrera_principal_id?: number | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          email_verified?: boolean
          escuela_facultad?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          ofrece_donacion_dinero?: boolean
          ofrece_empleo?: boolean
          ofrece_mentoria?: boolean
          ofrece_pasantia?: boolean
          reportes_recibidos?: number
          rol?: string
          sector_industria?: string[] | null
          tipo?: string
          visible_en_directorio?: boolean
        }
        Relationships: []
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
          }
        ]
      }
      curriculums: {
        Row: {
          created_at: string
          cursos_relevantes: string[]
          deleted_at: string | null
          habilidades_blandas: string[]
          habilidades_tecnicas: Json
          id: string
          idiomas: Json
          proyecto_graduacion_resumen: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cursos_relevantes?: string[]
          deleted_at?: string | null
          habilidades_blandas?: string[]
          habilidades_tecnicas?: Json
          id?: string
          idiomas?: Json
          proyecto_graduacion_resumen?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cursos_relevantes?: string[]
          deleted_at?: string | null
          habilidades_blandas?: string[]
          habilidades_tecnicas?: Json
          id?: string
          idiomas?: Json
          proyecto_graduacion_resumen?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculums_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
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
    }
    Functions: {
      buscar_directorio_exalumnos: {
        Args: {
          p_search?: string | null
          p_facultad?: string | null
          p_escuela?: string | null
          p_carreras?: string[] | null
          p_sectores?: string[] | null
          p_areas?: string[] | null
          p_apoyos?: string[] | null
          p_pais_ciudad?: string | null
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          nombre: string
          apellidos: string | null
          foto_url: string | null
          pais_ciudad: string | null
          carrera_principal: string | null
          escuela_principal: string | null
          facultad_principal: string | null
          anio_graduacion: number | null
          empresa_actual: string | null
          cargo_actual: string | null
          sector_industria: string[] | null
          areas_de_interes: string[] | null
          ofrece_mentoria: boolean
          ofrece_empleo: boolean
          ofrece_pasantia: boolean
          ofrece_proyecto: boolean
          ofrece_donacion_dinero: boolean
          score_match: number
          created_at: string
          total_count: number
        }[]
      }
      calcular_score_matching: {
        Args: {
          p_estudiante_id: string
          p_exalumno_id: string
        }
        Returns: number
      }
      calcular_score_posicion_extendido: {
        Args: {
          p_estudiante_id: string
          p_posicion_id: string
        }
        Returns: number
      }
      eliminar_perfil_logico: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      restaurar_registro: {
        Args: {
          p_table_name: string
          p_record_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
