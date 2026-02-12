export function sanitizeCrudError(error: unknown, fallback = "Ocorreu um erro ao processar a operação.") {
  if (!(error instanceof Error)) return fallback;

  const normalized = error.message
    .replace(/\s+/g, " ")
    .replace(/(password|secret|token)=\S+/gi, "$1=***")
    .trim();

  if (!normalized) return fallback;
  return normalized.length > 280 ? `${normalized.slice(0, 280)}...` : normalized;
}

export function isNextRedirectError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
