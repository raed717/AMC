import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { db } from "@AMC/db";
import { patientRecords } from "@AMC/db/schema/auth";
import { auth } from "@AMC/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || session.user.role !== "doctor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    
    let file: File | null = null;
    let patientId: string | null = null;

    // FilePond can sometimes send the file under unexpected keys or send stringified metadata.
    // Iterating through the FormData ensures we grab the actual File object and the patientId.
    for (const [key, value] of data.entries()) {
      if (key === "patientId") {
        patientId = value.toString();
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
      doctorId: session.user.id,
      fileName: uniqueFileName,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });

    return NextResponse.json({ success: true, id: recordId });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
