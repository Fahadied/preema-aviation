/** Site-wide imagery (Wikimedia Commons, licences recorded for attribution). Destination images live in the database. */
export const SITE_IMAGES = {
  hero: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Cappadocia_Aerial_View_Landscape.jpg/1920px-Cappadocia_Aerial_View_Landscape.jpg",
    alt: "Hot-air balloons drifting over the valleys of Cappadocia at sunrise",
    credit: "Benh LIEU SONG, CC BY-SA 4.0, via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:Cappadocia_Aerial_View_Landscape.jpg",
  },
  corporate: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Hazrat_Shahjalal_International_Airport_Terminal_2_-_Dec_2019.jpg/1920px-Hazrat_Shahjalal_International_Airport_Terminal_2_-_Dec_2019.jpg",
    alt: "Hazrat Shahjalal International Airport, Dhaka",
    credit: "Tms masum, CC BY-SA 4.0, via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:Hazrat_Shahjalal_International_Airport_Terminal_2_-_Dec_2019.jpg",
  },
  about: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Ratargul-02.jpg/1920px-Ratargul-02.jpg",
    alt: "A wooden boat gliding through the flooded Ratargul swamp forest in Sylhet",
    credit: "Abdulmominbd, CC BY-SA 4.0, via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:Ratargul-02.jpg",
  },
} as const;

/** next/image can only optimise hosts listed in next.config.ts; other admin-entered URLs are served as-is. */
export function optimizable(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const host = new URL(url).hostname;
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
    return host === "upload.wikimedia.org" || (supabaseHost !== "" && host === supabaseHost);
  } catch {
    return false;
  }
}
