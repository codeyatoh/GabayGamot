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
      patients: {
        Row: {
          age: number;
          barangay: string;
          city_municipality: string;
          contact_number: string | null;
          created_at: string;
          created_by: string;
          first_name: string;
          health_center_id: string;
          id: string;
          last_name: string;
          middle_name: string | null;
          patient_code: string;
          sex: string;
          suffix: string | null;
          updated_at: string;
        };
        Insert: {
          age: number;
          barangay: string;
          city_municipality: string;
          contact_number?: string | null;
          created_at?: string;
          created_by: string;
          first_name: string;
          health_center_id: string;
          id?: string;
          last_name: string;
          middle_name?: string | null;
          patient_code: string;
          sex: string;
          suffix?: string | null;
          updated_at?: string;
        };
        Update: {
          age?: number;
          barangay?: string;
          city_municipality?: string;
          contact_number?: string | null;
          created_at?: string;
          created_by?: string;
          first_name?: string;
          health_center_id?: string;
          id?: string;
          last_name?: string;
          middle_name?: string | null;
          patient_code?: string;
          sex?: string;
          suffix?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "patients_health_center_id_fkey";
            columns: ["health_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          }
        ];
      };
      medicine_master: {
        Row: {
          id: string;
          generic_name: string;
          brand_name: string | null;
          strength: string;
          dosage_form: string;
          category: string | null;
          description: string | null;
          prescription_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          generic_name: string;
          brand_name?: string | null;
          strength: string;
          dosage_form: string;
          category?: string | null;
          description?: string | null;
          prescription_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          generic_name?: string;
          brand_name?: string | null;
          strength?: string;
          dosage_form?: string;
          category?: string | null;
          description?: string | null;
          prescription_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medicine_batches: {
        Row: {
          id: string;
          medicine_id: string;
          health_center_id: string;
          batch_number: string;
          quantity: number;
          unit: string;
          expiry_date: string;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          health_center_id: string;
          batch_number: string;
          quantity?: number;
          unit?: string;
          expiry_date: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          medicine_id?: string;
          health_center_id?: string;
          batch_number?: string;
          quantity?: number;
          unit?: string;
          expiry_date?: string;
          status?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medicine_batches_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medicine_batches_health_center_id_fkey";
            columns: ["health_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medicine_batches_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicine_master";
            referencedColumns: ["id"];
          }
        ];
      };
      consultations: {
        Row: {
          chief_complaint: string;
          consultation_date: string;
          consultation_notes: string | null;
          consulted_by: string;
          created_at: string;
          health_center_id: string;
          id: string;
          illness_category: string;
          patient_id: string;
          prescription_status: string;
          updated_at: string;
        };
        Insert: {
          chief_complaint: string;
          consultation_date?: string;
          consultation_notes?: string | null;
          consulted_by: string;
          created_at?: string;
          health_center_id: string;
          id?: string;
          illness_category: string;
          patient_id: string;
          prescription_status?: string;
          updated_at?: string;
        };
        Update: {
          chief_complaint?: string;
          consultation_date?: string;
          consultation_notes?: string | null;
          consulted_by?: string;
          created_at?: string;
          health_center_id?: string;
          id?: string;
          illness_category?: string;
          patient_id?: string;
          prescription_status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultations_consulted_by_fkey";
            columns: ["consulted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultations_health_center_id_fkey";
            columns: ["health_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultations_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          }
        ];
      };
      consultation_medicine_requests: {
        Row: {
          consultation_id: string;
          created_at: string;
          id: string;
          medicine_id: string;
          notes: string | null;
          patient_id: string;
          requested_quantity: number;
          status: string;
        };
        Insert: {
          consultation_id: string;
          created_at?: string;
          id?: string;
          medicine_id: string;
          notes?: string | null;
          patient_id: string;
          requested_quantity: number;
          status?: string;
        };
        Update: {
          consultation_id?: string;
          created_at?: string;
          id?: string;
          medicine_id?: string;
          notes?: string | null;
          patient_id?: string;
          requested_quantity?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultation_medicine_requests_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultation_medicine_requests_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicine_master";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultation_medicine_requests_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          }
        ];
      };
      dispense_logs: {
        Row: {
          batch_id: string;
          consultation_id: string | null;
          dispensed_at: string;
          dispensed_by: string;
          health_center_id: string;
          id: string;
          illness_category: string;
          patient_code: string;
          patient_id: string | null;
          quantity_dispensed: number;
          unit: string;
        };
        Insert: {
          batch_id: string;
          consultation_id?: string | null;
          dispensed_at?: string;
          dispensed_by: string;
          health_center_id: string;
          id?: string;
          illness_category: string;
          patient_code: string;
          patient_id?: string | null;
          quantity_dispensed: number;
          unit: string;
        };
        Update: {
          batch_id?: string;
          consultation_id?: string | null;
          dispensed_at?: string;
          dispensed_by?: string;
          health_center_id?: string;
          id?: string;
          illness_category?: string;
          patient_code?: string;
          patient_id?: string | null;
          quantity_dispensed?: number;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dispense_logs_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "medicine_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dispense_logs_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dispense_logs_dispensed_by_fkey";
            columns: ["dispensed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dispense_logs_health_center_id_fkey";
            columns: ["health_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dispense_logs_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          }
        ];
      };
      illness_logs: {
        Row: {
          action_taken: string;
          created_at: string;
          health_center_id: string;
          id: string;
          illness_category: string;
          logged_by: string;
          notes: string | null;
          patient_code: string;
        };
        Insert: {
          action_taken: string;
          created_at?: string;
          health_center_id: string;
          id?: string;
          illness_category: string;
          logged_by: string;
          notes?: string | null;
          patient_code: string;
        };
        Update: {
          action_taken?: string;
          created_at?: string;
          health_center_id?: string;
          id?: string;
          illness_category?: string;
          logged_by?: string;
          notes?: string | null;
          patient_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "illness_logs_health_center_id_fkey";
            columns: ["health_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "illness_logs_logged_by_fkey";
            columns: ["logged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      referrals: {
        Row: {
          chief_complaint: string | null;
          consultation_id: string | null;
          consultation_notes: string | null;
          created_at: string;
          created_by: string;
          id: string;
          illness_category: string | null;
          medicine_id: string;
          patient_code: string;
          patient_id: string | null;
          quantity_requested: number;
          receiving_center_id: string;
          referring_center_id: string;
          status: Database["public"]["Enums"]["referral_status"];
          updated_at: string;
        };
        Insert: {
          chief_complaint?: string | null;
          consultation_id?: string | null;
          consultation_notes?: string | null;
          created_at?: string;
          created_by: string;
          id?: string;
          illness_category?: string | null;
          medicine_id: string;
          patient_code: string;
          patient_id?: string | null;
          quantity_requested: number;
          receiving_center_id: string;
          referring_center_id: string;
          status?: Database["public"]["Enums"]["referral_status"];
          updated_at?: string;
        };
        Update: {
          chief_complaint?: string | null;
          consultation_id?: string | null;
          consultation_notes?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          illness_category?: string | null;
          medicine_id?: string;
          patient_code?: string;
          patient_id?: string | null;
          quantity_requested?: number;
          receiving_center_id?: string;
          referring_center_id?: string;
          status?: Database["public"]["Enums"]["referral_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicine_master";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_receiving_center_id_fkey";
            columns: ["receiving_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referring_center_id_fkey";
            columns: ["referring_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_events: {
        Row: {
          actor_id: string | null;
          actor_role: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          event_type: string;
          health_center_id: string | null;
          id: string;
          metadata: Json;
          summary: string;
        };
        Insert: {
          actor_id?: string | null;
          actor_role: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          event_type: string;
          health_center_id?: string | null;
          id?: string;
          metadata?: Json;
          summary: string;
        };
        Update: {
          actor_id?: string | null;
          actor_role?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          event_type?: string;
          health_center_id?: string | null;
          id?: string;
          metadata?: Json;
          summary?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_events_health_center_id_fkey";
            columns: ["health_center_id"];
            isOneToOne: false;
            referencedRelation: "health_centers";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "bhw" | "super_admin";
      approval_status: "pending" | "approved" | "rejected";
      referral_status: "pending" | "completed" | "cancelled";
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
