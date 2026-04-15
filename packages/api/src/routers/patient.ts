import { protectedProcedure, router } from "../index";
import { eq, desc } from "drizzle-orm";
import { db } from "@AMC/db";
import {
  user,
  medicalVisits,
  medications,
  patientRecords,
  documentRequests,
} from "@AMC/db/schema/auth";
import {
  DOCUMENT_TYPES,
  DEFAULT_DOCUMENT_TYPE,
  DOCUMENT_REQUEST_STATUSES,
} from "@AMC/db/document-types";
import { searchMedicationCatalog } from "@AMC/db/medication-catalog";
import { z } from "zod";

const generateId = () => crypto.randomUUID();
const documentTypeEnum = z.enum(DOCUMENT_TYPES);
const documentRequestStatusEnum = z.enum(DOCUMENT_REQUEST_STATUSES);

export const patientRouter = router({
  searchMedicationCatalog: protectedProcedure
    .input(
      z.object({
        query: z.string().trim().min(1),
      }),
    )
    .query(({ input }) => {
      return searchMedicationCatalog(input.query);
    }),

  getPatient: protectedProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ input }) => {
      const patient = await db.query.user.findFirst({
        where: eq(user.id, input.patientId),
      });
      return patient;
    }),

  updateChronicDiseases: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        diseases: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(user)
        .set({ chronicDiseases: input.diseases })
        .where(eq(user.id, input.patientId));
      return { success: true };
    }),

  getPatientVisits: protectedProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ input }) => {
      const visits = await db.query.medicalVisits.findMany({
        where: eq(medicalVisits.patientId, input.patientId),
        orderBy: [desc(medicalVisits.visitDate)],
        with: {
          doctor: {
            columns: {
              id: true,
              name: true,
              specialization: true,
            },
          },
        },
      });
      return visits;
    }),

  getPatientMedications: protectedProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ input }) => {
      const meds = await db.query.medications.findMany({
        where: eq(medications.patientId, input.patientId),
        orderBy: [desc(medications.createdAt)],
      });
      return meds;
    }),

  getMyMedications: protectedProcedure.query(async ({ ctx }) => {
    const meds = await db.query.medications.findMany({
      where: eq(medications.patientId, ctx.session.user.id),
      orderBy: [desc(medications.createdAt)],
    });
    return meds;
  }),

  getMyRecords: protectedProcedure.query(async ({ ctx }) => {
    const records = await db.query.patientRecords.findMany({
      where: eq(patientRecords.patientId, ctx.session.user.id),
      orderBy: [desc(patientRecords.createdAt)],
      with: {
        doctor: {
          columns: {
            id: true,
            name: true,
            specialization: true,
          },
        },
        uploader: {
          columns: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    return records;
  }),

  getMyDocumentRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await db.query.documentRequests.findMany({
      where: eq(documentRequests.patientId, ctx.session.user.id),
      orderBy: [desc(documentRequests.createdAt)],
      with: {
        doctor: {
          columns: {
            id: true,
            name: true,
            specialization: true,
          },
        },
        fulfilledRecord: true,
      },
    });
    return requests;
  }),

  getMyVisits: protectedProcedure.query(async ({ ctx }) => {
    const visits = await db.query.medicalVisits.findMany({
      where: eq(medicalVisits.patientId, ctx.session.user.id),
      orderBy: [desc(medicalVisits.visitDate)],
      with: {
        doctor: {
          columns: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
    });
    return visits;
  }),

  createVisit: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        notes: z.string().optional(),
        diagnosis: z.string().optional(),
        visitDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const visit = await db.insert(medicalVisits).values({
        id: generateId(),
        patientId: input.patientId,
        doctorId: ctx.session.user.id,
        visitDate: input.visitDate ? new Date(input.visitDate) : new Date(),
        notes: input.notes || null,
        diagnosis: input.diagnosis || null,
      });
      return visit;
    }),

  updateVisit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string().optional(),
        diagnosis: z.string().optional(),
        visitDate: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(medicalVisits)
        .set({
          notes: input.notes || null,
          diagnosis: input.diagnosis || null,
          visitDate: input.visitDate ? new Date(input.visitDate) : undefined,
        })
        .where(eq(medicalVisits.id, input.id));
      return { success: true };
    }),

  createMedication: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        name: z.string(),
        dosage: z.string().optional(),
        frequency: z.string(),
        timesPerDay: z.number().default(2),
        morningDose: z.string().optional(),
        nightDose: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const medication = await db.insert(medications).values({
        id: generateId(),
        patientId: input.patientId,
        name: input.name,
        dosage: input.dosage || null,
        frequency: input.frequency,
        timesPerDay: input.timesPerDay,
        morningDose: input.morningDose || null,
        nightDose: input.nightDose || null,
        notes: input.notes || null,
      });
      return medication;
    }),

  updateMedication: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean().optional(),
        name: z.string().optional(),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        morningDose: z.string().optional(),
        nightDose: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: any = { ...input };
      delete updateData.id;
      
      await db
        .update(medications)
        .set(updateData)
        .where(eq(medications.id, input.id));
      return { success: true };
    }),

  deleteMedication: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(medications).where(eq(medications.id, input.id));
      return { success: true };
    }),

  getPatientRecords: protectedProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ input }) => {
      const records = await db.query.patientRecords.findMany({
        where: eq(patientRecords.patientId, input.patientId),
        orderBy: [desc(patientRecords.createdAt)],
        with: {
          doctor: {
            columns: {
              id: true,
              name: true,
            specialization: true,
          },
        },
        uploader: {
          columns: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    return records;
  }),

  getPatientDocumentRequests: protectedProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ input }) => {
      const requests = await db.query.documentRequests.findMany({
        where: eq(documentRequests.patientId, input.patientId),
        orderBy: [desc(documentRequests.createdAt)],
        with: {
          doctor: {
            columns: {
              id: true,
              name: true,
              specialization: true,
            },
          },
          fulfilledRecord: true,
        },
      });
      return requests;
    }),

  createDocumentRequest: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        documentType: documentTypeEnum,
        note: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db.insert(documentRequests).values({
        id: generateId(),
        patientId: input.patientId,
        doctorId: ctx.session.user.id,
        documentType: input.documentType,
        note: input.note || null,
      });
      return { success: true };
    }),

  updateRecordType: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        documentType: documentTypeEnum.default(DEFAULT_DOCUMENT_TYPE),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(patientRecords)
        .set({ documentType: input.documentType })
        .where(eq(patientRecords.id, input.id));
      return { success: true };
    }),

  updateDocumentRequestStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: documentRequestStatusEnum,
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(documentRequests)
        .set({ status: input.status })
        .where(eq(documentRequests.id, input.id));
      return { success: true };
    }),

  deleteRecord: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // In a real app we would check permissions and delete the file from disk too,
      // but for this prototype, we'll just delete the DB record.
      // The file will be orphaned in public/uploads but that's fine for now.
      await db.delete(patientRecords).where(eq(patientRecords.id, input.id));
      return { success: true };
    }),
});
