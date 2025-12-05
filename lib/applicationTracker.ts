export interface Application {
  id: string;
  companyName: string;
  position: string;
  dateApplied: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
  salary?: string;
  notes?: string;
  careerPageUrl?: string;
  followUpDate?: string;
  contactPerson?: string;
  interviewDates?: string[];
}

const STORAGE_KEY = "resume_tailor_applications";

export const getApplications = (): Application[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveApplication = (application: Application): void => {
  const applications = getApplications();
  const existingIndex = applications.findIndex((a) => a.id === application.id);
  
  if (existingIndex >= 0) {
    applications[existingIndex] = application;
  } else {
    applications.unshift(application);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

export const deleteApplication = (id: string): void => {
  const applications = getApplications().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

export const generateId = (): string => {
  return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

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

