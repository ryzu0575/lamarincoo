import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CVData, SectionKey } from "@/lib/types";
import { contactParts, dateRange, hasPhoto, orderedSections, sectionTitle } from "@/lib/cvFormat";

/** Dokumen PDF dengan text layer asli (font Helvetica bawaan), satu kolom, ramah ATS. */
export function CVPdf({ cv }: { cv: CVData }) {
  const { settings: s, personal: p } = cv;
  const tpl = s.template;
  const accent = tpl === "ats" ? "#111111" : s.accent;
  const fs = s.fontSize;
  const gap = 6 * s.spacing;
  const photo = hasPhoto(cv);

  const st = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: fs, lineHeight: 1.35, color: "#111111", paddingTop: 40, paddingBottom: 40, paddingHorizontal: 44 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4, borderTopWidth: tpl === "modern" ? 5 : 0, borderTopColor: accent, paddingTop: tpl === "modern" ? 10 : 0 },
    name: { fontFamily: "Helvetica-Bold", fontSize: fs * 1.9, color: accent, textAlign: tpl === "modern" || photo ? "left" : "center" },
    title: { fontSize: fs * 1.1, marginTop: 2, textAlign: tpl === "modern" || photo ? "left" : "center" },
    contact: { fontSize: fs * 0.92, marginTop: 3, textAlign: tpl === "modern" || photo ? "left" : "center" },
    photo: { width: 70, height: 70, borderRadius: tpl === "fresh" ? 6 : 35, objectFit: "cover" },
    h2: { fontFamily: "Helvetica-Bold", fontSize: fs * 1.05, color: accent, textTransform: "uppercase", letterSpacing: 0.5, borderBottomWidth: tpl === "ats" ? 0.8 : 1.6, borderBottomColor: accent, paddingBottom: 2, marginTop: gap * 2, marginBottom: 5 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    bold: { fontFamily: "Helvetica-Bold" },
    ital: { fontFamily: "Helvetica-Oblique" },
    block: { marginBottom: gap },
    bullet: { flexDirection: "row", marginTop: 1.5, paddingLeft: 6 },
    dot: { width: 10 },
  });

  const Row = ({ l, r }: { l: string; r?: string }) => (
    <View style={st.row}>
      <Text style={st.bold}>{l}</Text>
      {r ? <Text style={{ fontSize: fs * 0.92 }}>{r}</Text> : null}
    </View>
  );
  const Bullets = ({ items }: { items: string[] }) => (
    <>
      {items.filter(Boolean).map((b, i) => (
        <View key={i} style={st.bullet} wrap={false}>
          <Text style={st.dot}>•</Text>
          <Text style={{ flex: 1 }}>{b}</Text>
        </View>
      ))}
    </>
  );

  const section = (k: SectionKey) => {
    switch (k) {
      case "summary":
        return <Text>{cv.summary}</Text>;
      case "experience":
        return cv.experience.map((e) => (
          <View key={e.id} style={st.block}>
            <Row l={e.role} r={dateRange(e.start, e.end)} />
            <Text style={st.ital}>{[e.company, e.location].filter(Boolean).join(", ")}</Text>
            <Bullets items={e.bullets} />
          </View>
        ));
      case "education":
        return cv.education.map((e) => (
          <View key={e.id} style={st.block}>
            <Row l={e.school} r={dateRange(e.start, e.end)} />
            <Text>{[e.degree, e.gpa && `IPK ${e.gpa}`].filter(Boolean).join(" · ")}</Text>
            {e.notes ? <Text>{e.notes}</Text> : null}
          </View>
        ));
      case "skills":
        return (
          <View>
            {cv.skills.technical.length > 0 && (
              <Text>
                <Text style={st.bold}>Teknis: </Text>
                {cv.skills.technical.join(", ")}
              </Text>
            )}
            {cv.skills.soft.length > 0 && (
              <Text>
                <Text style={st.bold}>Non-teknis: </Text>
                {cv.skills.soft.join(", ")}
              </Text>
            )}
          </View>
        );
      case "projects":
        return cv.projects.map((x) => (
          <View key={x.id} style={st.block}>
            <Row l={x.name} r={x.link} />
            {x.description ? <Text>{x.description}</Text> : null}
            <Bullets items={x.bullets} />
          </View>
        ));
      case "certifications":
        return cv.certifications.map((x) => <Row key={x.id} l={[x.name, x.issuer].filter(Boolean).join(" — ")} r={x.year} />);
      case "organizations":
        return cv.organizations.map((x) => (
          <View key={x.id} style={st.block}>
            <Row l={[x.name, x.role].filter(Boolean).join(" — ")} r={dateRange(x.start, x.end)} />
            {x.description ? <Text>{x.description}</Text> : null}
          </View>
        ));
      case "awards":
        return cv.awards.map((x) => <Row key={x.id} l={[x.name, x.issuer].filter(Boolean).join(" — ")} r={x.year} />);
      case "languages":
        return <Text>{cv.languages.map((l) => [l.name, l.level && `(${l.level})`].filter(Boolean).join(" ")).join(", ")}</Text>;
    }
  };

  return (
    <Document title={`CV ${p.name}`} author={p.name} language="id">
      <Page size={s.paper === "A4" ? "A4" : "LETTER"} style={st.page}>
        <View style={st.header}>
          <View style={{ flex: 1 }}>
            <Text style={st.name}>{p.name || "Nama Lengkap"}</Text>
            {p.title ? <Text style={st.title}>{p.title}</Text> : null}
            <Text style={st.contact}>{contactParts(cv).join("  |  ")}</Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image dari @react-pdf/renderer, bukan <img> */}
          {photo ? <Image src={p.photo} style={st.photo} /> : null}
        </View>
        {orderedSections(cv).map((k) => (
          <View key={k}>
            <Text style={st.h2}>{sectionTitle(k)}</Text>
            {section(k)}
          </View>
        ))}
      </Page>
    </Document>
  );
}
