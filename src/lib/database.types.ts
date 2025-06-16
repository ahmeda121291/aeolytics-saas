export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          plan: 'free' | 'pro' | 'agency'
          usage_queries: number
          usage_domains: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null
          billing_interval: 'monthly' | 'annual' | null
          current_period_start: string | null
          current_period_end: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          plan?: 'free' | 'pro' | 'agency'
          usage_queries?: number
          usage_domains?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null
          billing_interval?: 'monthly' | 'annual' | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          plan?: 'free' | 'pro' | 'agency'
          usage_queries?: number
          usage_domains?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null
          billing_interval?: 'monthly' | 'annual' | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      domains: {
        Row: {
          id: string
          user_id: string
          domain: string
          favicon_url: string | null
          status: 'pending' | 'active' | 'error'
          queries_count: number
          citations_count: number
          last_check: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          favicon_url?: string | null
          status?: 'pending' | 'active' | 'error'
          queries_count?: number
          citations_count?: number
          last_check?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          favicon_url?: string | null
          status?: 'pending' | 'active' | 'error'
          queries_count?: number
          citations_count?: number
          last_check?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      queries: {
        Row: {
          id: string
          user_id: string
          domain_id: string | null
          query_text: string
          intent_tags: string[]
          engines: string[]
          status: 'active' | 'paused' | 'deleted'
          last_run: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          domain_id?: string | null
          query_text: string
          intent_tags?: string[]
          engines?: string[]
          status?: 'active' | 'paused' | 'deleted'
          last_run?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          domain_id?: string | null
          query_text?: string
          intent_tags?: string[]
          engines?: string[]
          status?: 'active' | 'paused' | 'deleted'
          last_run?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      citations: {
        Row: {
          id: string
          query_id: string
          user_id: string
          engine: string
          response_text: string
          cited: boolean
          position: 'top' | 'middle' | 'bottom' | null
          confidence_score: number
          run_date: string
          created_at: string
        }
        Insert: {
          id?: string
          query_id: string
          user_id: string
          engine: string
          response_text: string
          cited?: boolean
          position?: 'top' | 'middle' | 'bottom' | null
          confidence_score?: number
          run_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          query_id?: string
          user_id?: string
          engine?: string
          response_text?: string
          cited?: boolean
          position?: 'top' | 'middle' | 'bottom' | null
          confidence_score?: number
          run_date?: string
          created_at?: string
        }
      }
      fix_it_briefs: {
        Row: {
          id: string
          query_id: string
          user_id: string
          title: string
          meta_description: string | null
          schema_markup: string | null
          content_brief: string | null
          faq_entries: Json
          status: 'generated' | 'downloaded' | 'implemented'
          created_at: string
        }
        Insert: {
          id?: string
          query_id: string
          user_id: string
          title: string
          meta_description?: string | null
          schema_markup?: string | null
          content_brief?: string | null
          faq_entries?: Json
          status?: 'generated' | 'downloaded' | 'implemented'
          created_at?: string
        }
        Update: {
          id?: string
          query_id?: string
          user_id?: string
          title?: string
          meta_description?: string | null
          schema_markup?: string | null
          content_brief?: string | null
          faq_entries?: Json
          status?: 'generated' | 'downloaded' | 'implemented'
          created_at?: string
        }
      }
      billing_events: {
        Row: {
          id: string
          user_id: string
          stripe_event_id: string
          event_type: string
          subscription_id: string | null
          customer_id: string | null
          amount: number | null
          currency: string | null
          status: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_event_id: string
          event_type: string
          subscription_id?: string | null
          customer_id?: string | null
          amount?: number | null
          currency?: string | null
          status: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_event_id?: string
          event_type?: string
          subscription_id?: string | null
          customer_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string
          metadata?: Json | null
          created_at?: string
        }
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