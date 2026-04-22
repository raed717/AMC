export type DocumentDefinition = {
  value: string;
  label: string;
  family: "general" | "bon_de_labo" | "bon_de_radio";
  familyLabel: string;
  category: string;
};

export const DOCUMENT_DEFINITIONS = [
  {
    value: "lipid_assessment",
    label: "Lipid Assessment",
    family: "general",
    familyLabel: "General Documents",
    category: "Clinical Records",
  },
  {
    value: "renal_assessment",
    label: "Renal Assessment",
    family: "general",
    familyLabel: "General Documents",
    category: "Clinical Records",
  },
  {
    value: "liver_test",
    label: "Liver Test",
    family: "general",
    familyLabel: "General Documents",
    category: "Clinical Records",
  },
  {
    value: "martial_assessment",
    label: "Martial Assessment",
    family: "general",
    familyLabel: "General Documents",
    category: "Clinical Records",
  },
  {
    value: "blood_sugar",
    label: "Blood Sugar",
    family: "general",
    familyLabel: "General Documents",
    category: "Clinical Records",
  },
  {
    value: "nfs",
    label: "NFS",
    family: "general",
    familyLabel: "General Documents",
    category: "Clinical Records",
  },
  {
    value: "medical_certificate",
    label: "Medical Certificate",
    family: "general",
    familyLabel: "General Documents",
    category: "Administrative",
  },
  {
    value: "radiology_report",
    label: "Radiology Report",
    family: "general",
    familyLabel: "General Documents",
    category: "Imaging & Reports",
  },
  {
    value: "ecg",
    label: "ECG",
    family: "general",
    familyLabel: "General Documents",
    category: "Imaging & Reports",
  },
  {
    value: "prescription",
    label: "Prescription",
    family: "general",
    familyLabel: "General Documents",
    category: "Administrative",
  },
  {
    value: "vaccination_record",
    label: "Vaccination Record",
    family: "general",
    familyLabel: "General Documents",
    category: "Administrative",
  },
  {
    value: "discharge_summary",
    label: "Discharge Summary",
    family: "general",
    familyLabel: "General Documents",
    category: "Administrative",
  },
  {
    value: "allergy_report",
    label: "Allergy Report",
    family: "general",
    familyLabel: "General Documents",
    category: "Clinical Records",
  },
  {
    value: "other",
    label: "Other",
    family: "general",
    familyLabel: "General Documents",
    category: "Other",
  },
  { value: "lab_nfs", label: "NFS", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse de sang" },
  { value: "lab_glycemie", label: "Glycemie", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse de sang" },
  { value: "lab_bilan_lipidique", label: "Bilan lipidique", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse de sang" },
  { value: "lab_uree", label: "Uree", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse de sang" },
  { value: "lab_bilan_hepatique", label: "Bilan hepatique", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse de sang" },
  { value: "lab_crp", label: "CRP", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse de sang" },
  { value: "lab_tsh", label: "TSH", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse de sang" },
  { value: "lab_ecbu", label: "ECBU", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse d'urines" },
  { value: "lab_urine_simple", label: "Analyses d'urines simple", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse d'urines" },
  { value: "lab_prelevement_vaginal", label: "Prelevement vaginal", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse microbiologiques" },
  { value: "lab_prelevement_gorge", label: "Prelevement de gorge", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse microbiologiques" },
  { value: "lab_hemoculture", label: "Hemoculture", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse microbiologiques" },
  { value: "lab_beta_hcg", label: "Beta-HCG", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse hormonales" },
  { value: "lab_hormones_oestrogenes_progesterones", label: "Hormones: oestrogenes, progesterones", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Analyse hormonales" },
  { value: "lab_ionogramme", label: "Ionogramme", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Autres analyses" },
  { value: "lab_ferritine", label: "Ferritine", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Autres analyses" },
  { value: "lab_vitamine_d", label: "Vitamine D", family: "bon_de_labo", familyLabel: "BON DE LABO", category: "Autres analyses" },
  { value: "radio_radiographie_thorax", label: "Radiographie du thorax", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Radiographie" },
  { value: "radio_radiographie_os", label: "Radiographie des os", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Radiographie" },
  { value: "radio_radiographie_rachis", label: "Radiographie du rachis", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Radiographie" },
  { value: "radio_radiographie_abdominale", label: "Radiographie abdominale", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Radiographie" },
  { value: "radio_scanner_cerebral", label: "Scanner cerebral", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Scanner" },
  { value: "radio_scanner_thoracique", label: "Scanner thoracique", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Scanner" },
  { value: "radio_scanner_abdominal", label: "Scanner abdominal", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Scanner" },
  { value: "radio_angio_scanner", label: "Angio-Scanner", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Scanner" },
  { value: "radio_irm_cerebral", label: "IRM cerebral", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "IRM" },
  { value: "radio_irm_medullaires", label: "IRM medullaires", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "IRM" },
  { value: "radio_irm_articulaire", label: "IRM articulaire", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "IRM" },
  { value: "radio_irm_abdominale", label: "IRM abdominale", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "IRM" },
  { value: "radio_echographie_abdominale", label: "Echographie abdominale", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Echographie" },
  { value: "radio_echographie_pelvienne", label: "Echographie pelvienne", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Echographie" },
  { value: "radio_echographie_obstetricale", label: "Echographie obstetricale", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Echographie" },
  { value: "radio_echographie_renale", label: "Echographie renale", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Echographie" },
  { value: "radio_echographie_thyroidienne", label: "Echographie thyroidienne", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Echographie" },
  { value: "radio_ecocardiographie", label: "Ecocardiographie", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Echographie" },
  { value: "radio_scintigraphie_osseuse", label: "Scintigraphique osseuse", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Medecine nucleaire" },
  { value: "radio_scintigraphie_thyroidienne", label: "Scintigraphique thyroidienne", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Medecine nucleaire" },
  { value: "radio_scintigraphie_renale", label: "Scintigraphique renale", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Medecine nucleaire" },
  { value: "radio_tep_scan", label: "TEP scan", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Medecine nucleaire" },
  { value: "radio_osteodensitometrie", label: "Osteodensitometrie", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Examen specialises" },
  { value: "radio_mamographie", label: "Mamographie", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Examen specialises" },
  { value: "radio_hysterosalpingographie", label: "Hysterosalpingographie", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Examen specialises" },
  { value: "radio_fluoroscopie", label: "Fluoroscopie", family: "bon_de_radio", familyLabel: "BON DE RADIO", category: "Examen specialises" },
] as const satisfies readonly DocumentDefinition[];

export const DOCUMENT_TYPES = DOCUMENT_DEFINITIONS.map((item) => item.value) as [string, ...string[]];
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS = Object.fromEntries(
  DOCUMENT_DEFINITIONS.map((item) => [item.value, item.label]),
) as Record<DocumentType, string>;

export const DOCUMENT_TYPE_META = Object.fromEntries(
  DOCUMENT_DEFINITIONS.map((item) => [item.value, item]),
) as Record<DocumentType, DocumentDefinition>;

export const DOCUMENT_FAMILIES = [
  { value: "general", label: "General Documents" },
  { value: "bon_de_labo", label: "BON DE LABO" },
  { value: "bon_de_radio", label: "BON DE RADIO" },
] as const;

export type DocumentFamily = (typeof DOCUMENT_FAMILIES)[number]["value"];

export const DEFAULT_DOCUMENT_TYPE: DocumentType = "other";

export const getDocumentCategories = (family: DocumentFamily) =>
  [...new Set(DOCUMENT_DEFINITIONS.filter((item) => item.family === family).map((item) => item.category))];

export const getDocumentOptionsForFamilyAndCategory = (
  family: DocumentFamily,
  category: string,
) => DOCUMENT_DEFINITIONS.filter((item) => item.family === family && item.category === category);

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
