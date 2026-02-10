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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      barberias: {
        Row: {
          created_at: string
          direccion: string | null
          id: string
          logo_url: string | null
          nombre: string
          telefono: string | null
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
          telefono?: string | null
        }
        Update: {
          created_at?: string
          direccion?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      cierres_caja: {
        Row: {
          barberia_id: string
          created_at: string
          fecha: string
          ganancia_neta: number
          id: string
          total_comisiones: number
          total_gastos: number
          total_ingresos: number
        }
        Insert: {
          barberia_id: string
          created_at?: string
          fecha: string
          ganancia_neta?: number
          id?: string
          total_comisiones?: number
          total_gastos?: number
          total_ingresos?: number
        }
        Update: {
          barberia_id?: string
          created_at?: string
          fecha?: string
          ganancia_neta?: number
          id?: string
          total_comisiones?: number
          total_gastos?: number
          total_ingresos?: number
        }
        Relationships: [
          {
            foreignKeyName: "cierres_caja_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          barberia_id: string
          created_at: string
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
        }
        Insert: {
          barberia_id: string
          created_at?: string
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
        }
        Update: {
          barberia_id?: string
          created_at?: string
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      codigos_invitacion: {
        Row: {
          activo: boolean
          barberia_id: string
          codigo: string
          created_at: string
          id: string
          usado_por: string | null
        }
        Insert: {
          activo?: boolean
          barberia_id: string
          codigo: string
          created_at?: string
          id?: string
          usado_por?: string | null
        }
        Update: {
          activo?: boolean
          barberia_id?: string
          codigo?: string
          created_at?: string
          id?: string
          usado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codigos_invitacion_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos: {
        Row: {
          barberia_id: string
          created_at: string
          descripcion: string
          fecha: string
          id: string
          monto: number
        }
        Insert: {
          barberia_id: string
          created_at?: string
          descripcion: string
          fecha?: string
          id?: string
          monto: number
        }
        Update: {
          barberia_id?: string
          created_at?: string
          descripcion?: string
          fecha?: string
          id?: string
          monto?: number
        }
        Relationships: [
          {
            foreignKeyName: "gastos_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          barberia_id: string | null
          commission_type: Database["public"]["Enums"]["commission_type"]
          commission_value: number
          created_at: string
          full_name: string
          id: string
          user_id: string
        }
        Insert: {
          barberia_id?: string | null
          commission_type?: Database["public"]["Enums"]["commission_type"]
          commission_value?: number
          created_at?: string
          full_name: string
          id?: string
          user_id: string
        }
        Update: {
          barberia_id?: string | null
          commission_type?: Database["public"]["Enums"]["commission_type"]
          commission_value?: number
          created_at?: string
          full_name?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          activo: boolean
          barberia_id: string
          created_at: string
          duracion_min: number
          id: string
          nombre: string
          precio: number
        }
        Insert: {
          activo?: boolean
          barberia_id: string
          created_at?: string
          duracion_min?: number
          id?: string
          nombre: string
          precio?: number
        }
        Update: {
          activo?: boolean
          barberia_id?: string
          created_at?: string
          duracion_min?: number
          id?: string
          nombre?: string
          precio?: number
        }
        Relationships: [
          {
            foreignKeyName: "servicios_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      trabajos: {
        Row: {
          barberia_id: string
          barbero_id: string
          cliente_id: string | null
          comision: number
          created_at: string
          fecha: string
          id: string
          precio: number
          servicio_id: string
        }
        Insert: {
          barberia_id: string
          barbero_id: string
          cliente_id?: string | null
          comision?: number
          created_at?: string
          fecha?: string
          id?: string
          precio: number
          servicio_id: string
        }
        Update: {
          barberia_id?: string
          barbero_id?: string
          cliente_id?: string | null
          comision?: number
          created_at?: string
          fecha?: string
          id?: string
          precio?: number
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trabajos_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabajos_barbero_id_fkey"
            columns: ["barbero_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabajos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabajos_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_barberia_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "barber"
      commission_type: "percentage" | "fixed"
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
      app_role: ["owner", "barber"],
      commission_type: ["percentage", "fixed"],
    },
  },
} as const
