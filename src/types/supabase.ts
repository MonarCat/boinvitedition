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
      bookings: {
        Row: {
          id: string
          service_id: string
          service_name: string
          date: string
          time: string
          staff_id: string | null
          staff_name: string | null
          client_name: string
          client_email: string
          client_phone: string | null
          notes: string | null
          amount: number
          status: string
          payment_status: string | null
          business_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          service_id: string
          service_name: string
          date: string
          time: string
          staff_id?: string | null
          staff_name?: string | null
          client_name: string
          client_email: string
          client_phone?: string | null
          notes?: string | null
          amount: number
          status?: string
          payment_status?: string | null
          business_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          service_id?: string
          service_name?: string
          date?: string
          time?: string
          staff_id?: string | null
          staff_name?: string | null
          client_name?: string
          client_email?: string
          client_phone?: string | null
          notes?: string | null
          amount?: number
          status?: string
          payment_status?: string | null
          business_id?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "staff"
            referencedColumns: ["id"]
          }
        ]
      }
      businesses: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          cover_image_url: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          email: string | null
          website: string | null
          category: string | null
          business_hours: Json | null
          user_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          category?: string | null
          business_hours?: Json | null
          user_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          category?: string | null
          business_hours?: Json | null
          user_id?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          client_name: string
          rating: number
          comment: string | null
          business_id: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          client_name: string
          rating: number
          comment?: string | null
          business_id: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          client_name?: string
          rating?: number
          comment?: string | null
          business_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          duration: number
          price: number
          category: string | null
          image_url: string | null
          business_id: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration: number
          price: number
          category?: string | null
          image_url?: string | null
          business_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration?: number
          price?: number
          category?: string | null
          image_url?: string | null
          business_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      staff: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: string
          image_url: string | null
          bio: string | null
          services: string[] | null
          business_id: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          role: string
          image_url?: string | null
          bio?: string | null
          services?: string[] | null
          business_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: string
          image_url?: string | null
          bio?: string | null
          services?: string[] | null
          business_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
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
  }
}
