export const strictBody = (
  body: any,
  allowed: string[],
  required: string[]
) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "body must be a JSON object" as const };
  }

  // ห้ามมี key เกิน
  const extraKeys = Object.keys(body).filter((k) => !allowed.includes(k));
  if (extraKeys.length > 0) {
    return { ok: false, error: `unexpected fields: ${extraKeys.join(", ")}` as const };
  }

  // ห้ามขาด required
  const missing = required.filter(
    (k) => body[k] === undefined || body[k] === null || body[k] === ""
  );
  if (missing.length > 0) {
    return { ok: false, error: `missing required fields: ${missing.join(", ")}` as const };
  }

  return { ok: true as const };
};