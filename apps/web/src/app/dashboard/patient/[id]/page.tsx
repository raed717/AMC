"use client";

import { use, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/utils/trpc";
import { toast } from "sonner";
import { FileText, Download, Trash2, User, Calendar, Pill, Stethoscope, AlertCircle, X, Activity, Edit3, CheckSquare, Printer, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DEFAULT_DOCUMENT_TYPE,
  DOCUMENT_TYPES,
  DOCUMENT_REQUEST_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
} from "@AMC/db/document-types";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateSize);

const FREQUENCIES = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "four_times_daily", label: "Four times daily" },
  { value: "as_needed", label: "As needed" },
];

const COMMON_DISEASES = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "COPD",
  "Chronic Kidney Disease",
  "Arthritis",
  "Cancer",
  "Depression",
  "Alzheimer's",
  "Osteoporosis",
];

const getDefaultVisitDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const documentTypeOptions = DOCUMENT_TYPES.map((value) => ({
  value,
  label: DOCUMENT_TYPE_LABELS[value],
}));

export default function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const patientId = decodeURIComponent(id);
  const queryClient = useQueryClient();

  const patientQueryOptions = trpc.patient.getPatient.queryOptions({
    patientId,
  });
  const visitsQueryOptions = trpc.patient.getPatientVisits.queryOptions({
    patientId,
  });
  const medicationsQueryOptions =
    trpc.patient.getPatientMedications.queryOptions({ patientId });

  const { data: patient, isLoading: loadingPatient } =
    useQuery(patientQueryOptions);
  const { data: visits, isLoading: loadingVisits } =
    useQuery(visitsQueryOptions);
  const { data: medications, isLoading: loadingMeds } = useQuery(
    medicationsQueryOptions,
  );

  const recordsQueryOptions = trpc.patient.getPatientRecords.queryOptions({
    patientId,
  });
  const { data: records, isLoading: loadingRecords } = useQuery(recordsQueryOptions);
  const documentRequestsQueryOptions = trpc.patient.getPatientDocumentRequests.queryOptions({
    patientId,
  });
  const { data: documentRequests, isLoading: loadingDocumentRequests } = useQuery(
    documentRequestsQueryOptions,
  );

  const { data: privateData } = useQuery(trpc.privateData.queryOptions());
  const doctor = privateData?.user;

  const deleteRecordMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return trpcClient.patient.deleteRecord.mutate(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recordsQueryOptions.queryKey,
      });
      toast.success("Record deleted");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateRecordTypeMutation = useMutation({
    mutationFn: async (data: { id: string; documentType: DocumentType }) => {
      return trpcClient.patient.updateRecordType.mutate(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recordsQueryOptions.queryKey,
      });
      toast.success("Document type updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateDiseasesMutation = useMutation({
    mutationFn: async (data: { patientId: string; diseases: string[] }) => {
      return trpcClient.patient.updateChronicDiseases.mutate(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: patientQueryOptions.queryKey,
      });
      toast.success("Chronic diseases updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const createDocumentRequestMutation = useMutation({
    mutationFn: async (data: {
      patientId: string;
      documentType: DocumentType;
      note?: string;
    }) => {
      return trpcClient.patient.createDocumentRequest.mutate(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentRequestsQueryOptions.queryKey,
      });
      toast.success("Document request created");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: async (data: {
      patientId: string;
      notes?: string;
      diagnosis?: string;
      visitDate?: string;
    }) => {
      return trpcClient.patient.createVisit.mutate(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: visitsQueryOptions.queryKey,
      });
      await queryClient.refetchQueries({
        queryKey: visitsQueryOptions.queryKey,
      });
      toast.success("Visit saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateVisitMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      notes?: string;
      diagnosis?: string;
      visitDate?: string;
    }) => {
      return trpcClient.patient.updateVisit.mutate(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: visitsQueryOptions.queryKey,
      });
      toast.success("Visit updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const createMedMutation = useMutation({
    mutationFn: async (data: {
      patientId: string;
      name: string;
      dosage?: string;
      frequency: string;
      timesPerDay: number;
      morningDose?: string;
      nightDose?: string;
      notes?: string;
    }) => {
      return trpcClient.patient.createMedication.mutate(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: medicationsQueryOptions.queryKey,
      });
      await queryClient.refetchQueries({
        queryKey: medicationsQueryOptions.queryKey,
      });
      toast.success("Medication added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMedMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      return trpcClient.patient.deleteMedication.mutate(data);
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({
        queryKey: medicationsQueryOptions.queryKey,
      });

      const previousMedications = queryClient.getQueryData<any[]>(
        medicationsQueryOptions.queryKey,
      );

      queryClient.setQueryData<any[]>(
        medicationsQueryOptions.queryKey,
        (old) => old?.filter((med) => med.id !== id) ?? [],
      );

      return { previousMedications };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousMedications) {
        queryClient.setQueryData(
          medicationsQueryOptions.queryKey,
          context.previousMedications,
        );
      }
      toast.error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: medicationsQueryOptions.queryKey,
      });
      toast.success("Medication removed");
    },
    onSettled: async () => {
      await queryClient.refetchQueries({
        queryKey: medicationsQueryOptions.queryKey,
      });
    },
  });

  const [visitNotes, setVisitNotes] = useState("");
  const [visitDiagnosis, setVisitDiagnosis] = useState("");
  const [visitDate, setVisitDate] = useState(getDefaultVisitDate());
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);

  const [medName, setMedName] = useState("");
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [showMedicationResults, setShowMedicationResults] = useState(false);
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("twice_daily");
  const [medMorningDose, setMedMorningDose] = useState("");
  const [medNightDose, setMedNightDose] = useState("");
  const [medNotes, setMedNotes] = useState("");
  const [showMedDialog, setShowMedDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showDiseasesDialog, setShowDiseasesDialog] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentType>(DEFAULT_DOCUMENT_TYPE);
  const [requestedDocumentType, setRequestedDocumentType] =
    useState<DocumentType>(DEFAULT_DOCUMENT_TYPE);
  const [requestNote, setRequestNote] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const medicationCatalogQueryOptions = trpc.patient.searchMedicationCatalog.queryOptions(
    { query: medSearchQuery },
  );
  const { data: medicationSuggestions, isFetching: loadingMedicationSuggestions } = useQuery({
    ...medicationCatalogQueryOptions,
    enabled: medSearchQuery.trim().length >= 2,
  });

  const openDiseasesDialog = () => {
    setSelectedDiseases(patient?.chronicDiseases || []);
    setShowDiseasesDialog(true);
  };

  const handleUpdateDiseases = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDiseasesMutation.mutateAsync({
      patientId,
      diseases: selectedDiseases,
    });
    setShowDiseasesDialog(false);
  };

  const handleDownloadPrescription = () => {
    if (!patient || !doctor) return;
    
    const doc = new jsPDF();
    const activeMedications = medications?.filter((m: any) => m.isActive) || [];

    // Header / Logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text("AMC", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Medical Prescription", 14, 26);

    // Doctor Info (Right aligned)
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont("helvetica", "bold");
    const doctorName = `Dr. ${doctor.name}`;
    doc.text(doctorName, 196, 20, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (doctor.specialization) {
      doc.text(doctor.specialization, 196, 26, { align: "right" });
    }
    // phone is not typed in the base session
    if ((doctor as any).phone) {
      doc.text((doctor as any).phone, 196, 32, { align: "right" });
    }

    // Divider
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    // Patient Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information:", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${patient.name}`, 14, 56);
    doc.text(`Age/Birthday: ${patient.birthday || "N/A"}`, 14, 62);
    doc.text(`Gender: ${patient.gender || "N/A"}`, 14, 68);
    
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 196, 56, { align: "right" });

    // Medications Table
    if (activeMedications.length > 0) {
      autoTable(doc, {
        startY: 80,
        head: [["Medication", "Dosage", "Frequency", "Instructions"]],
        body: activeMedications.map((med: any) => [
          med.name,
          med.dosage || "-",
          getFrequencyLabel(med.frequency),
          [
            med.morningDose ? `Morning: ${med.morningDose}` : "",
            med.nightDose ? `Night: ${med.nightDose}` : "",
            med.notes || ""
          ].filter(Boolean).join("\n") || "-"
        ]),
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
        styles: { fontSize: 10, cellPadding: 4 },
      });
    } else {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.text("No active medications prescribed.", 14, 90);
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(
        "This is a computer-generated document. No signature is required.",
        105,
        285,
        { align: "center" }
      );
    }

    doc.save(`Prescription_${patient.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVisitId) {
      await updateVisitMutation.mutateAsync({
        id: editingVisitId,
        notes: visitNotes || undefined,
        diagnosis: visitDiagnosis || undefined,
        visitDate: new Date(visitDate).toISOString(),
      });
    } else {
      await createVisitMutation.mutateAsync({
        patientId,
        notes: visitNotes || undefined,
        diagnosis: visitDiagnosis || undefined,
        visitDate: new Date(visitDate).toISOString(),
      });
    }
    setVisitNotes("");
    setVisitDiagnosis("");
    setVisitDate(getDefaultVisitDate());
    setEditingVisitId(null);
    setShowVisitDialog(false);
  };

  const handleEditVisit = (visit: any) => {
    setEditingVisitId(visit.id);
    setVisitDiagnosis(visit.diagnosis || "");
    setVisitNotes(visit.notes || "");
    const date = new Date(visit.visitDate);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
    setVisitDate(local);
    setShowVisitDialog(true);
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMedMutation.mutateAsync({
      patientId,
      name: medName,
      dosage: medDosage || undefined,
      frequency: medFrequency,
      timesPerDay:
        medFrequency === "once_daily"
          ? 1
          : medFrequency === "twice_daily"
            ? 2
            : medFrequency === "three_times_daily"
              ? 3
              : 4,
      morningDose: medMorningDose || undefined,
      nightDose: medNightDose || undefined,
      notes: medNotes || undefined,
    });
    setMedSearchQuery("");
    setMedName("");
    setMedDosage("");
    setMedFrequency("twice_daily");
    setMedMorningDose("");
    setMedNightDose("");
    setMedNotes("");
    setShowMedicationResults(false);
    setShowMedDialog(false);
  };

  const handleSelectMedication = (entry: {
    name: string;
    dosage: string;
  }) => {
    setMedName(entry.name);
    setMedSearchQuery(entry.name);
    if (!medDosage) {
      setMedDosage(entry.dosage);
    }
    setShowMedicationResults(false);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFrequencyLabel = (value: string) => {
    return FREQUENCIES.find((f) => f.value === value)?.label || value;
  };

  const isFutureVisit = (date: Date | string | null) => {
    if (!date) return false;
    return new Date(date).getTime() > Date.now();
  };

  const handleCreateDocumentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocumentRequestMutation.mutateAsync({
      patientId,
      documentType: requestedDocumentType,
      note: requestNote || undefined,
    });
    setRequestedDocumentType(DEFAULT_DOCUMENT_TYPE);
    setRequestNote("");
    setShowRequestDialog(false);
  };

  const groupedRecords = useMemo(() => {
    const base = Object.fromEntries(
      documentTypeOptions.map((option) => [option.value, [] as any[]]),
    ) as Record<DocumentType, any[]>;

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

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Patient Records</h1>
          <p className="text-muted-foreground">Managing records for {patient.name}</p>
        </div>
      </div>

      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
            <DialogContent onClose={() => setShowVisitDialog(false)}>
              <DialogHeader>
                <DialogTitle>
                  {editingVisitId ? "Edit Medical Visit" : "New Medical Visit"}
                </DialogTitle>
              </DialogHeader>
               <form onSubmit={handleCreateVisit} className="space-y-4">
                 <div>
                   <label className="text-sm text-muted-foreground">Visit Date</label>
                   <Input
                     type="datetime-local"
                     value={visitDate}
                     onChange={(e) => setVisitDate(e.target.value)}
                     className="bg-muted border-border text-foreground"
                   />
                 </div>
                 <div>
                   <label className="text-sm text-muted-foreground">Diagnosis</label>
                   <Input
                     value={visitDiagnosis}
                     onChange={(e) => setVisitDiagnosis(e.target.value)}
                     placeholder="Enter diagnosis"
                     className="bg-muted border-border text-card-foreground"
                   />
                 </div>
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <Textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Enter visit notes"
                    rows={4}
                    className="bg-muted border-border text-card-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createVisitMutation.isPending || updateVisitMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500"
                >
                  {createVisitMutation.isPending || updateVisitMutation.isPending
                    ? "Saving..."
                    : editingVisitId
                      ? "Update Visit"
                      : "Save Visit"}
                </Button>
              </form>
            </DialogContent>
      </Dialog>

      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
            <DialogContent onClose={() => setShowRecordDialog(false)}>
              <DialogHeader>
                <DialogTitle>Upload Patient Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Document Type</label>
                  <select
                    value={selectedDocumentType}
                    onChange={(e) =>
                      setSelectedDocumentType(e.target.value as DocumentType)
                    }
                    className="mt-2 w-full rounded-md border border-border bg-muted px-3 py-2 text-card-foreground"
                  >
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                      headers: {
                        // Any required headers
                      },
                      ondata: (formData) => {
                        formData.append("patientId", patientId);
                        formData.append("documentType", selectedDocumentType);
                        return formData;
                      },
                      onload: (res) => {
                        toast.success("File uploaded successfully");
                        setShowRecordDialog(false);
                        setFiles([]);
                        setSelectedDocumentType(DEFAULT_DOCUMENT_TYPE);
                        queryClient.invalidateQueries({
                          queryKey: recordsQueryOptions.queryKey,
                        });
                        return res;
                      },
                      onerror: (err) => {
                        toast.error("Upload failed");
                        return err;
                      },
                    },
                  }}
                  name="file"
                  labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                />
              </div>
            </DialogContent>
      </Dialog>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogContent onClose={() => setShowRequestDialog(false)}>
              <DialogHeader>
                <DialogTitle>Request a Medical Document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDocumentRequest} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Document Type</label>
                  <select
                    value={requestedDocumentType}
                    onChange={(e) =>
                      setRequestedDocumentType(e.target.value as DocumentType)
                    }
                    className="mt-2 w-full rounded-md border border-border bg-muted px-3 py-2 text-card-foreground"
                  >
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Doctor Note</label>
                  <Textarea
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Add context for the patient, for example fasting instructions or deadline"
                    rows={4}
                    className="bg-muted border-border text-card-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createDocumentRequestMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500"
                >
                  {createDocumentRequestMutation.isPending
                    ? "Sending Request..."
                    : "Send Request"}
                </Button>
              </form>
            </DialogContent>
      </Dialog>

      <Dialog open={showMedDialog} onOpenChange={setShowMedDialog}>
            <DialogContent onClose={() => setShowMedDialog(false)}>
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMedication} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Search Medication *
                  </label>
                  <div className="relative">
                    <Input
                      value={medSearchQuery}
                      onChange={(e) => {
                        setMedSearchQuery(e.target.value);
                        setMedName(e.target.value);
                        setShowMedicationResults(true);
                      }}
                      onFocus={() => setShowMedicationResults(true)}
                      placeholder="Search by name, dosage, DCI, or laboratory"
                      className="bg-muted border-border text-card-foreground"
                    />
                    {showMedicationResults && medSearchQuery.trim().length >= 2 && (
                      <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-card p-2 shadow-xl">
                        {loadingMedicationSuggestions ? (
                          <div className="px-3 py-4 text-sm text-muted-foreground">
                            Searching medications...
                          </div>
                        ) : medicationSuggestions && medicationSuggestions.length > 0 ? (
                          <div className="space-y-1">
                            {medicationSuggestions.map((entry) => (
                              <button
                                key={entry.id}
                                type="button"
                                onClick={() => handleSelectMedication(entry)}
                                className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/70 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-medium text-foreground">{entry.name}</p>
                                  {entry.dosage && (
                                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                                      {entry.dosage}
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  {entry.form && <span>{entry.form}</span>}
                                  {entry.dci && (
                                    <>
                                      <span>•</span>
                                      <span>{entry.dci}</span>
                                    </>
                                  )}
                                  {entry.laboratory && (
                                    <>
                                      <span>•</span>
                                      <span>{entry.laboratory}</span>
                                    </>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-3 py-4 text-sm text-muted-foreground">
                            No medications found.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {medName && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Selected medication: <span className="font-medium text-foreground">{medName}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Dosage</label>
                  <Input
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="e.g., 500mg"
                    className="bg-muted border-border text-card-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Frequency</label>
                  <select
                    value={medFrequency}
                    onChange={(e) => setMedFrequency(e.target.value)}
                    className="w-full bg-muted border-border rounded-md px-3 py-2 text-card-foreground"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Morning Dose
                    </label>
                    <Input
                      value={medMorningDose}
                      onChange={(e) => setMedMorningDose(e.target.value)}
                      placeholder="e.g., 1 pill"
                      className="bg-muted border-border text-card-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Night Dose</label>
                    <Input
                      value={medNightDose}
                      onChange={(e) => setMedNightDose(e.target.value)}
                      placeholder="e.g., 1 pill"
                      className="bg-muted border-border text-card-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <Textarea
                    value={medNotes}
                    onChange={(e) => setMedNotes(e.target.value)}
                    placeholder="Additional notes"
                    rows={2}
                    className="bg-muted border-border text-card-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createMedMutation.isPending || !medName}
                  className="w-full bg-teal-600 hover:bg-teal-500"
                >
                  {createMedMutation.isPending ? "Saving..." : "Add Medication"}
                </Button>
              </form>
            </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="text-card-foreground font-medium">{patient.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-card-foreground">{patient.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="text-card-foreground">
                  {patient.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Gender</label>
                <p className="text-card-foreground capitalize">
                  {patient.gender || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Birthday</label>
                <p className="text-card-foreground">
                  {patient.birthday || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Patient ID</label>
                <p className="text-card-foreground font-mono text-xs">{patient.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500" />
                Chronic Diseases
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={openDiseasesDialog}
                className="text-muted-foreground hover:text-emerald-400"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {patient.chronicDiseases.map((disease: string) => (
                    <Badge
                      key={disease}
                      className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/50"
                      variant="outline"
                    >
                      {disease}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chronic diseases recorded</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showDiseasesDialog} onOpenChange={setShowDiseasesDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Chronic Diseases</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateDiseases} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {COMMON_DISEASES.map((disease) => {
                    const isSelected = selectedDiseases.includes(disease);
                    return (
                      <label
                        key={disease}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/50"
                            : "bg-muted border-border hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-5 h-5 rounded border ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-border bg-card"
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3.5 h-3.5 text-foreground" />}
                        </div>
                        <span
                          className={`text-sm ${
                            isSelected ? "text-card-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {disease}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDiseases([...selectedDiseases, disease]);
                            } else {
                              setSelectedDiseases(
                                selectedDiseases.filter((d) => d !== disease)
                              );
                            }
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
                <Button
                  type="submit"
                  disabled={updateDiseasesMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 mt-4"
                >
                  {updateDiseasesMutation.isPending ? "Saving..." : "Save Diseases"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-500" />
                  Current Medications
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-emerald-500/20 text-emerald-400"
                  >
                    {medications?.filter((m: any) => m.isActive).length || 0}{" "}
                    active
                  </Badge>
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="bg-teal-600 hover:bg-teal-500"
                  onClick={() => {
                    setMedSearchQuery(medName);
                    setShowMedicationResults(false);
                    setShowMedDialog(true);
                  }}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPrescription}
                  className="border-border text-foreground hover:text-card-foreground hover:bg-muted"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMeds ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : medications && medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.map((med: any) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${med.isActive ? "bg-emerald-500/20" : "bg-muted-foreground/20"}`}
                        >
                          <Pill
                            className={`w-5 h-5 ${med.isActive ? "text-emerald-400" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <p className="text-card-foreground font-medium">
                            {med.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {med.dosage && <span>{med.dosage}</span>}
                            <span>•</span>
                            <span>{getFrequencyLabel(med.frequency)}</span>
                          </div>
                          {(med.morningDose || med.nightDose) && (
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                              {med.morningDose && (
                                <span>Morning: {med.morningDose}</span>
                              )}
                              {med.nightDose && (
                                <span>Night: {med.nightDose}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={med.isActive ? "default" : "secondary"}
                          className={med.isActive ? "bg-emerald-500" : ""}
                        >
                          {med.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteMedMutation.mutate({ id: med.id })
                          }
                          className="text-muted-foreground hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No medications prescribed</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-500" />
                Medical Visits
                <Badge
                  variant="secondary"
                  className="ml-auto bg-teal-500/20 text-teal-400"
                >
                  {visits?.length || 0} visits
                </Badge>
              </CardTitle>
              <Button
                className="bg-emerald-600 hover:bg-emerald-500"
                onClick={() => {
                  setEditingVisitId(null);
                  setVisitDiagnosis("");
                  setVisitNotes("");
                  setVisitDate(getDefaultVisitDate());
                  setShowVisitDialog(true);
                }}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                New Visit
              </Button>
            </CardHeader>
            <CardContent>
              {loadingVisits ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : visits && visits.length > 0 ? (
                <div className="space-y-3">
                  {visits.map((visit: any) => (
                    <div
                      key={visit.id}
                      className="p-4 bg-muted rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {formatDate(visit.visitDate)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground"
                        >
                          Dr. {visit.doctor?.name || "Unknown"}
                        </Badge>
                        {isFutureVisit(visit.visitDate) && (
                          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                            Coming Appointment
                          </Badge>
                        )}
                      </div>
                      {visit.diagnosis && (
                        <div className="mb-2">
                          <label className="text-sm text-muted-foreground">
                            Diagnosis
                          </label>
                          <p className="text-card-foreground">{visit.diagnosis}</p>
                        </div>
                      )}
                      {visit.notes && (
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Notes
                          </label>
                          <p className="text-foreground text-sm">
                            {visit.notes}
                          </p>
                        </div>
                      )}
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVisit(visit)}
                          className="border-border text-foreground hover:bg-background"
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit Visit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No medical visits recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Document Requests
                <Badge
                  variant="secondary"
                  className="ml-auto bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                >
                  {documentRequests?.length || 0} requests
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                onClick={() => setShowRequestDialog(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Request Document
              </Button>
            </CardHeader>
            <CardContent>
              {loadingDocumentRequests ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : documentRequests && documentRequests.length > 0 ? (
                <div className="space-y-3">
                  {documentRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-border bg-muted/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-card-foreground">
                            {DOCUMENT_TYPE_LABELS[
                              (request.documentType || DEFAULT_DOCUMENT_TYPE) as DocumentType
                            ]}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatDate(request.createdAt)}</span>
                            <span>•</span>
                            <span>
                              {request.fulfilledRecordId
                                ? "Linked to uploaded document"
                                : "Waiting for patient upload"}
                            </span>
                          </div>
                          {request.note && (
                            <p className="mt-3 text-sm text-foreground">{request.note}</p>
                          )}
                        </div>
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No document requests yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Patient Records
                <Badge
                  variant="secondary"
                  className="ml-auto bg-blue-500/20 text-blue-400"
                >
                  {records?.length || 0} files
                </Badge>
              </CardTitle>
              <Button
                className="bg-blue-600 hover:bg-blue-500"
                onClick={() => setShowRecordDialog(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Upload Record
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg" />
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
                        {group.records.map((record: any) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="rounded-lg bg-blue-500/20 p-2">
                                <FileText className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">
                                  {record.originalName}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{(record.size / 1024 / 1024).toFixed(2)} MB</span>
                                  <span>•</span>
                                  <span>{formatDate(record.createdAt)}</span>
                                  <span>•</span>
                                  <span>Dr. {record.doctor?.name || "Unknown"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={(record.documentType || DEFAULT_DOCUMENT_TYPE) as DocumentType}
                                onChange={(e) =>
                                  updateRecordTypeMutation.mutate({
                                    id: record.id,
                                    documentType: e.target.value as DocumentType,
                                  })
                                }
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                              >
                                {documentTypeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <a
                                href={`/uploads/${record.fileName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={record.originalName}
                                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-blue-400"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteRecordMutation.mutate({ id: record.id })}
                                className="text-muted-foreground hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No records uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
