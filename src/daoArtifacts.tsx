// src/daoArtifacts.ts
// Put your *compiled* base64 program bytes here (NOT TEAL source).
export const DAO_APPROVAL_B64 = "PASTE_BASE64_APPROVAL_HERE";
export const DAO_CLEAR_B64 = "PASTE_BASE64_CLEAR_HERE";

// ---- Schema counts for your DAO (tweak if yours differ) ----
const DEFAULT_SCHEMA = {
  globalInts: 8,
  globalBytes: 8,
  localInts: 8,
  localBytes: 8,
} as const;

// ---- Robust base64 handling ----
const normalizeBase64 = (raw: string): string => {
  if (!raw) return "";
  // Strip data URL prefix if present
  const m = raw.match(/^data:.*;base64,(.*)$/i);
  let s = m ? m[1] : raw;
  // Trim & remove whitespace
  s = s.trim().replace(/\s+/g, "");
  // Convert base64url -> base64
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to multiple of 4
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
};

const decodeBase64ToBytes = (b64: string): Uint8Array => {
  const s = normalizeBase64(b64);
  if (!s) return new Uint8Array(0);

  // Browser
  if (typeof atob === "function") {
    try {
      return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    } catch {
      return new Uint8Array(0);
    }
  }

  // Node / SSR
  const Buf: any = (globalThis as any)?.Buffer;
  if (Buf?.from) {
    try {
      return new Uint8Array(Buf.from(s, "base64"));
    } catch {
      return new Uint8Array(0);
    }
  }

  // No decoder available
  return new Uint8Array(0);
};

const b64len = (b64: string): number => decodeBase64ToBytes(b64).length;
const pagesNeeded = (n: number) => Math.max(0, Math.ceil(n / 2048) - 1);

// ---- Size & extra pages ----
const approvalBytes = b64len(DAO_APPROVAL_B64);
const clearBytes = b64len(DAO_CLEAR_B64);
const extraPages = pagesNeeded(Math.max(approvalBytes, clearBytes));

// ---- Exports used by your helpers/hooks ----
export const DAO_SCHEMA = {
  ...DEFAULT_SCHEMA,
  extraPages,
} as const;

export const DAO_META = {
  approvalBytes,
  clearBytes,
} as const;

// (Optional) Early validation — call once at startup for clearer errors.
// export function assertDaoArtifactsValid() {
//   if (!approvalBytes) throw new Error("DAO_APPROVAL_B64 is not valid compiled base64.");
//   if (!clearBytes) throw new Error("DAO_CLEAR_B64 is not valid compiled base64.");
// }