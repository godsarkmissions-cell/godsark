import { auth } from "@/lib/firebase";

/**
 * Uploads a File to Cloudflare R2 under `folder/` and returns its public
 * URL. Pass onProgress to drive a progress bar (0-100).
 *
 * Flow: ask our own API route (/api/r2-upload) — which checks the caller is
 * a signed-in admin — for a short-lived presigned PUT URL, then upload the
 * file bytes straight to R2 from the browser. The file never passes through
 * our Next.js server.
 *
 * Same signature as before, so every existing call site (`uploadFile(file,
 * folder, onProgress)`) keeps working without changes.
 */
export async function uploadFile(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) {
    throw new Error("You must be signed in as an admin to upload files.");
  }

  const presignRes = await fetch("/api/r2-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ fileName: file.name, fileType: file.type, folder }),
  });

  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => ({}));
    throw new Error(body.error || `Failed to get an upload URL (${presignRes.status})`);
  }

  const { uploadUrl, publicUrl } = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) onProgress?.((evt.loaded / evt.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload to R2 failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload to R2 failed (network error)"));
    xhr.send(file);
  });

  return publicUrl;
}
