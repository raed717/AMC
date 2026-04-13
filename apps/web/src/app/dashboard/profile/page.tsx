"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Calendar,
  Download,
  FileText,
  Pill,
  Shield,
  Stethoscope,
  User,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";

type SectionId = "personal" | "health" | "documents";

const sections: Array<{
  id: SectionId;
  label: string;
  icon: typeof User;
  description: string;
}> = [
  {
    id: "personal",
    label: "Personal Info",
    icon: User,
    description: "Identity and account details",
  },
  {
    id: "health",
    label: "Health Summary",
    icon: Activity,
    description: "Diseases, medications, and visits",
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    description: "Uploaded records and files",
  },
];

const formatDate = (value: Date | string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatFrequency = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const isFutureVisit = (value: Date | string | null) => {
  if (!value) return false;
  return new Date(value).getTime() > Date.now();
};

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [activeSection, setActiveSection] = useState<SectionId>("personal");

  const patientQueryOptions = trpc.patient.getPatient.queryOptions({
    patientId: session?.user.id ?? "",
  });

  const { data: patient } = useQuery({
    ...patientQueryOptions,
    enabled: Boolean(session?.user.id),
  });

  const { data: medications, isLoading: loadingMedications } = useQuery(
    trpc.patient.getMyMedications.queryOptions(),
  );
  const { data: records, isLoading: loadingRecords } = useQuery(
    trpc.patient.getMyRecords.queryOptions(),
  );
  const { data: visits, isLoading: loadingVisits } = useQuery(
    trpc.patient.getMyVisits.queryOptions(),
  );

  if (!session) return null;

  const user = session.user;
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "N/A";

  const stats = useMemo(
    () => ({
      activeMeds: medications?.filter((med) => med.isActive).length ?? 0,
      visits: visits?.length ?? 0,
      records: records?.length ?? 0,
      diseases: patient?.chronicDiseases?.length ?? 0,
    }),
    [medications, patient?.chronicDiseases, records, visits],
  );

  const activeSectionMeta = sections.find((section) => section.id === activeSection)!;

  return (
    <div className="space-y-6">
      <style jsx>{`
        .profile-panel-enter {
          animation: profilePanelEnter 280ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes profilePanelEnter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">Patient Profile</h1>
        <p className="text-muted-foreground">
          A cleaner view of your personal health summary and documents.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden border-border bg-card shadow-[0_24px_80px_-40px_rgba(16,185,129,0.35)]">
            <div className="border-b border-emerald-200/60 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.9))] px-6 py-6 dark:border-emerald-900/40 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_42%),linear-gradient(135deg,rgba(2,6,23,0.94),rgba(6,78,59,0.3))]">
              <div className="flex items-start gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-16 w-16 rounded-2xl border border-emerald-300/60 object-cover shadow-sm dark:border-emerald-800/60"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/60 bg-emerald-500/10 text-emerald-700 dark:border-emerald-800/60 dark:text-emerald-300">
                    <User className="h-7 w-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-700/80 dark:text-emerald-300/80">
                    Patient Portal
                  </p>
                  <h2 className="truncate text-2xl font-semibold text-card-foreground">
                    {user.name}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      Patient
                    </Badge>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                      {stats.activeMeds} active meds
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/80 bg-background/70 p-3 dark:bg-background/40">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visits</p>
                  <p className="mt-1 text-2xl font-semibold text-card-foreground">{stats.visits}</p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background/70 p-3 dark:bg-background/40">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Records</p>
                  <p className="mt-1 text-2xl font-semibold text-card-foreground">{stats.records}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = section.id === activeSection;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`group rounded-2xl border px-4 py-4 text-left transition-all ${
                        isActive
                          ? "border-emerald-300 bg-emerald-500/10 shadow-[0_14px_30px_-20px_rgba(16,185,129,0.7)] dark:border-emerald-800"
                          : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-xl p-2 ${
                            isActive
                              ? "bg-emerald-600 text-white"
                              : "bg-background text-emerald-600 dark:bg-background/70 dark:text-emerald-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{section.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </aside>

        <section key={activeSection} className="profile-panel-enter space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border/70 pb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
                  <activeSectionMeta.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-card-foreground">
                    {activeSectionMeta.label}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeSectionMeta.description}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {activeSection === "personal" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <User className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-lg text-card-foreground">Identity</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Full name</p>
                    <p className="mt-1 text-base font-medium text-foreground">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="mt-1 text-base font-medium text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Birthday</p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {patient?.birthday || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="mt-1 text-base font-medium capitalize text-foreground">
                      {patient?.gender || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {patient?.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient ID</p>
                    <p className="mt-1 break-all font-mono text-sm text-foreground">{user.id}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-lg text-card-foreground">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="mt-1 text-base font-medium text-foreground">Patient</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email verified</p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.emailVerified ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account created</p>
                    <p className="mt-1 text-base font-medium text-foreground">{createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile image</p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.image ? "Uploaded" : "Not uploaded"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "health" && (
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    Chronic Diseases
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    >
                      {stats.diseases} listed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient?.chronicDiseases?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.chronicDiseases.map((disease) => (
                        <Badge
                          key={disease}
                          variant="outline"
                          className="border-emerald-300 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                        >
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No chronic diseases recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                    <Pill className="h-5 w-5 text-emerald-500" />
                    Medications
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    >
                      {stats.activeMeds} active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingMedications ? (
                    <div className="space-y-3">
                      {[1, 2].map((item) => (
                        <div key={item} className="h-16 rounded-lg bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : medications && medications.length > 0 ? (
                    <div className="space-y-3">
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="rounded-2xl border border-border bg-muted/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-foreground">{med.name}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                {med.dosage && <span>{med.dosage}</span>}
                                <span>{formatFrequency(med.frequency)}</span>
                              </div>
                              {(med.morningDose || med.nightDose || med.notes) && (
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  {med.morningDose && <p>Morning: {med.morningDose}</p>}
                                  {med.nightDose && <p>Night: {med.nightDose}</p>}
                                  {med.notes && <p>Notes: {med.notes}</p>}
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={med.isActive ? "default" : "secondary"}
                              className={med.isActive ? "bg-emerald-600 text-white" : ""}
                            >
                              {med.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Pill className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No medications available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                    <Stethoscope className="h-5 w-5 text-emerald-500" />
                    Medical Visits
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    >
                      {stats.visits} visits
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingVisits ? (
                    <div className="space-y-3">
                      {[1, 2].map((item) => (
                        <div key={item} className="h-24 rounded-lg bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : visits && visits.length > 0 ? (
                    <div className="space-y-3">
                      {visits.map((visit) => (
                        <div
                          key={visit.id}
                          className="rounded-2xl border border-border bg-muted/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatDate(visit.visitDate)}</span>
                                <span>•</span>
                                <span>Dr. {visit.doctor?.name || "Unknown"}</span>
                                {visit.doctor?.specialization && (
                                  <>
                                    <span>•</span>
                                    <span>{visit.doctor.specialization}</span>
                                  </>
                                )}
                              </div>
                              {visit.diagnosis && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                                  <p className="font-medium text-foreground">{visit.diagnosis}</p>
                                </div>
                              )}
                              {visit.notes && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Notes</p>
                                  <p className="text-foreground">{visit.notes}</p>
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={isFutureVisit(visit.visitDate) ? "default" : "outline"}
                              className={
                                isFutureVisit(visit.visitDate)
                                  ? "bg-emerald-600 text-white"
                                  : "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                              }
                            >
                              {isFutureVisit(visit.visitDate)
                                ? "Coming Appointment"
                                : "Visit"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Stethoscope className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No medical visits available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "documents" && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  Records & Documents
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  >
                    {stats.records} files
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecords ? (
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="h-16 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : records && records.length > 0 ? (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/60 p-4"
                      >
                        <div>
                          <p className="font-medium text-foreground">{record.originalName}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{(record.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>{formatDate(record.createdAt)}</span>
                            <span>•</span>
                            <span>Dr. {record.doctor?.name || "Unknown"}</span>
                          </div>
                        </div>
                        <a
                          href={`/uploads/${record.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={record.originalName}
                          className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No records uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
