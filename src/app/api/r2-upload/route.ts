import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/r2";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

async function isRequestFromAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const idToken = authHeader.slice("Bearer ".length);

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const adminDoc = await getAdminDb().collection("admins").doc(decoded.uid).get();
    return adminDoc.exists;
  } catch {
    return false;
  }
}

// POST /api/r2-upload  { fileName, fileType, folder }
// -> { uploadUrl, publicUrl, key }
// The client PUTs the file bytes directly to `uploadUrl` (Cloudflare R2),
// so file data never passes through this Next.js server.
export async function POST(req: NextRequest) {
  if (!(await isRequestFromAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileName, fileType, folder } = await req.json();

    if (!fileName || typeof fileName !== "string" || !folder || typeof folder !== "string") {
      return NextResponse.json({ error: "fileName and folder are required" }, { status: 400 });
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "");
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${safeFolder}/${Date.now()}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: fileType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 minutes to complete the PUT

    const publicBase = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
    const publicUrl = `${publicBase}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("[r2-upload] presign error:", err);
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
