export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "organizations"
  | "awards"
  | "languages";

export type TemplateId = "ats" | "modern" | "photo" | "fresh";

export interface CVData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    photo: string;
  };
  summary: string;
  experience: { id: string; role: string; company: string; location: string; start: string; end: string; bullets: string[] }[];
  education: { id: string; school: string; degree: string; start: string; end: string; gpa: string; notes: string }[];
  skills: { technical: string[]; soft: string[] };
  projects: { id: string; name: string; link: string; description: string; bullets: string[] }[];
  certifications: { id: string; name: string; issuer: string; year: string }[];
  organizations: { id: string; name: string; role: string; start: string; end: string; description: string }[];
  awards: { id: string; name: string; issuer: string; year: string }[];
  languages: { id: string; name: string; level: string }[];
  sectionOrder: SectionKey[];
  settings: {
    template: TemplateId;
    paper: "A4" | "Letter";
    accent: string;
    fontSize: number;
    spacing: number;
    showPhoto: boolean;
  };
}

export const DEFAULT_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "organizations",
  "awards",
  "languages",
];

export const SECTION_TITLES: Record<SectionKey, string> = {
  summary: "Ringkasan Profil",
  experience: "Pengalaman Kerja",
  education: "Pendidikan",
  skills: "Keahlian",
  projects: "Proyek",
  certifications: "Sertifikasi",
  organizations: "Organisasi",
  awards: "Penghargaan",
  languages: "Bahasa",
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyCV = (): CVData => ({
  personal: { name: "", title: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", photo: "" },
  summary: "",
  experience: [],
  education: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
  organizations: [],
  awards: [],
  languages: [],
  sectionOrder: [...DEFAULT_ORDER],
  settings: { template: "ats", paper: "A4", accent: "#6b54d6", fontSize: 10.5, spacing: 1, showPhoto: false },
});

/** Normalisasi data parsial (mis. dari AI) menjadi CVData lengkap. */
export function normalizeCV(input: unknown): CVData {
  const base = emptyCV();
  const src = (input ?? {}) as Partial<CVData> & Record<string, unknown>;
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const withId = <T extends { id?: string }>(list: T[]) => list.map((i) => ({ ...i, id: i.id || uid() }));
  return {
    ...base,
    personal: { ...base.personal, ...(src.personal ?? {}) },
    summary: typeof src.summary === "string" ? src.summary : "",
    experience: withId(arr<CVData["experience"][number]>(src.experience)).map((e) => ({ ...e, bullets: arr<string>(e.bullets) })),
    education: withId(arr<CVData["education"][number]>(src.education)),
    skills: {
      technical: arr<string>(src.skills?.technical),
      soft: arr<string>(src.skills?.soft),
    },
    projects: withId(arr<CVData["projects"][number]>(src.projects)).map((p) => ({ ...p, bullets: arr<string>(p.bullets) })),
    certifications: withId(arr<CVData["certifications"][number]>(src.certifications)),
    organizations: withId(arr<CVData["organizations"][number]>(src.organizations)),
    awards: withId(arr<CVData["awards"][number]>(src.awards)),
    languages: withId(arr<CVData["languages"][number]>(src.languages)),
    sectionOrder: Array.isArray(src.sectionOrder) && src.sectionOrder.length ? (src.sectionOrder as SectionKey[]) : base.sectionOrder,
    settings: { ...base.settings, ...(src.settings ?? {}) },
  };
}
