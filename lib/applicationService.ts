import { supabase, isSupabaseConfigured } from "./supabase";
import { Application, ApplicationInsert, ApplicationUpdate } from "./database.types";

export const getStatusColor = (status: Application["status"]): string => {
  const colors: Record<Application["status"], string> = {
    applied: "bg-blue-100 text-blue-700 border-blue-200",
    screening: "bg-purple-100 text-purple-700 border-purple-200",
    interview: "bg-amber-100 text-amber-700 border-amber-200",
    offer: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    withdrawn: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return colors[status];
};

export const getStatusLabel = (status: Application["status"]): string => {
  const labels: Record<Application["status"], string> = {
    applied: "Applied",
    screening: "Screening",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };
  return labels[status];
};

const checkSupabaseConfig = () => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
    );
  }
  return supabase;
};

export const applicationService = {
  isConfigured: isSupabaseConfigured,

  async getAll(): Promise<Application[]> {
    const client = checkSupabaseConfig();
    
    const { data, error } = await client
      .from("applications")
      .select("*")
      .order("date_applied", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<Application | null> {
    const client = checkSupabaseConfig();
    
    const { data, error } = await client
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching application:", error);
      throw error;
    }

    return data;
  },

  async create(application: ApplicationInsert): Promise<Application> {
    const client = checkSupabaseConfig();
    
    const { data, error } = await client
      .from("applications")
      .insert(application)
      .select()
      .single();

    if (error) {
      console.error("Error creating application:", error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: ApplicationUpdate): Promise<Application> {
    const client = checkSupabaseConfig();
    
    const { data, error } = await client
      .from("applications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating application:", error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const client = checkSupabaseConfig();
    
    const { error } = await client
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  },

  async getStats(): Promise<{
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    rejected: number;
  }> {
    const client = checkSupabaseConfig();
    
    const { data, error } = await client
      .from("applications")
      .select("status");

    if (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    data?.forEach((app) => {
      if (app.status in stats) {
        stats[app.status as keyof typeof stats]++;
      }
    });

    return stats;
  },
};
