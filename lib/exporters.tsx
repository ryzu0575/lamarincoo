import type { CVData, SectionKey } from "./types";
import type { Letter } from "./schemas";
import { contactParts, dateRange, fileBaseName, orderedSections, sectionTitle } from "./cvFormat";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function exportCvPdf(cv: CVData) {
  const [{ pdf }, { CVPdf }] = await Promise.all([import("@react-pdf/renderer"), import("@/templates/CVPdf")]);
  const blob = await pdf(<CVPdf cv={cv} />).toBlob();
  download(blob, `${fileBaseName(cv)}.pdf`);
}

export async function exportLetterPdf(letter: Letter, name = "Surat_Lamaran") {
  const [{ pdf }, { LetterPdf }] = await Promise.all([import("@react-pdf/renderer"), import("@/templates/LetterPdf")]);
  const blob = await pdf(<LetterPdf letter={letter} />).toBlob();
  download(blob, `${name}.pdf`);
}

const PAPER = {
  A4: { width: 11906, height: 16838 },
  Letter: { width: 12240, height: 15840 },
};
const MARGIN = 1000;

export async function exportCvDocx(cv: CVData) {
  const d = await import("docx");
  const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TabStopType } = d;
  const s = cv.settings;
  const size = Math.round(s.fontSize * 2);
  const paper = PAPER[s.paper];
  const textWidth = paper.width - MARGIN * 2;
  const font = "Arial";
  const accent = (s.template === "ats" ? "111111" : s.accent.replace("#", "")).toUpperCase();
  const sp = Math.round(60 * s.spacing);

  const run = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) =>
    new TextRun({ text, font, size: o.size ?? size, bold: o.bold, italics: o.italics, color: o.color });

  const heading = (k: SectionKey) =>
    new Paragraph({
      spacing: { before: 220, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent, space: 2 } },
      children: [run(sectionTitle(k).toUpperCase(), { bold: true, color: accent, size: Math.round(size * 1.05) })],
    });

  const row = (l: string, r?: string) =>
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: textWidth }],
      children: [run(l, { bold: true }), ...(r ? [run("\t" + r, { size: Math.round(size * 0.92) })] : [])],
    });

  const bullets = (items: string[]) =>
    items.filter(Boolean).map((b) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 20 }, children: [run(b)] }));

  const body = (k: SectionKey) => {
    const out: InstanceType<typeof Paragraph>[] = [];
    switch (k) {
      case "summary":
        out.push(new Paragraph({ children: [run(cv.summary)] }));
        break;
      case "experience":
        cv.experience.forEach((e) => {
          out.push(row(e.role, dateRange(e.start, e.end)));
          out.push(new Paragraph({ children: [run([e.company, e.location].filter(Boolean).join(", "), { italics: true })] }));
          out.push(...bullets(e.bullets));
          out.push(new Paragraph({ spacing: { after: sp }, children: [] }));
        });
        break;
      case "education":
        cv.education.forEach((e) => {
          out.push(row(e.school, dateRange(e.start, e.end)));
          out.push(new Paragraph({ children: [run([e.degree, e.gpa && `IPK ${e.gpa}`].filter(Boolean).join(" · "))] }));
          if (e.notes) out.push(new Paragraph({ children: [run(e.notes)] }));
          out.push(new Paragraph({ spacing: { after: sp }, children: [] }));
        });
        break;
      case "skills":
        if (cv.skills.technical.length)
          out.push(new Paragraph({ children: [run("Teknis: ", { bold: true }), run(cv.skills.technical.join(", "))] }));
        if (cv.skills.soft.length)
          out.push(new Paragraph({ children: [run("Non-teknis: ", { bold: true }), run(cv.skills.soft.join(", "))] }));
        break;
      case "projects":
        cv.projects.forEach((x) => {
          out.push(row(x.name, x.link));
          if (x.description) out.push(new Paragraph({ children: [run(x.description)] }));
          out.push(...bullets(x.bullets));
          out.push(new Paragraph({ spacing: { after: sp }, children: [] }));
        });
        break;
      case "certifications":
        cv.certifications.forEach((x) => out.push(row([x.name, x.issuer].filter(Boolean).join(" — "), x.year)));
        break;
      case "organizations":
        cv.organizations.forEach((x) => {
          out.push(row([x.name, x.role].filter(Boolean).join(" — "), dateRange(x.start, x.end)));
          if (x.description) out.push(new Paragraph({ children: [run(x.description)] }));
        });
        break;
      case "awards":
        cv.awards.forEach((x) => out.push(row([x.name, x.issuer].filter(Boolean).join(" — "), x.year)));
        break;
      case "languages":
        out.push(
          new Paragraph({ children: [run(cv.languages.map((l) => [l.name, l.level && `(${l.level})`].filter(Boolean).join(" ")).join(", "))] }),
        );
        break;
    }
    return out;
  };

  const align = s.template === "modern" ? AlignmentType.LEFT : AlignmentType.CENTER;
  const children = [
    new Paragraph({ alignment: align, children: [run(cv.personal.name || "Nama Lengkap", { bold: true, size: Math.round(size * 1.9), color: accent })] }),
    ...(cv.personal.title ? [new Paragraph({ alignment: align, children: [run(cv.personal.title, { size: Math.round(size * 1.1) })] })] : []),
    new Paragraph({ alignment: align, children: [run(contactParts(cv).join("  |  "), { size: Math.round(size * 0.92) })] }),
    ...orderedSections(cv).flatMap((k) => [heading(k), ...body(k)]),
  ];

  const doc = new Document({
    creator: "Lamarin",
    title: `CV ${cv.personal.name}`,
    sections: [
      {
        properties: { page: { size: { width: paper.width, height: paper.height }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
        children,
      },
    ],
  });
  download(await Packer.toBlob(doc), `${fileBaseName(cv)}.docx`);
}

export async function exportLetterDocx(letter: Letter, name = "Surat_Lamaran") {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const run = (t: string, bold = false) => new TextRun({ text: t, font: "Arial", size: 22, bold });
  const line = (t: string, o: { right?: boolean; bold?: boolean; after?: number } = {}) =>
    new Paragraph({ alignment: o.right ? AlignmentType.RIGHT : AlignmentType.LEFT, spacing: { after: o.after ?? 0 }, children: [run(t, o.bold)] });

  const children = [
    line(letter.placeDate, { right: true, after: 200 }),
    ...(letter.attachment ? [line(letter.attachment)] : []),
    line(letter.subject, { bold: true, after: 200 }),
    ...letter.recipient.split("\n").map((t, i, a) => line(t, { after: i === a.length - 1 ? 200 : 0 })),
    line(letter.salutation, { after: 160 }),
    ...letter.paragraphs.map(
      (p) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 160, line: 300 }, children: [run(p)] }),
    ),
    line(letter.closing, { after: 700 }),
    line(letter.name, { bold: true }),
  ];
  const doc = new Document({
    creator: "Lamarin",
    sections: [{ properties: { page: { size: PAPER.A4, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children }],
  });
  download(await Packer.toBlob(doc), `${name}.docx`);
}
