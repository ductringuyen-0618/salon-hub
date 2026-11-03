import { describe, expect, it } from "vitest";
import { canonicalString, signHeaders } from "./sign.js";

// Vector computed once by running partnerCanonical, partnerBodyHash and partnerSign from
// salon-pos packages/domain/src/partner.ts with this fixed input. Not a real credential.
const input = { keyId: "key_ABCDEFGH12", secret: "test-secret-not-real-0123456789", nonce: "AAAAAAAAAAAAAAAAAAAAAA", timestamp: "1767225600" };
const CANONICAL = "SALONOS-PARTNER-V1\nkey_ABCDEFGH12\nGET\n/partner/v1/salon\n\n1767225600\nAAAAAAAAAAAAAAAAAAAAAA\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const SIGNATURE = "ad5f5bbb288cf37c5a8ecd5feed648ec3d925a9c1e3261a22399e4e356346dce";

describe("signing matches the POS", () => {
  it("builds the POS canonical string", () => {
    expect(canonicalString(input)).toBe(CANONICAL);
  });

  it("produces the POS headers", () => {
    expect(signHeaders(input)).toEqual({
      "x-partner-key-id": "key_ABCDEFGH12",
      "x-partner-timestamp": "1767225600",
      "x-partner-nonce": "AAAAAAAAAAAAAAAAAAAAAA",
      "x-partner-signature": SIGNATURE,
    });
  });

  it.each([
    ["secret", { secret: "other-secret-not-real-0123456789" }],
    ["timestamp", { timestamp: "1767225601" }],
    ["nonce", { nonce: "BBBBBBBBBBBBBBBBBBBBBB" }],
    ["key id", { keyId: "key_ABCDEFGH13" }],
    ["path", { path: "/partner/v1/other" }],
    ["query", { query: "a=1" }],
    ["body", { body: "x" }],
  ])("changes the signature when the %s changes", (_name, change) => {
    expect(signHeaders({ ...input, ...change })["x-partner-signature"]).not.toBe(SIGNATURE);
  });
});
