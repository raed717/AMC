"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Pill,
  Printer,
  Shield,
  Stethoscope,
  User,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/utils/trpc";
import {
  DOCUMENT_REQUEST_STATUS_LABELS,
  DEFAULT_DOCUMENT_TYPE,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
} from "@AMC/db/document-types";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const documentTypeOptions = DOCUMENT_TYPES.map((value) => ({
  value,
  label: DOCUMENT_TYPE_LABELS[value],
}));

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateSize);

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentType>(DEFAULT_DOCUMENT_TYPE);
  const [files, setFiles] = useState<any[]>([]);
  const queryClient = useQueryClient();

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
  const documentRequestsQueryOptions = trpc.patient.getMyDocumentRequests.queryOptions();
  const { data: documentRequests, isLoading: loadingDocumentRequests } = useQuery(
    documentRequestsQueryOptions,
  );
  const { data: visits, isLoading: loadingVisits } = useQuery(
    trpc.patient.getMyVisits.queryOptions(),
  );

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
  const groupedRecords = useMemo(() => {
    const base = Object.fromEntries(
      documentTypeOptions.map((option) => [option.value, [] as NonNullable<typeof records>[number][]]),
    ) as Record<DocumentType, NonNullable<typeof records>[number][]>;

    for (const record of records ?? []) {
      const key = (record.documentType || DEFAULT_DOCUMENT_TYPE) as DocumentType;
      base[key].push(record);
    }

    return documentTypeOptions
      .map((option) => ({
        ...option,
        records: base[option.value],
      }))
      .filter((group) => group.records.length > 0);
  }, [records]);

  const openUploadForRequest = (requestId: string, documentType: DocumentType) => {
    setSelectedRequestId(requestId);
    setSelectedDocumentType(documentType);
    setFiles([]);
    setShowUploadDialog(true);
  };

  if (!session) return null;

  const user = session.user;
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "N/A";

  const handleDownloadPrescription = () => {
    if (!patient) return;

    const doc = new jsPDF();
    const activeMedications = medications?.filter((med) => med.isActive) || [];
    const doctor = visits?.find((visit) => visit.doctor)?.doctor;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text("AMC", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Medical Prescription", 14, 26);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(patient.name, 196, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (doctor?.name) {
      doc.text(`Dr. ${doctor.name}`, 196, 26, { align: "right" });
    }
    if (doctor?.specialization) {
      doc.text(doctor.specialization, 196, 32, { align: "right" });
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information:", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${patient.name}`, 14, 56);
    doc.text(`Age/Birthday: ${patient.birthday || "N/A"}`, 14, 62);
    doc.text(`Gender: ${patient.gender || "N/A"}`, 14, 68);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 196, 56, { align: "right" });

    if (activeMedications.length > 0) {
      autoTable(doc, {
        startY: 80,
        head: [["Medication", "Dosage", "Frequency", "Instructions"]],
        body: activeMedications.map((med) => [
          med.name,
          med.dosage || "-",
          formatFrequency(med.frequency),
          [
            med.morningDose ? `Morning: ${med.morningDose}` : "",
            med.nightDose ? `Night: ${med.nightDose}` : "",
            med.notes || "",
          ]
            .filter(Boolean)
            .join("\n") || "-",
        ]),
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10, cellPadding: 4 },
      });
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.text("No active medications prescribed.", 14, 90);
    }

    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "This is a computer-generated document. No signature is required.",
        105,
        285,
        { align: "center" },
      );
    }

    doc.save(
      `Prescription_${patient.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

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
                <CardHeader className="flex flex-row items-center justify-between gap-3">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPrescription}
                    className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
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
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    Requested Documents
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    >
                      {documentRequests?.length || 0} requests
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDocumentRequests ? (
                    <div className="space-y-3">
                      {[1, 2].map((item) => (
                        <div key={item} className="h-20 rounded-lg bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : documentRequests && documentRequests.length > 0 ? (
                    <div className="space-y-3">
                      {documentRequests.map((request) => (
                        <div
                          key={request.id}
                          className="rounded-2xl border border-border bg-muted/40 p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">
                                  {DOCUMENT_TYPE_LABELS[
                                    (request.documentType || DEFAULT_DOCUMENT_TYPE) as DocumentType
                                  ]}
                                </p>
                                <Badge
                                  variant={request.status === "fulfilled" ? "default" : "outline"}
                                  className={
                                    request.status === "fulfilled"
                                      ? "bg-emerald-600 text-white"
                                      : request.status === "cancelled"
                                        ? "border-red-300 text-red-600"
                                        : "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300"
                                  }
                                >
                                  {DOCUMENT_REQUEST_STATUS_LABELS[
                                    request.status as keyof typeof DOCUMENT_REQUEST_STATUS_LABELS
                                  ]}
                                </Badge>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>Dr. {request.doctor?.name || "Unknown"}</span>
                                <span>•</span>
                                <span>{formatDate(request.createdAt)}</span>
                              </div>
                              {request.note && (
                                <p className="mt-3 text-sm text-foreground">{request.note}</p>
                              )}
                            </div>
                            {request.status === "pending" && (
                              <Button
                                type="button"
                                onClick={() =>
                                  openUploadForRequest(
                                    request.id,
                                    (request.documentType || DEFAULT_DOCUMENT_TYPE) as DocumentType,
                                  )
                                }
                                className="bg-emerald-600 text-white hover:bg-emerald-500"
                              >
                                Upload Document
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-muted-foreground">
                      <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p>No document requests</p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
                  ) : groupedRecords.length > 0 ? (
                    <div className="space-y-3">
                      {groupedRecords.map((group) => (
                        <details
                          key={group.value}
                          open
                          className="group overflow-hidden rounded-2xl border border-border bg-muted/30"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">{group.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  {group.records.length} file{group.records.length > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="space-y-3 border-t border-border/70 p-3">
                            {group.records.map((record) => (
                              <div
                                key={record.id}
                                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="font-medium text-foreground">{record.originalName}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span>{(record.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <span>•</span>
                                    <span>{formatDate(record.createdAt)}</span>
                                    <span>•</span>
                                    <span>Dr. {record.doctor?.name || "Unknown"}</span>
                                    {record.uploader?.role === "patient" && (
                                      <>
                                        <span>•</span>
                                        <span>Uploaded by you</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="border-emerald-300 bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                                  >
                                    {DOCUMENT_TYPE_LABELS[
                                      (record.documentType || DEFAULT_DOCUMENT_TYPE) as DocumentType
                                    ]}
                                  </Badge>
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
                              </div>
                            ))}
                          </div>
                        </details>
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

              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Requested Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Document Type</label>
                      <Input
                        value={DOCUMENT_TYPE_LABELS[selectedDocumentType]}
                        readOnly
                        className="mt-2 bg-muted border-border text-card-foreground"
                      />
                    </div>
                    <FilePond
                      files={files}
                      onupdatefiles={setFiles}
                      allowMultiple={false}
                      maxFileSize="10MB"
                      server={{
                        process: {
                          url: "/api/records/upload",
                          method: "POST",
                          ondata: (formData) => {
                            formData.append("patientId", user.id);
                            formData.append("documentType", selectedDocumentType);
                            if (selectedRequestId) {
                              formData.append("requestId", selectedRequestId);
                            }
                            return formData;
                          },
                          onload: (res) => {
                            setShowUploadDialog(false);
                            setFiles([]);
                            setSelectedRequestId(null);
                            queryClient.invalidateQueries({
                              queryKey: trpc.patient.getMyRecords.queryOptions().queryKey,
                            });
                            queryClient.invalidateQueries({
                              queryKey: documentRequestsQueryOptions.queryKey,
                            });
                            return res;
                          },
                          onerror: (err) => err,
                        },
                      }}
                      name="file"
                      labelIdle='Drag & Drop your requested file or <span class="filepond--label-action">Browse</span>'
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
