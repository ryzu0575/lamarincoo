import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Letter } from "@/lib/schemas";

const st = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.5, color: "#111", padding: 64 },
  right: { textAlign: "right", marginBottom: 14 },
  bold: { fontFamily: "Helvetica-Bold" },
  gap: { marginBottom: 14 },
  p: { textAlign: "justify", marginBottom: 10 },
});

export function LetterPdf({ letter }: { letter: Letter }) {
  return (
    <Document title="Surat Lamaran Kerja" creator="Lamarin" language="id">
      <Page size="A4" style={st.page}>
        <Text style={st.right}>{letter.placeDate}</Text>
        {letter.attachment ? <Text>{letter.attachment}</Text> : null}
        <Text style={[st.bold, st.gap]}>{letter.subject}</Text>
        <Text style={st.gap}>{letter.recipient}</Text>
        <Text style={st.gap}>{letter.salutation}</Text>
        {letter.paragraphs.map((p, i) => (
          <Text key={i} style={st.p}>
            {p}
          </Text>
        ))}
        <View style={{ marginTop: 6 }}>
          <Text>{letter.closing}</Text>
          <Text style={{ marginTop: 44, fontFamily: "Helvetica-Bold" }}>{letter.name}</Text>
        </View>
      </Page>
    </Document>
  );
}
