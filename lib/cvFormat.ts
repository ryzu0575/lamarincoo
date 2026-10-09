import { SECTION_TITLES, type CVData, type SectionKey } from "./types";

export const dateRange = (start: string, end: string) =>
  [start, end].filter(Boolean).join(start && end ? " – " : "");

export const contactParts = (cv: CVData) =>
  [cv.personal.email, cv.personal.phone, cv.personal.location, cv.personal.linkedin, cv.personal.portfolio].filter(Boolean);

export const hasPhoto = (cv: CVData) =>
  cv.settings.template !== "ats" && cv.settings.showPhoto && !!cv.personal.photo;

export function sectionHasContent(cv: CVData, k: SectionKey): boolean {
  switch (k) {
    case "summary":
      return !!cv.summary.trim();
    case "skills":
      return cv.skills.technical.length + cv.skills.soft.length > 0;
    default:
      return (cv[k] as unknown[]).length > 0;
  }
}

/** Urutan bagian yang tampil. Template Fresh Graduate menaikkan Pendidikan, Proyek, Organisasi. */
export function orderedSections(cv: CVData): SectionKey[] {
  let order = cv.sectionOrder.filter((k) => sectionHasContent(cv, k));
  if (cv.settings.template === "fresh") {
    const first: SectionKey[] = ["summary", "education", "projects", "organizations"];
    order = [...first.filter((k) => order.includes(k)), ...order.filter((k) => !first.includes(k))];
  }
  return order;
}

export const sectionTitle = (k: SectionKey) => SECTION_TITLES[k];

export function fileBaseName(cv: CVData, prefix = "CV") {
  const n = cv.personal.name.trim().replace(/[^\p{L}\p{N}]+/gu, "_") || "Lamarin";
  return `${prefix}_${n}`;
}
