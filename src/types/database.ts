export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      health_centers: {
        Row: {
          barangay_name: string;
          center_name: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          latitude: number | null;
          longitude: number | null;
          mapbox_place_name: string | null;
          municipality: string;
          profile_id: string;
          province: string;
          street_address: string | null;
          updated_at: string;
        };
        Insert: {
          barangay_name: string;
          center_name?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          mapbox_place_name?: string | null;
          municipality: string;
          profile_id: string;
          province: string;
          street_address?: string | null;
          updated_at?: string;
        };
        Update: {
          barangay_name?: string;
          center_name?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          mapbox_place_name?: string | null;
          municipality?: string;
          profile_id?: string;
          province?: string;
          street_address?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_centers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"];
          barangay_name: string | null;
          contact_number: string | null;
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          is_super_admin_seeded: boolean;
          municipality: string | null;
          proof_document_path: string | null;
          province: string | null;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"];
          barangay_name?: string | null;
          contact_number?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          is_super_admin_seeded?: boolean;
          municipality?: string | null;
          proof_document_path?: string | null;
          province?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"];
          barangay_name?: string | null;
          contact_number?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          is_super_admin_seeded?: boolean;
          municipality?: string | null;
          proof_document_path?: string | null;
          province?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "bhw" | "super_admin";
      approval_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
  private: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
