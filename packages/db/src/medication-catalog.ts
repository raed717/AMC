import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as XLSX from "xlsx";

export type MedicationCatalogEntry = {
  id: string;
  name: string;
  dosage: string;
  form: string;
  presentation: string;
  dci: string;
  className: string;
  subClass: string;
  laboratory: string;
};

let medicationCatalogCache: MedicationCatalogEntry[] | null = null;

const normalize = (value: unknown) => String(value ?? "").trim();

const createBaseId = (entry: MedicationCatalogEntry) =>
  `${entry.name}__${entry.dosage}__${entry.form}__${entry.laboratory}`;

const resolveCatalogPath = () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(currentDir, "medician.xls"),
    path.join(process.cwd(), "packages", "db", "src", "medician.xls"),
    path.join(process.cwd(), "..", "..", "packages", "db", "src", "medician.xls"),
  ];

  const existingPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!existingPath) {
    throw new Error(`Cannot access medication catalog file. Tried: ${candidates.join(", ")}`);
  }

  return existingPath;
};

export const getMedicationCatalog = (): MedicationCatalogEntry[] => {
  if (medicationCatalogCache) {
    return medicationCatalogCache;
  }

  const workbook = XLSX.read(fs.readFileSync(resolveCatalogPath()), { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    medicationCatalogCache = [];
    return medicationCatalogCache;
  }

  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) {
    medicationCatalogCache = [];
    return medicationCatalogCache;
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const seenIds = new Map<string, number>();

  medicationCatalogCache = rows
    .map((row) => {
      const entry: MedicationCatalogEntry = {
        id: "",
        name: normalize(row.Nom),
        dosage: normalize(row.Dosage),
        form: normalize(row.Forme),
        presentation: normalize(row["Présentation"]),
        dci: normalize(row.DCI),
        className: normalize(row.Classe),
        subClass: normalize(row["Sous Classe"]),
        laboratory: normalize(row.Laboratoire),
      };

      const baseId = createBaseId(entry);
      const duplicateCount = seenIds.get(baseId) ?? 0;
      seenIds.set(baseId, duplicateCount + 1);
      entry.id = duplicateCount === 0 ? baseId : `${baseId}__${duplicateCount + 1}`;
      return entry;
    })
    .filter((entry) => entry.name.length > 0);

  return medicationCatalogCache;
};

export const searchMedicationCatalog = (query: string, limit = 12) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return getMedicationCatalog()
    .filter((entry) => {
      const haystack = [
        entry.name,
        entry.dosage,
        entry.dci,
        entry.form,
        entry.laboratory,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .slice(0, limit);
};
