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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      commodities: {
        Row: {
          africa_share_pct: number | null
          african_export_value_usd: number | null
          categories: string[]
          created_at: string
          global_market_value_usd: number | null
          hs4_code: string | null
          id: string
          name: string
          notes: string | null
          rank: number | null
          reserves_label: string | null
          reserves_value_usd: number | null
          slug: string
          updated_at: string
          yoy_growth_pct: number | null
        }
        Insert: {
          africa_share_pct?: number | null
          african_export_value_usd?: number | null
          categories?: string[]
          created_at?: string
          global_market_value_usd?: number | null
          hs4_code?: string | null
          id?: string
          name: string
          notes?: string | null
          rank?: number | null
          reserves_label?: string | null
          reserves_value_usd?: number | null
          slug: string
          updated_at?: string
          yoy_growth_pct?: number | null
        }
        Update: {
          africa_share_pct?: number | null
          african_export_value_usd?: number | null
          categories?: string[]
          created_at?: string
          global_market_value_usd?: number | null
          hs4_code?: string | null
          id?: string
          name?: string
          notes?: string | null
          rank?: number | null
          reserves_label?: string | null
          reserves_value_usd?: number | null
          slug?: string
          updated_at?: string
          yoy_growth_pct?: number | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          adult_literacy_pct: number | null
          capital_city: string | null
          capital_population: number | null
          common_name: string
          created_at: string
          data_notes: string | null
          flag_emoji: string | null
          gdp_nominal_usd: number | null
          gdp_per_capita_usd: number | null
          headline_export_value_usd: number | null
          id: string
          iso2: string | null
          iso3: string | null
          largest_city: string | null
          largest_city_population: number | null
          latitude: number | null
          life_expectancy_years: number | null
          longitude: number | null
          map_zoom: number | null
          minimum_wage_monthly_usd: number | null
          official_name: string
          poverty_headcount_pct: number | null
          sex_ratio_males_per_female: number | null
          slug: string
          structural_parameter_label: string | null
          structural_parameter_value: string | null
          subdivision_count: number | null
          subdivision_designation: string | null
          subdivision_notes: string | null
          subregion: Database["public"]["Enums"]["africa_subregion"]
          tier: Database["public"]["Enums"]["country_tier"]
          tier_rationale: string | null
          total_population: number | null
          updated_at: string
          youth_under_30_pct: number | null
        }
        Insert: {
          adult_literacy_pct?: number | null
          capital_city?: string | null
          capital_population?: number | null
          common_name: string
          created_at?: string
          data_notes?: string | null
          flag_emoji?: string | null
          gdp_nominal_usd?: number | null
          gdp_per_capita_usd?: number | null
          headline_export_value_usd?: number | null
          id?: string
          iso2?: string | null
          iso3?: string | null
          largest_city?: string | null
          largest_city_population?: number | null
          latitude?: number | null
          life_expectancy_years?: number | null
          longitude?: number | null
          map_zoom?: number | null
          minimum_wage_monthly_usd?: number | null
          official_name: string
          poverty_headcount_pct?: number | null
          sex_ratio_males_per_female?: number | null
          slug: string
          structural_parameter_label?: string | null
          structural_parameter_value?: string | null
          subdivision_count?: number | null
          subdivision_designation?: string | null
          subdivision_notes?: string | null
          subregion: Database["public"]["Enums"]["africa_subregion"]
          tier?: Database["public"]["Enums"]["country_tier"]
          tier_rationale?: string | null
          total_population?: number | null
          updated_at?: string
          youth_under_30_pct?: number | null
        }
        Update: {
          adult_literacy_pct?: number | null
          capital_city?: string | null
          capital_population?: number | null
          common_name?: string
          created_at?: string
          data_notes?: string | null
          flag_emoji?: string | null
          gdp_nominal_usd?: number | null
          gdp_per_capita_usd?: number | null
          headline_export_value_usd?: number | null
          id?: string
          iso2?: string | null
          iso3?: string | null
          largest_city?: string | null
          largest_city_population?: number | null
          latitude?: number | null
          life_expectancy_years?: number | null
          longitude?: number | null
          map_zoom?: number | null
          minimum_wage_monthly_usd?: number | null
          official_name?: string
          poverty_headcount_pct?: number | null
          sex_ratio_males_per_female?: number | null
          slug?: string
          structural_parameter_label?: string | null
          structural_parameter_value?: string | null
          subdivision_count?: number | null
          subdivision_designation?: string | null
          subdivision_notes?: string | null
          subregion?: Database["public"]["Enums"]["africa_subregion"]
          tier?: Database["public"]["Enums"]["country_tier"]
          tier_rationale?: string | null
          total_population?: number | null
          updated_at?: string
          youth_under_30_pct?: number | null
        }
        Relationships: []
      }
      country_commodities: {
        Row: {
          commodity_id: string
          country_id: string
          exporter_rank: number | null
          id: string
          is_primary_export: boolean
          label_override: string | null
          primary_export_rank: number | null
        }
        Insert: {
          commodity_id: string
          country_id: string
          exporter_rank?: number | null
          id?: string
          is_primary_export?: boolean
          label_override?: string | null
          primary_export_rank?: number | null
        }
        Update: {
          commodity_id?: string
          country_id?: string
          exporter_rank?: number | null
          id?: string
          is_primary_export?: boolean
          label_override?: string | null
          primary_export_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "country_commodities_commodity_id_fkey"
            columns: ["commodity_id"]
            isOneToOne: false
            referencedRelation: "commodities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_commodities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      country_subnodes: {
        Row: {
          asset_code: string
          category: string
          country_id: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          rank: number | null
        }
        Insert: {
          asset_code: string
          category: string
          country_id: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          rank?: number | null
        }
        Update: {
          asset_code?: string
          category?: string
          country_id?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "country_subnodes_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
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
      africa_subregion:
        | "North Africa"
        | "West Africa"
        | "Central Africa"
        | "East Africa"
        | "Southern Africa"
      country_tier: "elite" | "standard" | "emerging"
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
      africa_subregion: [
        "North Africa",
        "West Africa",
        "Central Africa",
        "East Africa",
        "Southern Africa",
      ],
      country_tier: ["elite", "standard", "emerging"],
    },
  },
} as const
