"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/utils/trpc";
import { toast } from "sonner";
import { FileText, Download, Trash2, User, Calendar, Pill, Stethoscope, AlertCircle, X, Activity, Edit3, CheckSquare, Printer } from "lucide-react";
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

  const createVisitMutation = useMutation({
    mutationFn: async (data: {
      patientId: string;
      notes?: string;
      diagnosis?: string;
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
  const [showVisitDialog, setShowVisitDialog] = useState(false);

  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("twice_daily");
  const [medMorningDose, setMedMorningDose] = useState("");
  const [medNightDose, setMedNightDose] = useState("");
  const [medNotes, setMedNotes] = useState("");
  const [showMedDialog, setShowMedDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showDiseasesDialog, setShowDiseasesDialog] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [files, setFiles] = useState<any[]>([]);

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
    await createVisitMutation.mutateAsync({
      patientId,
      notes: visitNotes || undefined,
      diagnosis: visitDiagnosis || undefined,
    });
    setVisitNotes("");
    setVisitDiagnosis("");
    setShowVisitDialog(false);
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
    setMedName("");
    setMedDosage("");
    setMedFrequency("twice_daily");
    setMedMorningDose("");
    setMedNightDose("");
    setMedNotes("");
    setShowMedDialog(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Patient Records</h1>
          <p className="text-muted-foreground">Managing records for {patient.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={() => setShowVisitDialog(true)}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            New Visit
          </Button>

          <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
            <DialogContent onClose={() => setShowVisitDialog(false)}>
              <DialogHeader>
                <DialogTitle>New Medical Visit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVisit} className="space-y-4">
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
                  disabled={createVisitMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500"
                >
                  {createVisitMutation.isPending ? "Saving..." : "Save Visit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            className="bg-teal-600 hover:bg-teal-500"
            onClick={() => setShowMedDialog(true)}
          >
            <Pill className="w-4 h-4 mr-2" />
            Add Medication
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-500"
            onClick={() => setShowRecordDialog(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload Record
          </Button>

          <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
            <DialogContent onClose={() => setShowRecordDialog(false)}>
              <DialogHeader>
                <DialogTitle>Upload Patient Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                        return formData;
                      },
                      onload: (res) => {
                        toast.success("File uploaded successfully");
                        setShowRecordDialog(false);
                        setFiles([]);
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

          <Dialog open={showMedDialog} onOpenChange={setShowMedDialog}>
            <DialogContent onClose={() => setShowMedDialog(false)}>
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMedication} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Medication Name *
                  </label>
                  <Input
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Enter medication name"
                    className="bg-muted border-border text-card-foreground"
                  />
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
        </div>
      </div>

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
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPrescription}
                className="ml-auto border-border text-foreground hover:text-card-foreground hover:bg-muted"
              >
                <Printer className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
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
            <CardHeader>
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
            <CardHeader>
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
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : records && records.length > 0 ? (
                <div className="space-y-3">
                  {records.map((record: any) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-card-foreground font-medium">
                            {record.originalName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{(record.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>{formatDate(record.createdAt)}</span>
                            <span>•</span>
                            <span>Dr. {record.doctor?.name || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/uploads/${record.fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={record.originalName}
                          className="p-2 text-muted-foreground hover:text-blue-400 rounded-md hover:bg-muted"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRecordMutation.mutate({ id: record.id })}
                          className="text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
