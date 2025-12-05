"use client";

import { useState, useEffect, FormEvent } from "react";
import { Application, ApplicationInsert } from "@/lib/database.types";
import { applicationService, getStatusColor, getStatusLabel } from "@/lib/applicationService";

const ApplicationTracker = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<Application["status"] | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    company_name: "",
    position: "",
    salary: "",
    notes: "",
    career_page_url: "",
    status: "applied" as Application["status"],
    follow_up_date: "",
    contact_person: "",
  });

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!applicationService.isConfigured()) {
        setIsConfigured(false);
        setIsLoading(false);
        return;
      }
      
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (err instanceof Error && err.message.includes("Supabase is not configured")) {
        setIsConfigured(false);
      } else {
        setError("Failed to load applications. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const resetForm = () => {
    setFormData({
      company_name: "",
      position: "",
      salary: "",
      notes: "",
      career_page_url: "",
      status: "applied",
      follow_up_date: "",
      contact_person: "",
    });
    setEditingApp(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingApp) {
        await applicationService.update(editingApp.id, {
          company_name: formData.company_name,
          position: formData.position,
          status: formData.status,
          salary: formData.salary || null,
          notes: formData.notes || null,
          career_page_url: formData.career_page_url || null,
          follow_up_date: formData.follow_up_date || null,
          contact_person: formData.contact_person || null,
        });
      } else {
        const newApp: ApplicationInsert = {
          company_name: formData.company_name,
          position: formData.position,
          status: formData.status,
          salary: formData.salary || null,
          notes: formData.notes || null,
          career_page_url: formData.career_page_url || null,
          follow_up_date: formData.follow_up_date || null,
          contact_person: formData.contact_person || null,
        };
        await applicationService.create(newApp);
      }

      await fetchApplications();
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving application:", err);
      setError("Failed to save application. Please try again.");
    }
  };

  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setFormData({
      company_name: app.company_name,
      position: app.position,
      salary: app.salary || "",
      notes: app.notes || "",
      career_page_url: app.career_page_url || "",
      status: app.status,
      follow_up_date: app.follow_up_date || "",
      contact_person: app.contact_person || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      try {
        await applicationService.delete(id);
        await fetchApplications();
      } catch (err) {
        console.error("Error deleting application:", err);
        setError("Failed to delete application. Please try again.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const filteredApplications = filterStatus === "all"
    ? applications
    : applications.filter((app) => app.status === filterStatus);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    screening: applications.filter((a) => a.status === "screening").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // Show setup instructions if Supabase is not configured
  if (!isConfigured) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Supabase Setup Required</h2>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Add these environment variables to your <code className="px-1.5 py-0.5 bg-slate-100 rounded text-sm">.env.local</code> file:
        </p>
        <div className="bg-slate-900 rounded-xl p-4 text-left max-w-xl mx-auto overflow-x-auto">
          <pre className="text-sm text-slate-300 font-mono">
            <span className="text-slate-500"># Supabase</span>{"\n"}
            <span className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL</span>=<span className="text-amber-300">https://yxsvdiuwjjrfmzmlitfo.supabase.co</span>{"\n"}
            <span className="text-emerald-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=<span className="text-amber-300">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
          </pre>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Then restart your dev server with <code className="px-1.5 py-0.5 bg-slate-100 rounded">npm run dev</code>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-amber-200 rounded-full animate-spin border-t-amber-500" />
        <p className="mt-4 text-slate-500">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 rounded"
            aria-label="Dismiss error"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "bg-slate-100 text-slate-700" },
          { label: "Applied", value: stats.applied, color: "bg-blue-100 text-blue-700" },
          { label: "Screening", value: stats.screening, color: "bg-purple-100 text-purple-700" },
          { label: "Interview", value: stats.interview, color: "bg-amber-100 text-amber-700" },
          { label: "Offers", value: stats.offer, color: "bg-emerald-100 text-emerald-700" },
          { label: "Rejected", value: stats.rejected, color: "bg-red-100 text-red-700" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-xl p-4 text-center`}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                      ${filterStatus === "all"
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
            aria-label="Show all applications"
            tabIndex={0}
          >
            All
          </button>
          {(["applied", "screening", "interview", "offer", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                        ${filterStatus === status
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
              aria-label={`Show ${status} applications`}
              tabIndex={0}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="px-4 py-2 text-sm font-semibold text-white
                   bg-gradient-to-r from-amber-500 to-orange-500
                   rounded-lg shadow-lg shadow-amber-500/25
                   hover:from-amber-600 hover:to-orange-600
                   focus:outline-none focus:ring-4 focus:ring-amber-300
                   transition-all duration-200 flex items-center gap-2"
          aria-label="Add new application"
          tabIndex={0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Application
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                {editingApp ? "Edit Application" : "Add New Application"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., RBC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., Senior Front-End Developer"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Application["status"] })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., $110K-$140K"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g., Jane Smith (Recruiter)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Career Page URL
                </label>
                <input
                  type="url"
                  value={formData.career_page_url}
                  onChange={(e) => setFormData({ ...formData, career_page_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="Any notes about this application..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100
                           rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white
                           bg-gradient-to-r from-amber-500 to-orange-500
                           rounded-lg hover:from-amber-600 hover:to-orange-600
                           transition-colors"
                >
                  {editingApp ? "Save Changes" : "Add Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No applications yet</h3>
          <p className="text-sm text-slate-400">
            Start tracking your job applications by clicking "Add Application"
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-slate-800">{app.company_name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    {app.salary && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {app.salary}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{app.position}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Applied: {app.date_applied}</span>
                    {app.follow_up_date && (
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Follow-up: {app.follow_up_date}
                      </span>
                    )}
                    {app.contact_person && (
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {app.contact_person}
                      </span>
                    )}
                  </div>
                  {app.notes && (
                    <p className="text-xs text-slate-500 mt-2 italic">"{app.notes}"</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {app.career_page_url && (
                    <a
                      href={app.career_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label="Visit career page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(app)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleEdit(app))}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    aria-label="Edit application"
                    tabIndex={0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleDelete(app.id))}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete application"
                    tabIndex={0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync indicator */}
      <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Data synced with Supabase
      </div>
    </div>
  );
};

export default ApplicationTracker;
