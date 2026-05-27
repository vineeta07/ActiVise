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
  public: {
    Tables: {
      app_notifications: {
        Row: {
          campaign_id: string | null
          channel: string
          created_at: string
          id: string
          message: string
          priority: string
          title: string
          user_phone: string | null
        }
        Insert: {
          campaign_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          message: string
          priority?: string
          title: string
          user_phone?: string | null
        }
        Update: {
          campaign_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string
          title?: string
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_notifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_registrations: {
        Row: {
          campaign_id: string
          campaign_title: string
          created_at: string
          id: string
          phone: string | null
          status: string
          user_key: string
          whatsapp_opt_in: boolean
        }
        Insert: {
          campaign_id: string
          campaign_title: string
          created_at?: string
          id?: string
          phone?: string | null
          status?: string
          user_key?: string
          whatsapp_opt_in?: boolean
        }
        Update: {
          campaign_id?: string
          campaign_title?: string
          created_at?: string
          id?: string
          phone?: string | null
          status?: string
          user_key?: string
          whatsapp_opt_in?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "campaign_registrations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_anchors: {
        Row: {
          anchor_status: string
          certificate_id: string
          chain_reference: string
          content_hash: string
          created_at: string
          id: string
          mission_title: string
          recipient_name: string
        }
        Insert: {
          anchor_status?: string
          certificate_id: string
          chain_reference: string
          content_hash: string
          created_at?: string
          id?: string
          mission_title: string
          recipient_name: string
        }
        Update: {
          anchor_status?: string
          certificate_id?: string
          chain_reference?: string
          content_hash?: string
          created_at?: string
          id?: string
          mission_title?: string
          recipient_name?: string
        }
        Relationships: []
      }
      certificate_issuances: {
        Row: {
          certificate_id: string
          chain_id: number | null
          chain_reference: string | null
          content_hash: string
          contract_address: string | null
          created_at: string
          error_message: string | null
          filler: Json
          id: string
          issuer_name: string
          mission_title: string
          recipient_name: string
          rendered_content: string
          status: string
          template_code: string
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          certificate_id: string
          chain_id?: number | null
          chain_reference?: string | null
          content_hash: string
          contract_address?: string | null
          created_at?: string
          error_message?: string | null
          filler?: Json
          id?: string
          issuer_name: string
          mission_title: string
          recipient_name: string
          rendered_content: string
          status?: string
          template_code: string
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          certificate_id?: string
          chain_id?: number | null
          chain_reference?: string | null
          content_hash?: string
          contract_address?: string | null
          created_at?: string
          error_message?: string | null
          filler?: Json
          id?: string
          issuer_name?: string
          mission_title?: string
          recipient_name?: string
          rendered_content?: string
          status?: string
          template_code?: string
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_issuances_template_code_fkey"
            columns: ["template_code"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["template_code"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          body_template: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          placeholders: string[]
          template_code: string
        }
        Insert: {
          body_template: string
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          placeholders?: string[]
          template_code: string
        }
        Update: {
          body_template?: string
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          placeholders?: string[]
          template_code?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_avatar: string
          author_name: string
          content: string
          created_at: string
          id: string
          likes: number | null
          location: string | null
          replies: number | null
          tag: string | null
        }
        Insert: {
          author_avatar?: string
          author_name?: string
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          location?: string | null
          replies?: number | null
          tag?: string | null
        }
        Update: {
          author_avatar?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          location?: string | null
          replies?: number | null
          tag?: string | null
        }
        Relationships: []
      }
      company_task_progress: {
        Row: {
          company_key: string
          company_name: string
          completed_tasks: number
          updated_at: string
        }
        Insert: {
          company_key: string
          company_name: string
          completed_tasks?: number
          updated_at?: string
        }
        Update: {
          company_key?: string
          company_name?: string
          completed_tasks?: number
          updated_at?: string
        }
        Relationships: []
      }
      impact_proofs: {
        Row: {
          after_photo_url: string | null
          before_photo_url: string | null
          co2_offset_kg: number | null
          created_at: string
          exif_authentic: boolean | null
          geo_distance_m: number | null
          geo_within_geofence: boolean | null
          id: string
          mission_id: string | null
          sdgs: string[] | null
          verification_status: string | null
          vision_class: string | null
          vision_confidence: number | null
          volunteer_name: string | null
        }
        Insert: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          co2_offset_kg?: number | null
          created_at?: string
          exif_authentic?: boolean | null
          geo_distance_m?: number | null
          geo_within_geofence?: boolean | null
          id?: string
          mission_id?: string | null
          sdgs?: string[] | null
          verification_status?: string | null
          vision_class?: string | null
          vision_confidence?: number | null
          volunteer_name?: string | null
        }
        Update: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          co2_offset_kg?: number | null
          created_at?: string
          exif_authentic?: boolean | null
          geo_distance_m?: number | null
          geo_within_geofence?: boolean | null
          id?: string
          mission_id?: string | null
          sdgs?: string[] | null
          verification_status?: string | null
          vision_class?: string | null
          vision_confidence?: number | null
          volunteer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_proofs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          fund_goal: number | null
          fund_raised: number | null
          geofence_radius: number | null
          id: string
          latitude: number
          location_name: string | null
          longitude: number
          required_volunteers: number
          status: string
          title: string
          updated_at: string
          urgency: string
          volunteer_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          fund_goal?: number | null
          fund_raised?: number | null
          geofence_radius?: number | null
          id?: string
          latitude?: number
          location_name?: string | null
          longitude?: number
          required_volunteers?: number
          status?: string
          title: string
          updated_at?: string
          urgency?: string
          volunteer_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          fund_goal?: number | null
          fund_raised?: number | null
          geofence_radius?: number | null
          id?: string
          latitude?: number
          location_name?: string | null
          longitude?: number
          required_volunteers?: number
          status?: string
          title?: string
          updated_at?: string
          urgency?: string
          volunteer_count?: number | null
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          avatar: string
          badge: string | null
          co2_offset: number | null
          created_at: string
          id: string
          impact_rank: number | null
          name: string
          sbt_count: number | null
        }
        Insert: {
          avatar?: string
          badge?: string | null
          co2_offset?: number | null
          created_at?: string
          id?: string
          impact_rank?: number | null
          name: string
          sbt_count?: number | null
        }
        Update: {
          avatar?: string
          badge?: string | null
          co2_offset?: number | null
          created_at?: string
          id?: string
          impact_rank?: number | null
          name?: string
          sbt_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
