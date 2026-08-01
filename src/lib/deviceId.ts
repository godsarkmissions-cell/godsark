const KEY = "ga_device_id";

/**
 * Returns a stable, anonymous per-browser id (persisted in localStorage).
 * Used only to let a visitor cast one vote per poll without requiring
 * an account — same pattern as most public poll widgets.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}