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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_alerts: {
        Row: {
          alert_type: string
          business_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
        }
        Insert: {
          alert_type: string
          business_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
        }
        Update: {
          alert_type?: string
          business_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_alerts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          attempt_type: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          attempt_type?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      blocked_time_slots: {
        Row: {
          blocked_date: string
          blocked_time: string
          business_id: string
          created_at: string | null
          id: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          blocked_date: string
          blocked_time: string
          business_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          blocked_date?: string
          blocked_time?: string
          business_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_time_slots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          auto_payment_required: boolean | null
          booking_date: string
          booking_time: string
          business_id: string
          client_id: string
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          duration_minutes: number
          id: string
          invoice_generated: boolean | null
          notes: string | null
          original_booking_date: string | null
          original_booking_time: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          reminder_sent_at: string | null
          reschedule_count: number | null
          reschedule_deadline: string | null
          service_id: string
          staff_id: string | null
          status: string
          ticket_code: string | null
          ticket_number: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          auto_payment_required?: boolean | null
          booking_date: string
          booking_time: string
          business_id: string
          client_id: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_minutes: number
          id?: string
          invoice_generated?: boolean | null
          notes?: string | null
          original_booking_date?: string | null
          original_booking_time?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          reminder_sent_at?: string | null
          reschedule_count?: number | null
          reschedule_deadline?: string | null
          service_id: string
          staff_id?: string | null
          status?: string
          ticket_code?: string | null
          ticket_number?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          auto_payment_required?: boolean | null
          booking_date?: string
          booking_time?: string
          business_id?: string
          client_id?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_minutes?: number
          id?: string
          invoice_generated?: boolean | null
          notes?: string | null
          original_booking_date?: string | null
          original_booking_time?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          reminder_sent_at?: string | null
          reschedule_count?: number | null
          reschedule_deadline?: string | null
          service_id?: string
          staff_id?: string | null
          status?: string
          ticket_code?: string | null
          ticket_number?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      business_payment_configs: {
        Row: {
          business_id: string
          config_data: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          payment_type: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          config_data?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          payment_type: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          config_data?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          payment_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_payment_configs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_payment_settings: {
        Row: {
          business_id: string
          created_at: string
          id: string
          payment_methods: Json | null
          paystack_public_key: string | null
          require_payment: boolean
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          payment_methods?: Json | null
          paystack_public_key?: string | null
          require_payment?: boolean
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          payment_methods?: Json | null
          paystack_public_key?: string | null
          require_payment?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_payment_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_payouts: {
        Row: {
          account_holder_name: string | null
          airtel_number: string | null
          auto_split_enabled: boolean | null
          bank_account_number: string | null
          bank_name: string | null
          business_id: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          mpesa_number: string | null
          paystack_subaccount_code: string | null
          split_percentage: number | null
          updated_at: string | null
          verification_code: string | null
          verification_expires_at: string | null
        }
        Insert: {
          account_holder_name?: string | null
          airtel_number?: string | null
          auto_split_enabled?: boolean | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          mpesa_number?: string | null
          paystack_subaccount_code?: string | null
          split_percentage?: number | null
          updated_at?: string | null
          verification_code?: string | null
          verification_expires_at?: string | null
        }
        Update: {
          account_holder_name?: string | null
          airtel_number?: string | null
          auto_split_enabled?: boolean | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          mpesa_number?: string | null
          paystack_subaccount_code?: string | null
          split_percentage?: number | null
          updated_at?: string | null
          verification_code?: string | null
          verification_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_payouts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          booking_id: string
          business_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
        }
        Insert: {
          booking_id: string
          business_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
        }
        Update: {
          booking_id?: string
          business_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          auto_confirm_bookings: boolean | null
          booking_advance_days: number | null
          booking_buffer_minutes: number | null
          booking_slot_duration_minutes: number | null
          business_id: string
          contact_preferences: Json | null
          created_at: string | null
          currency: string | null
          custom_domain: string | null
          default_tax_rate: number | null
          enable_bank_transfer: boolean | null
          enable_card_payments: boolean | null
          enable_mpesa: boolean | null
          id: string
          map_description: string | null
          max_bookings_per_slot: number | null
          notification_preferences: Json | null
          operating_hours_end: string | null
          operating_hours_start: string | null
          payment_instructions: string | null
          reminder_hours_before: number | null
          require_payment: boolean | null
          send_reminders: boolean | null
          show_on_map: boolean | null
          subdomain_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          auto_confirm_bookings?: boolean | null
          booking_advance_days?: number | null
          booking_buffer_minutes?: number | null
          booking_slot_duration_minutes?: number | null
          business_id: string
          contact_preferences?: Json | null
          created_at?: string | null
          currency?: string | null
          custom_domain?: string | null
          default_tax_rate?: number | null
          enable_bank_transfer?: boolean | null
          enable_card_payments?: boolean | null
          enable_mpesa?: boolean | null
          id?: string
          map_description?: string | null
          max_bookings_per_slot?: number | null
          notification_preferences?: Json | null
          operating_hours_end?: string | null
          operating_hours_start?: string | null
          payment_instructions?: string | null
          reminder_hours_before?: number | null
          require_payment?: boolean | null
          send_reminders?: boolean | null
          show_on_map?: boolean | null
          subdomain_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_confirm_bookings?: boolean | null
          booking_advance_days?: number | null
          booking_buffer_minutes?: number | null
          booking_slot_duration_minutes?: number | null
          business_id?: string
          contact_preferences?: Json | null
          created_at?: string | null
          currency?: string | null
          custom_domain?: string | null
          default_tax_rate?: number | null
          enable_bank_transfer?: boolean | null
          enable_card_payments?: boolean | null
          enable_mpesa?: boolean | null
          id?: string
          map_description?: string | null
          max_bookings_per_slot?: number | null
          notification_preferences?: Json | null
          operating_hours_end?: string | null
          operating_hours_start?: string | null
          payment_instructions?: string | null
          reminder_hours_before?: number | null
          require_payment?: boolean | null
          send_reminders?: boolean | null
          show_on_map?: boolean | null
          subdomain_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          average_rating: number | null
          bank_account: string | null
          bank_name: string | null
          business_hours: Json | null
          city: string | null
          company_size: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          email: string | null
          featured_image_url: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          mpesa_number: string | null
          name: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          payment_instructions: string | null
          payment_setup_complete: boolean | null
          paystack_subaccount_id: string | null
          phone: string | null
          preferred_payment_methods: string[] | null
          primary_use_cases: string[] | null
          search_vector: unknown
          service_radius_km: number | null
          subdomain: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          bank_account?: string | null
          bank_name?: string | null
          business_hours?: Json | null
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          email?: string | null
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          mpesa_number?: string | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          payment_instructions?: string | null
          payment_setup_complete?: boolean | null
          paystack_subaccount_id?: string | null
          phone?: string | null
          preferred_payment_methods?: string[] | null
          primary_use_cases?: string[] | null
          search_vector?: unknown
          service_radius_km?: number | null
          subdomain?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          bank_account?: string | null
          bank_name?: string | null
          business_hours?: Json | null
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          email?: string | null
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          mpesa_number?: string | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          payment_instructions?: string | null
          payment_setup_complete?: boolean | null
          paystack_subaccount_id?: string | null
          phone?: string | null
          preferred_payment_methods?: string[] | null
          primary_use_cases?: string[] | null
          search_vector?: unknown
          service_radius_km?: number | null
          subdomain?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      client_business_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          business_amount: number
          business_id: string | null
          client_email: string
          client_phone: string | null
          created_at: string | null
          dispute_reason: string | null
          dispute_status: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payout_reference: string | null
          payout_status: string | null
          paystack_reference: string | null
          platform_fee: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          business_amount: number
          business_id?: string | null
          client_email: string
          client_phone?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          dispute_status?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          paystack_reference?: string | null
          platform_fee: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          business_amount?: number
          business_id?: string | null
          client_email?: string
          client_phone?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          dispute_status?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          paystack_reference?: string | null
          platform_fee?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_business_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_business_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          business_id: string
          created_at: string | null
          email: string
          id: string
          last_service_date: string | null
          name: string
          notes: string | null
          phone: string | null
          retain_data: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string | null
          email: string
          id?: string
          last_service_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          retain_data?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string | null
          email?: string
          id?: string
          last_service_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          retain_data?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          service_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          service_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          service_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          booking_id: string | null
          business_id: string
          client_id: string
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          business_id: string
          client_id: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          business_id?: string
          client_id?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          booking_id: string | null
          business_id: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          notification_type: string
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          booking_id?: string | null
          business_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          notification_type: string
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          booking_id?: string | null
          business_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          business_id: string
          created_at: string
          details: string
          display_name: string | null
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          details: string
          display_name?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          details?: string
          display_name?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          business_amount: number | null
          business_id: string | null
          business_received_amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          paystack_reference: string | null
          platform_amount: number | null
          platform_fee_amount: number | null
          split_amount: number | null
          split_config: Json | null
          status: string | null
          subscription_id: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          business_amount?: number | null
          business_id?: string | null
          business_received_amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          paystack_reference?: string | null
          platform_amount?: number | null
          platform_fee_amount?: number | null
          split_amount?: number | null
          split_config?: Json | null
          status?: string | null
          subscription_id?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          business_amount?: number | null
          business_id?: string | null
          business_received_amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          paystack_reference?: string | null
          platform_amount?: number | null
          platform_fee_amount?: number | null
          split_amount?: number | null
          split_config?: Json | null
          status?: string | null
          subscription_id?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          business_id: string
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          is_transport_service: boolean | null
          name: string
          price: number
          service_images: string[] | null
          transport_details: Json | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          is_transport_service?: boolean | null
          name: string
          price: number
          service_images?: string[] | null
          transport_details?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_transport_service?: boolean | null
          name?: string
          price?: number
          service_images?: string[] | null
          transport_details?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          avatar_url: string | null
          business_id: string
          created_at: string | null
          email: string
          gender: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          shift: string | null
          specialties: string[] | null
          updated_at: string | null
          workload: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_id: string
          created_at?: string | null
          email: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          shift?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          workload?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_id?: string
          created_at?: string | null
          email?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          shift?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          workload?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_attendance: {
        Row: {
          attendance_date: string
          business_id: string
          created_at: string
          geolocation: Json | null
          id: string
          ip_address: string | null
          location_info: Json | null
          notes: string | null
          sign_in_time: string
          sign_out_time: string | null
          staff_id: string
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          attendance_date?: string
          business_id: string
          created_at?: string
          geolocation?: Json | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          notes?: string | null
          sign_in_time?: string
          sign_out_time?: string | null
          staff_id: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          attendance_date?: string
          business_id?: string
          created_at?: string
          geolocation?: Json | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          notes?: string | null
          sign_in_time?: string
          sign_out_time?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_discounts: {
        Row: {
          created_at: string | null
          discount_percentage: number
          id: string
          payment_interval: string
        }
        Insert: {
          created_at?: string | null
          discount_percentage?: number
          id?: string
          payment_interval: string
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number
          id?: string
          payment_interval?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_split_enabled: boolean | null
          bookings_limit: number | null
          business_id: string | null
          commission_rate: number | null
          created_at: string
          current_period_end: string
          feature_flags: Json | null
          id: string
          notification_channels: Json | null
          payment_interval: string | null
          paystack_reference: string | null
          paystack_subaccount_id: string | null
          plan_type: string
          split_percentage: number | null
          staff_limit: number | null
          status: string
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_split_enabled?: boolean | null
          bookings_limit?: number | null
          business_id?: string | null
          commission_rate?: number | null
          created_at?: string
          current_period_end: string
          feature_flags?: Json | null
          id?: string
          notification_channels?: Json | null
          payment_interval?: string | null
          paystack_reference?: string | null
          paystack_subaccount_id?: string | null
          plan_type: string
          split_percentage?: number | null
          staff_limit?: number | null
          status?: string
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_split_enabled?: boolean | null
          bookings_limit?: number | null
          business_id?: string | null
          commission_rate?: number | null
          created_at?: string
          current_period_end?: string
          feature_flags?: Json | null
          id?: string
          notification_channels?: Json | null
          payment_interval?: string | null
          paystack_reference?: string | null
          paystack_subaccount_id?: string | null
          plan_type?: string
          split_percentage?: number | null
          staff_limit?: number | null
          status?: string
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      assign_admin_role: { Args: { _user_email: string }; Returns: undefined }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_reschedule_deadline: {
        Args: { booking_date: string; booking_time: string }
        Returns: string
      }
      check_rate_limit: {
        Args: {
          p_attempt_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      create_paid_subscription: {
        Args: {
          business_id: string
          paystack_reference?: string
          plan_type: string
        }
        Returns: string
      }
      generate_ticket_code: { Args: never; Returns: string }
      get_admin_stats: { Args: never; Returns: Json }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_business_owner: { Args: { _business_id: string }; Returns: boolean }
      is_user_admin: { Args: { user_id: string }; Returns: boolean }
      log_security_event: {
        Args: { p_description: string; p_event_type: string; p_metadata?: Json }
        Returns: string
      }
      log_security_event_enhanced: {
        Args: {
          p_description: string
          p_event_type: string
          p_metadata?: Json
          p_severity?: string
        }
        Returns: string
      }
      safe_rate_limit_check: {
        Args: {
          p_attempt_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      search_businesses_by_location: {
        Args: {
          search_lat: number
          search_lng: number
          search_query?: string
          search_radius_km?: number
        }
        Returns: {
          address: string
          average_rating: number
          business_hours: Json
          city: string
          country: string
          currency: string
          description: string
          distance_km: number
          email: string
          featured_image_url: string
          id: string
          is_verified: boolean
          latitude: number
          logo_url: string
          longitude: number
          map_description: string
          name: string
          phone: string
          service_categories: string[]
          service_names: string[]
          service_radius_km: number
          show_on_map: boolean
          total_reviews: number
          total_services: number
          website: string
        }[]
      }
      secure_assign_admin_role: {
        Args: { _admin_user_id?: string; _target_user_email: string }
        Returns: Json
      }
      secure_validate_business_ownership: {
        Args: { p_business_id: string; p_user_id?: string }
        Returns: boolean
      }
      validate_business_access: {
        Args: { p_business_id: string; p_user_id?: string }
        Returns: boolean
      }
      validate_business_ownership: {
        Args: { business_id: string }
        Returns: boolean
      }
      validate_payment_amount: {
        Args: { p_amount: number; p_business_id: string }
        Returns: boolean
      }
      validate_payment_security: {
        Args: { _amount: number; _business_id: string; _metadata?: Json }
        Returns: Json
      }
      validate_payment_security_enhanced: {
        Args: {
          p_amount: number
          p_business_id: string
          p_payment_method?: string
        }
        Returns: Json
      }
      validate_webhook_security: {
        Args: {
          p_payload: string
          p_secret: string
          p_signature: string
          p_timestamp?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      subscription_plan_type:
        | "trial"
        | "starter"
        | "medium"
        | "premium"
        | "payasyougo"
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
      app_role: ["admin", "moderator", "user"],
      subscription_plan_type: [
        "trial",
        "starter",
        "medium",
        "premium",
        "payasyougo",
      ],
    },
  },
} as const
