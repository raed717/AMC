export const DOCUMENT_TYPES = [
  "lipid_assessment",
  "renal_assessment",
  "liver_test",
  "martial_assessment",
  "blood_sugar",
  "nfs",
  "medical_certificate",
  "radiology_report",
  "ecg",
  "prescription",
  "vaccination_record",
  "discharge_summary",
  "allergy_report",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  lipid_assessment: "Lipid Assessment",
  renal_assessment: "Renal Assessment",
  liver_test: "Liver Test",
  martial_assessment: "Martial Assessment",
  blood_sugar: "Blood Sugar",
  nfs: "NFS",
  medical_certificate: "Medical Certificate",
  radiology_report: "Radiology Report",
  ecg: "ECG",
  prescription: "Prescription",
  vaccination_record: "Vaccination Record",
  discharge_summary: "Discharge Summary",
  allergy_report: "Allergy Report",
  other: "Other",
};

export const DEFAULT_DOCUMENT_TYPE: DocumentType = "other";

export const DOCUMENT_REQUEST_STATUSES = [
  "pending",
  "fulfilled",
  "cancelled",
] as const;

export type DocumentRequestStatus = (typeof DOCUMENT_REQUEST_STATUSES)[number];

export const DOCUMENT_REQUEST_STATUS_LABELS: Record<DocumentRequestStatus, string> = {
  pending: "Pending",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};
