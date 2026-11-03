import { createHash, createHmac } from "node:crypto";

export const SALON_PATH = "/partner/v1/salon";

export interface SignInput {
  keyId: string;
  secret: string;
  timestamp: string;
  nonce: string;
  method?: "GET";
  path?: string;
  query?: string;
  body?: string;
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function canonicalString(i: SignInput): string {
  return ["SALONOS-PARTNER-V1", i.keyId, i.method ?? "GET", i.path ?? SALON_PATH, i.query ?? "", i.timestamp, i.nonce, sha256(i.body ?? "")].join("\n");
}

/** The secret keys the MAC as its own text, exactly as the POS does. */
export function signHeaders(i: SignInput): Record<string, string> {
  return {
    "x-partner-key-id": i.keyId,
    "x-partner-timestamp": i.timestamp,
    "x-partner-nonce": i.nonce,
    "x-partner-signature": createHmac("sha256", i.secret).update(canonicalString(i)).digest("hex"),
  };
}
