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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_settings: {
        Row: {
          created_at: string | null
          huggingface_model: string | null
          huggingface_token: string | null
          id: string
          is_active: boolean | null
          lmstudio_model: string | null
          lmstudio_url: string | null
          max_tokens: number | null
          ollama_model: string | null
          ollama_url: string | null
          openai_api_key: string | null
          openai_model: string | null
          provider: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          huggingface_model?: string | null
          huggingface_token?: string | null
          id?: string
          is_active?: boolean | null
          lmstudio_model?: string | null
          lmstudio_url?: string | null
          max_tokens?: number | null
          ollama_model?: string | null
          ollama_url?: string | null
          openai_api_key?: string | null
          openai_model?: string | null
          provider?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          huggingface_model?: string | null
          huggingface_token?: string | null
          id?: string
          is_active?: boolean | null
          lmstudio_model?: string | null
          lmstudio_url?: string | null
          max_tokens?: number | null
          ollama_model?: string | null
          ollama_url?: string | null
          openai_api_key?: string | null
          openai_model?: string | null
          provider?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          created_at: string
          entity: string
          entity_id: string | null
          hash: string
          id: string
          prev_hash: string | null
          summary: string
          ts: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          entity: string
          entity_id?: string | null
          hash: string
          id?: string
          prev_hash?: string | null
          summary: string
          ts?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          hash?: string
          id?: string
          prev_hash?: string | null
          summary?: string
          ts?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_id: string | null
          id: string
          issued_at: string | null
          serial: string
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          issued_at?: string | null
          serial: string
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          id?: string
          issued_at?: string | null
          serial?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          app_version: string | null
          arrived_at: string
          created_at: string
          device_id: string | null
          geo_hint: string | null
          id: string
          method: string | null
          patient_id: string
          rssi: number | null
          sync_data: Json | null
        }
        Insert: {
          app_version?: string | null
          arrived_at?: string
          created_at?: string
          device_id?: string | null
          geo_hint?: string | null
          id?: string
          method?: string | null
          patient_id: string
          rssi?: number | null
          sync_data?: Json | null
        }
        Update: {
          app_version?: string | null
          arrived_at?: string
          created_at?: string
          device_id?: string | null
          geo_hint?: string | null
          id?: string
          method?: string | null
          patient_id?: string
          rssi?: number | null
          sync_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_settings: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          published: boolean | null
          required_for_roles: string[] | null
          slug: string
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          published?: boolean | null
          required_for_roles?: string[] | null
          slug: string
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          published?: boolean | null
          required_for_roles?: string[] | null
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          device_name: string | null
          device_uuid: string
          first_seen_at: string
          id: string
          last_seen_at: string
          patient_id: string | null
          public_key: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          device_uuid: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          patient_id?: string | null
          public_key?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          device_uuid?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          patient_id?: string | null
          public_key?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      dosages: {
        Row: {
          administered_at: string
          administered_by: string
          created_at: string
          dose_mg: number
          id: string
          medication: string
          notes: string | null
          observed: boolean
          patient_id: string
          visit_id: string | null
        }
        Insert: {
          administered_at?: string
          administered_by: string
          created_at?: string
          dose_mg: number
          id?: string
          medication?: string
          notes?: string | null
          observed?: boolean
          patient_id: string
          visit_id?: string | null
        }
        Update: {
          administered_at?: string
          administered_by?: string
          created_at?: string
          dose_mg?: number
          id?: string
          medication?: string
          notes?: string | null
          observed?: boolean
          patient_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dosages_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dosages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dosages_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          error_message: string | null
          file_size: number
          id: string
          input_path: string | null
          mime_type: string
          options: Json
          original_name: string
          output_path: string | null
          output_url: string | null
          preset: string
          progress: number
          provider: Database["public"]["Enums"]["provider_type"]
          provider_job_id: string | null
          status: Database["public"]["Enums"]["job_status"]
          target_format: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          file_size: number
          id?: string
          input_path?: string | null
          mime_type: string
          options?: Json
          original_name: string
          output_path?: string | null
          output_url?: string | null
          preset: string
          progress?: number
          provider: Database["public"]["Enums"]["provider_type"]
          provider_job_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          target_format: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          file_size?: number
          id?: string
          input_path?: string | null
          mime_type?: string
          options?: Json
          original_name?: string
          output_path?: string | null
          output_url?: string | null
          preset?: string
          progress?: number
          provider?: Database["public"]["Enums"]["provider_type"]
          provider_job_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          target_format?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          module_id: string | null
          order_index: number
          quiz_id: string | null
          title: string
          type: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          module_id?: string | null
          order_index?: number
          quiz_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          module_id?: string | null
          order_index?: number
          quiz_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          dob: string
          first_name: string
          id: string
          last_name: string
          mrn: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dob: string
          first_name: string
          id?: string
          last_name: string
          mrn: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dob?: string
          first_name?: string
          id?: string
          last_name?: string
          mrn?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          ip_hash: string | null
          passed: boolean
          quiz_id: string | null
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_hash?: string | null
          passed: boolean
          quiz_id?: string | null
          score: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_hash?: string | null
          passed?: boolean
          quiz_id?: string | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          id: string
          pass_score: number
          questions: Json
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pass_score: number
          questions: Json
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pass_score?: number
          questions?: Json
          title?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          value_json: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          value_json?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          value_json?: Json
        }
        Relationships: []
      }
      staff: {
        Row: {
          active: boolean
          created_at: string
          id: string
          mfa_enabled: boolean
          name: string
          role: string
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          mfa_enabled?: boolean
          name: string
          role?: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          mfa_enabled?: boolean
          name?: string
          role?: string
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          contact_info: string | null
          contact_name: string | null
          created_at: string
          details: string | null
          id: string
          product: string
          resolution: string | null
          resolved_at: string | null
          role: string
          severity: string
          sla_due_at: string | null
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          contact_info?: string | null
          contact_name?: string | null
          created_at?: string
          details?: string | null
          id?: string
          product: string
          resolution?: string | null
          resolved_at?: string | null
          role: string
          severity: string
          sla_due_at?: string | null
          status?: string
          summary: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          contact_info?: string | null
          contact_name?: string | null
          created_at?: string
          details?: string | null
          id?: string
          product?: string
          resolution?: string | null
          resolved_at?: string | null
          role?: string
          severity?: string
          sla_due_at?: string | null
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_audit_events: {
        Row: {
          created_at: string | null
          event: string
          id: number
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: number
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: number
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      training_certificates: {
        Row: {
          course_id: string | null
          id: string
          issued_at: string | null
          serial: string
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          issued_at?: string | null
          serial: string
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          id?: string
          issued_at?: string | null
          serial?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          published: boolean | null
          required_for_roles: string[] | null
          slug: string
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          published?: boolean | null
          required_for_roles?: string[] | null
          slug: string
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          published?: boolean | null
          required_for_roles?: string[] | null
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "training_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      training_lessons: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          module_id: string
          order_index: number
          quiz_id: string | null
          title: string
          type: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          module_id: string
          order_index?: number
          quiz_id?: string | null
          title: string
          type: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          module_id?: string
          order_index?: number
          quiz_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_quiz_attempts: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          ip_hash: string | null
          passed: boolean
          quiz_id: string | null
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_hash?: string | null
          passed: boolean
          quiz_id?: string | null
          score: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_hash?: string | null
          passed?: boolean
          quiz_id?: string | null
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "training_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quizzes: {
        Row: {
          created_at: string | null
          id: string
          pass_score: number
          questions: Json
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pass_score: number
          questions: Json
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pass_score?: number
          questions?: Json
          title?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          arrived_at: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          staff_id: string | null
          triage_status: string | null
          updated_at: string
        }
        Insert: {
          arrived_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          staff_id?: string | null
          triage_status?: string | null
          updated_at?: string
        }
        Update: {
          arrived_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          staff_id?: string | null
          triage_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_audit_hash: {
        Args: {
          p_action: string
          p_actor_id: string
          p_actor_type: string
          p_entity: string
          p_entity_id: string
          p_prev_hash: string
          p_summary: string
          p_ts: string
        }
        Returns: string
      }
      calculate_sla_due: {
        Args: { created_time: string; severity_level: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      needs_initial_setup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      register_staff: {
        Args: {
          _full_name: string
          _role?: Database["public"]["Enums"]["role_type"]
        }
        Returns: undefined
      }
      setup_initial_admin: {
        Args: { _full_name: string; _user_id: string }
        Returns: undefined
      }
      training_get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      job_status: "queued" | "processing" | "completed" | "failed" | "cancelled"
      provider_type: "freeconvert" | "sovereign"
      role_type: "admin" | "clinician" | "reception"
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
  public: {
    Enums: {
      job_status: ["queued", "processing", "completed", "failed", "cancelled"],
      provider_type: ["freeconvert", "sovereign"],
      role_type: ["admin", "clinician", "reception"],
    },
  },
} as const
