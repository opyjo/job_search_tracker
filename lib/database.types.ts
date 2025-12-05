export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          company_name: string;
          position: string;
          date_applied: string;
          status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
          salary: string | null;
          notes: string | null;
          career_page_url: string | null;
          follow_up_date: string | null;
          contact_person: string | null;
          interview_dates: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          position: string;
          date_applied?: string;
          status?: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
          salary?: string | null;
          notes?: string | null;
          career_page_url?: string | null;
          follow_up_date?: string | null;
          contact_person?: string | null;
          interview_dates?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          position?: string;
          date_applied?: string;
          status?: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
          salary?: string | null;
          notes?: string | null;
          career_page_url?: string | null;
          follow_up_date?: string | null;
          contact_person?: string | null;
          interview_dates?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];
export type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

