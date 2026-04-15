import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { db } from "@AMC/db";
import { documentRequests, patientRecords } from "@AMC/db/schema/auth";
import { auth } from "@AMC/auth";
import { DEFAULT_DOCUMENT_TYPE, DOCUMENT_TYPES } from "@AMC/db/document-types";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    
    let file: File | null = null;
    let patientId: string | null = null;
    let documentType = DEFAULT_DOCUMENT_TYPE;
    let requestId: string | null = null;

    // FilePond can sometimes send the file under unexpected keys or send stringified metadata.
    // Iterating through the FormData ensures we grab the actual File object and the patientId.
    for (const [key, value] of data.entries()) {
      if (key === "patientId") {
        patientId = value.toString();
      } else if (key === "requestId") {
        requestId = value.toString();
      } else if (key === "documentType") {
        const submittedType = value.toString();
        if (DOCUMENT_TYPES.includes(submittedType as (typeof DOCUMENT_TYPES)[number])) {
          documentType = submittedType as (typeof DOCUMENT_TYPES)[number];
        }
      } else if (typeof value === "object" && value !== null && 'arrayBuffer' in value) {
        // We found the actual file blob
        file = value as File;
      }
    }

    if (!file || !patientId) {
      return NextResponse.json(
        { error: "Missing file or patientId" },
        { status: 400 }
      );
    }

    if (session.user.role === "patient" && session.user.id !== patientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let doctorId = session.user.id;

    if (requestId) {
      const request = await db.query.documentRequests.findFirst({
        where: eq(documentRequests.id, requestId),
      });

      if (!request || request.patientId !== patientId) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      if (session.user.role === "patient" && request.patientId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      doctorId = request.doctorId;
      documentType = request.documentType;
    } else if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Patients can only upload requested documents." },
        { status: 403 },
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const uniqueFileName = `${crypto.randomUUID()}.${ext}`;

    // Save to public/uploads
    // Note: process.cwd() is apps/web during execution in next.js
    const uploadDir = join(process.cwd(), "public/uploads");
    const filePath = join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const recordId = crypto.randomUUID();

    // Save to DB
    await db.insert(patientRecords).values({
      id: recordId,
      patientId: patientId,
      doctorId,
      uploaderId: session.user.id,
      fileName: uniqueFileName,
      originalName: file.name,
      documentType,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });

    if (requestId) {
      await db
        .update(documentRequests)
        .set({
          status: "fulfilled",
          fulfilledRecordId: recordId,
          fulfilledAt: new Date(),
        })
        .where(eq(documentRequests.id, requestId));
    }

    return NextResponse.json({ success: true, id: recordId });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
