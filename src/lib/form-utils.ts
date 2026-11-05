export const text = (fd: FormData, k: string): string => String(fd.get(k) ?? "").trim();
export const textOrNull = (fd: FormData, k: string): string | null => text(fd, k) || null;
export const checked = (fd: FormData, k: string): boolean => fd.get(k) === "on" || fd.get(k) === "true";
export const intOrNull = (fd: FormData, k: string): number | null => {
  const v = text(fd, k);
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};
export const numOrNull = (fd: FormData, k: string): number | null => {
  const v = text(fd, k).replace(/,/g, "");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
export const dateOrNull = (fd: FormData, k: string): string | null => {
  const v = text(fd, k);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
};
/** One item per line. */
export const lines = (fd: FormData, k: string): string[] =>
  text(fd, k)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
/** "a | b | c" per line. */
export const pipeRows = (fd: FormData, k: string): string[][] => lines(fd, k).map((l) => l.split("|").map((p) => p.trim()));
export const httpsUrlOrNull = (v: string | null): string | null => {
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return v.startsWith("/") ? v : null;
  }
};
