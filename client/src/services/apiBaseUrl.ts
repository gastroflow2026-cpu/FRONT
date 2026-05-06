const normalizeBaseUrl = (url?: string | null) => {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
};

export const getApiBaseUrl = () => {
  const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return base;
};
