export function supportLink(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.href;
    if (
      url.protocol === "mailto:" &&
      /^[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(url.pathname)
    )
      return url.href;
  } catch {
    /* Unconfigured or invalid contact keeps the help fallback. */
  }
}
export const supportUrl = supportLink(import.meta.env.VITE_SUPPORT_URL);
