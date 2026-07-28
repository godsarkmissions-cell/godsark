import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a File to Firebase Storage under `folder/` and returns its
 * public download URL. Pass onProgress to drive a progress bar (0-100).
 */
export async function uploadFile(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const path = `${folder}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
