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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          parent_id: string | null
          sender_avatar: string | null
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          sender_avatar?: string | null
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_id?: string | null
          sender_avatar?: string | null
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "admin_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          created_at: string | null
          id: string
          month: string
          page: string | null
          visitor_count: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          page?: string | null
          visitor_count?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          page?: string | null
          visitor_count?: number | null
          year?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          entity_type: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      content_suggestions: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          kind: string
          message: string
          name: string | null
          status: string | null
          subject: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          kind: string
          message: string
          name?: string | null
          status?: string | null
          subject?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          kind?: string
          message?: string
          name?: string | null
          status?: string | null
          subject?: string | null
          url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          audience: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          source: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          audience?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          audience?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          path: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          path?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          path?: string | null
        }
        Relationships: []
      }
      pdf_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      pdfs: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          category_id: string | null
          clicks: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          drive_link: string | null
          file_type: string | null
          file_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          schema_markup: Json | null
          slug: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          category_id?: string | null
          clicks?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          drive_link?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          schema_markup?: Json | null
          slug?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          category_id?: string | null
          clicks?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          drive_link?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          schema_markup?: Json | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdfs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_seo_settings: {
        Row: {
          created_at: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          page_name: string
          schema_markup: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          page_name: string
          schema_markup?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          page_name?: string
          schema_markup?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          category_id: string | null
          clicks: number | null
          created_at: string | null
          description: string | null
          favicon_url: string | null
          id: string
          image_type: string | null
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          schema_markup: Json | null
          short_description: string | null
          slug: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          category_id?: string | null
          clicks?: number | null
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          id?: string
          image_type?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          schema_markup?: Json | null
          short_description?: string | null
          slug?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          category_id?: string | null
          clicks?: number | null
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          id?: string
          image_type?: string | null
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          schema_markup?: Json | null
          short_description?: string | null
          slug?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          category_id: string | null
          clicks: number | null
          content: string | null
          created_at: string | null
          external_url: string | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          schema_markup: Json | null
          slug: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          category_id?: string | null
          clicks?: number | null
          content?: string | null
          created_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          schema_markup?: Json | null
          slug?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          category_id?: string | null
          clicks?: number | null
          content?: string | null
          created_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          schema_markup?: Json | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "updates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_pdf_clicks: { Args: { p_id: string }; Returns: undefined }
      increment_tool_clicks: { Args: { p_id: string }; Returns: undefined }
      increment_update_clicks: { Args: { p_id: string }; Returns: undefined }
      submit_suggestion: {
        Args: {
          p_email?: string
          p_kind: string
          p_message: string
          p_name?: string
          p_subject?: string
          p_url?: string
        }
        Returns: undefined
      }
      subscribe_newsletter: {
        Args: { p_audience?: string; p_email: string; p_source?: string }
        Returns: undefined
      }
      get_unread_message_count: { Args: { user_id: string }; Returns: number }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
