function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  siteUrl: () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  showDemo: () => process.env.NEXT_PUBLIC_SHOW_DEMO_CONTENT === "true",
  allowIndexing: () => process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  submitSecret: () => process.env.INQUIRY_SUBMIT_SECRET || "",
  ipSalt: () => process.env.IP_HASH_SALT || process.env.INQUIRY_SUBMIT_SECRET || "",
  resendKey: () => process.env.RESEND_API_KEY || "",
  notifyFrom: () => process.env.NOTIFY_FROM_EMAIL || "",
};
