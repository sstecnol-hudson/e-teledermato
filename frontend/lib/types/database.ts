export type UserRole = "solicitante" | "dermatologista" | "gestor" | "admin";
export type RiskLevel = "verde" | "amarelo_leve" | "amarelo_grave" | "vermelho" | "urgencia";
export type CaseStatus = "aguardando_triagem" | "em_analise" | "laudado" | "encaminhado" | "resolvido" | "cancelado";
export type ProtocolType = "A" | "B";

export interface Database {
  public: {
    Tables: {
      health_units: {
        Row: {
          id: string;
          name: string;
          cnes: string | null;
          city: string;
          state: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["health_units"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["health_units"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          crm: string | null;
          health_unit_id: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      patients: {
        Row: {
          id: string;
          cpf: string | null;
          cns: string | null;
          full_name: string;
          birth_date: string;
          gender: "M" | "F" | "O" | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string;
          health_unit_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["patients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
      };
      cases: {
        Row: {
          id: string;
          protocol_number: string;
          protocol_type: ProtocolType;
          patient_id: string;
          requester_id: string;
          assigned_to: string | null;
          health_unit_id: string | null;
          status: CaseStatus;
          risk_level: RiskLevel | null;
          chief_complaint: string;
          clinical_history: string | null;
          lesion_location: string | null;
          lesion_duration: string | null;
          previous_treatments: string | null;
          comorbidities: string | null;
          medications: string | null;
          ai_analysis: string | null;
          ai_risk_assessment: string | null;
          priority_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "protocol_number" | "created_at" | "updated_at" | "priority_score"> & { priority_score?: number };
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>;
      };
      case_images: {
        Row: {
          id: string;
          case_id: string;
          image_url: string;
          image_type: string | null;
          description: string | null;
          quality_score: number | null;
          quality_checklist: Record<string, boolean> | null;
          uploaded_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["case_images"]["Row"], "id" | "uploaded_at">;
        Update: Partial<Database["public"]["Tables"]["case_images"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          case_id: string;
          dermatologist_id: string;
          hypothesis: string;
          cid10_code: string | null;
          cid10_description: string | null;
          conduct: string;
          recommendations: string | null;
          follow_up_required: boolean;
          follow_up_days: number | null;
          risk_level: RiskLevel;
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reports"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Case = Database["public"]["Tables"]["cases"]["Row"];
export type CaseImage = Database["public"]["Tables"]["case_images"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type HealthUnit = Database["public"]["Tables"]["health_units"]["Row"];

// Extended types with relations
export interface CaseWithRelations extends Case {
  patient: Patient;
  requester: Profile;
  assigned_dermatologist?: Profile;
  images: CaseImage[];
  reports: Report[];
  health_unit?: HealthUnit;
}

export interface ReportWithRelations extends Report {
  case: Case;
  dermatologist: Profile;
}
