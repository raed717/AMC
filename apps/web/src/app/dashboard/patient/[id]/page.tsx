"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/utils/trpc";
import { toast } from "sonner";
import {
  User,
  Calendar,
  Pill,
  Stethoscope,
  AlertCircle,
  X,
} from "lucide-react";
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

const FREQUENCIES = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "four_times_daily", label: "Four times daily" },
  { value: "as_needed", label: "As needed" },
];

export default function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const patientId = decodeURIComponent(id);
  const queryClient = useQueryClient();

  const { data: patient, isLoading: loadingPatient } = useQuery(
    trpc.patient.getPatient.queryOptions({ patientId }),
  );
  const { data: visits, isLoading: loadingVisits } = useQuery(
    trpc.patient.getPatientVisits.queryOptions({ patientId }),
  );
  const { data: medications, isLoading: loadingMeds } = useQuery(
    trpc.patient.getPatientMedications.queryOptions({ patientId }),
  );

  const createVisitMutation = useMutation({
    mutationFn: async (data: {
      patientId: string;
      notes?: string;
      diagnosis?: string;
    }) => {
      return trpcClient.patient.createVisit.mutate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient.getPatientVisits"],
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient.getPatientMedications"],
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient.getPatientMedications"],
      });
      toast.success("Medication removed");
    },
    onError: (error: any) => {
      toast.error(error.message);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-slate-400">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Patient Records</h1>
          <p className="text-slate-400">Managing records for {patient.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-teal-600 hover:bg-teal-500"
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
                  <label className="text-sm text-slate-400">Diagnosis</label>
                  <Input
                    value={visitDiagnosis}
                    onChange={(e) => setVisitDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis"
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Notes</label>
                  <Textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Enter visit notes"
                    rows={4}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createVisitMutation.isPending}
                  className="w-full bg-teal-600 hover:bg-teal-500"
                >
                  {createVisitMutation.isPending ? "Saving..." : "Save Visit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={() => setShowMedDialog(true)}
          >
            <Pill className="w-4 h-4 mr-2" />
            Add Medication
          </Button>

          <Dialog open={showMedDialog} onOpenChange={setShowMedDialog}>
            <DialogContent onClose={() => setShowMedDialog(false)}>
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMedication} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">
                    Medication Name *
                  </label>
                  <Input
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Enter medication name"
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Dosage</label>
                  <Input
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="e.g., 500mg"
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Frequency</label>
                  <select
                    value={medFrequency}
                    onChange={(e) => setMedFrequency(e.target.value)}
                    className="w-full bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-slate-200"
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
                    <label className="text-sm text-slate-400">
                      Morning Dose
                    </label>
                    <Input
                      value={medMorningDose}
                      onChange={(e) => setMedMorningDose(e.target.value)}
                      placeholder="e.g., 1 pill"
                      className="bg-slate-800 border-slate-700 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Night Dose</label>
                    <Input
                      value={medNightDose}
                      onChange={(e) => setMedNightDose(e.target.value)}
                      placeholder="e.g., 1 pill"
                      className="bg-slate-800 border-slate-700 text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Notes</label>
                  <Textarea
                    value={medNotes}
                    onChange={(e) => setMedNotes(e.target.value)}
                    placeholder="Additional notes"
                    rows={2}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createMedMutation.isPending || !medName}
                  className="w-full bg-indigo-600 hover:bg-indigo-500"
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
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-500">Full Name</label>
                <p className="text-slate-200 font-medium">{patient.name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Email</label>
                <p className="text-slate-200">{patient.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Phone</label>
                <p className="text-slate-200">
                  {patient.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Gender</label>
                <p className="text-slate-200 capitalize">
                  {patient.gender || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Birthday</label>
                <p className="text-slate-200">
                  {patient.birthday || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Patient ID</label>
                <p className="text-slate-200 font-mono text-xs">{patient.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-500" />
                Current Medications
                <Badge
                  variant="secondary"
                  className="ml-auto bg-teal-500/20 text-teal-400"
                >
                  {medications?.filter((m: any) => m.isActive).length || 0}{" "}
                  active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMeds ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-800 rounded-lg" />
                  ))}
                </div>
              ) : medications && medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.map((med: any) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${med.isActive ? "bg-teal-500/20" : "bg-slate-700"}`}
                        >
                          <Pill
                            className={`w-5 h-5 ${med.isActive ? "text-teal-400" : "text-slate-500"}`}
                          />
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">
                            {med.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            {med.dosage && <span>{med.dosage}</span>}
                            <span>•</span>
                            <span>{getFrequencyLabel(med.frequency)}</span>
                          </div>
                          {(med.morningDose || med.nightDose) && (
                            <div className="flex gap-3 text-xs text-slate-500 mt-1">
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
                          className={med.isActive ? "bg-teal-500" : ""}
                        >
                          {med.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteMedMutation.mutate({ id: med.id })
                          }
                          className="text-slate-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No medications prescribed</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-500" />
                Medical Visits
                <Badge
                  variant="secondary"
                  className="ml-auto bg-indigo-500/20 text-indigo-400"
                >
                  {visits?.length || 0} visits
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVisits ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-slate-800 rounded-lg" />
                  ))}
                </div>
              ) : visits && visits.length > 0 ? (
                <div className="space-y-3">
                  {visits.map((visit: any) => (
                    <div
                      key={visit.id}
                      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {formatDate(visit.visitDate)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-slate-600 text-slate-400"
                        >
                          Dr. {visit.doctor?.name || "Unknown"}
                        </Badge>
                      </div>
                      {visit.diagnosis && (
                        <div className="mb-2">
                          <label className="text-sm text-slate-500">
                            Diagnosis
                          </label>
                          <p className="text-slate-200">{visit.diagnosis}</p>
                        </div>
                      )}
                      {visit.notes && (
                        <div>
                          <label className="text-sm text-slate-500">
                            Notes
                          </label>
                          <p className="text-slate-300 text-sm">
                            {visit.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No medical visits recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
