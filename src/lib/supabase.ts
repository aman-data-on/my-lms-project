import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          employee_id: string;
          department: string;
          job_title: string;
          email: string;
          avatar_url: string | null;
          onboarding_batch: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          department: string;
          thumbnail_url: string | null;
          duration: string;
          created_at: string;
          updated_at: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          type: string;
          video_url: string | null;
          duration: string | null;
          order_index: number;
          created_at: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: string;
          progress_percent: number;
          enrolled_at: string;
          completed_at: string | null;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          title: string;
          course_id: string | null;
          time_limit: number;
          passing_score: number;
          created_at: string;
        };
      };
      questions: {
        Row: {
          id: string;
          assessment_id: string;
          type: string;
          question_text: string;
          options: any;
          correct_answer: string | null;
          matching_pairs: any;
          manual_grading: boolean;
          order_index: number;
          created_at: string;
        };
      };
      assessment_attempts: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          score: number | null;
          status: string;
          answers: any;
          started_at: string;
          submitted_at: string | null;
        };
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          course_name: string;
          score: number | null;
          certificate_id: string;
          issued_at: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string | null;
          created_at: string;
        };
      };
    };
  };
};
