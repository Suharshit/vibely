export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      event_members: {
        Row: {
          event_id: string;
          id: string;
          is_guest: boolean;
          joined_at: string;
          role: string;
          user_id: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          is_guest?: boolean;
          joined_at?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          is_guest?: boolean;
          joined_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_members_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          cover_image_url: string | null;
          created_at: string;
          description: string | null;
          event_date: string;
          expires_at: string;
          host_id: string;
          id: string;
          invite_token: string;
          status: string;
          title: string;
          updated_at: string;
          upload_permission: string;
        };
        Insert: {
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          event_date: string;
          expires_at: string;
          host_id: string;
          id?: string;
          invite_token: string;
          status?: string;
          title: string;
          updated_at?: string;
          upload_permission?: string;
        };
        Update: {
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          event_date?: string;
          expires_at?: string;
          host_id?: string;
          id?: string;
          invite_token?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          upload_permission?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      guest_sessions: {
        Row: {
          created_at: string;
          display_name: string;
          event_id: string;
          id: string;
          session_token: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          event_id: string;
          id?: string;
          session_token: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          event_id?: string;
          id?: string;
          session_token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guest_sessions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "photo_uploaded" | "member_joined" | "event_expiring";
          event_id: string | null;
          photo_id: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "photo_uploaded" | "member_joined" | "event_expiring";
          event_id?: string | null;
          photo_id?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "photo_uploaded" | "member_joined" | "event_expiring";
          event_id?: string | null;
          photo_id?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          }
        ];
      };
      personal_vault: {
        Row: {
          id: string;
          photo_id: string;
          saved_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          photo_id: string;
          saved_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          photo_id?: string;
          saved_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "personal_vault_photo_id_fkey";
            columns: ["photo_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "personal_vault_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          event_id: string;
          file_size: number;
          id: string;
          is_saved_to_vault: boolean;
          original_filename: string;
          status: string;
          storage_key: string;
          thumbnail_key: string;
          uploaded_by_guest: string | null;
          uploaded_by_user: string | null;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          event_id: string;
          file_size: number;
          id?: string;
          is_saved_to_vault?: boolean;
          original_filename: string;
          status?: string;
          storage_key: string;
          thumbnail_key: string;
          uploaded_by_guest?: string | null;
          uploaded_by_user?: string | null;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          event_id?: string;
          file_size?: number;
          id?: string;
          is_saved_to_vault?: boolean;
          original_filename?: string;
          status?: string;
          storage_key?: string;
          thumbnail_key?: string;
          uploaded_by_guest?: string | null;
          uploaded_by_user?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "photos_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_uploaded_by_guest_fkey";
            columns: ["uploaded_by_guest"];
            isOneToOne: false;
            referencedRelation: "guest_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_uploaded_by_user_fkey";
            columns: ["uploaded_by_user"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          auth_provider: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          email: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          auth_provider?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email: string;
          id: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          auth_provider?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
