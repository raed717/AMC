import { protectedProcedure, router } from "../index";
import { eq, desc } from "drizzle-orm";
import { db } from "@AMC/db";
import { user, medicalVisits, medications, patientRecords } from "@AMC/db/schema/auth";
import { z } from "zod";

const generateId = () => crypto.randomUUID();

export const patientRouter = router({
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

  createVisit: protectedProcedure
    .input(
      z.object({
        patientId: z.string(),
        notes: z.string().optional(),
        diagnosis: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const visit = await db.insert(medicalVisits).values({
        id: generateId(),
        patientId: input.patientId,
        doctorId: ctx.session.user.id,
        visitDate: new Date(),
        notes: input.notes || null,
        diagnosis: input.diagnosis || null,
      });
      return visit;
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
        },
      });
      return records;
    }),

  deleteRecord: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // In a real app we would check permissions and delete the file from disk too,
      // but for this prototype, we'll just delete the DB record.
      // The file will be orphaned in public/uploads but that's fine for now.
      await db.delete(patientRecords).where(eq(patientRecords.id, input.id));
      return { success: true };
    }),
});
