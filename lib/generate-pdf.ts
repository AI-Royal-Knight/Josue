// ─── Minimal PDF generator ───────────────────────────────────────────────
// Generates a valid PDF from scratch (no library required) that browsers
// can render natively.

/**
 * Defines the content of a simple one-page PDF document.
 */
export type PdfDocConfig = {
    /** Large heading at the top (e.g. "INVOICE", "PURCHASE ORDER") */
    title: string
    /** Optional subtitle / document number (e.g. "INV-001") */
    subtitle?: string
    /** Key-value pairs shown below the title (e.g. Date, Project, Status) */
    headerFields: { label: string; value: string }[]
    /** Detail rows shown as a simple two-column table */
    detailFields: { label: string; value: string }[]
    /** Label for the total row at the bottom (e.g. "Total", "PO Total") */
    totalLabel: string
    /** Value for the total row */
    totalValue: string
    /** Optional footer text */
    footer?: string
}

function escapePdfString(s: string): string {
    return s
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
}

function buildContentStream(doc: PdfDocConfig): string {
    const t = escapePdfString(doc.title)
    const sub = doc.subtitle ? escapePdfString(doc.subtitle) : ""
    const footer = doc.footer ? escapePdfString(doc.footer) : ""
    const tl = escapePdfString(doc.totalLabel)
    const tv = escapePdfString(doc.totalValue)

    const lines: string[] = [
        "BT",
        // Title
        "/F1 28 Tf",
        "50 750 Td",
        `(${t}) Tj`,
    ]

    // Subtitle
    if (sub) {
        lines.push("/F1 8 Tf", "0 -24 Td", `(${sub}) Tj`)
    }

    // Header fields
    lines.push("/F1 8 Tf")
    for (const h of doc.headerFields) {
        const hl = escapePdfString(h.label)
        const hv = escapePdfString(h.value)
        lines.push("0 -16 Td", `(${hl}: ${hv}) Tj`)
    }

    // Separator
    lines.push(
        "0 -24 Td",
        "/F1 6 Tf",
        "(________________________________________________) Tj"
    )

    // Detail rows
    lines.push("/F1 10 Tf")
    lines.push("0 -20 Td", "(Description)Tj", "280 0 Td", "(Value)Tj", "-280 0 Td")

    lines.push("/F1 9 Tf")
    for (const d of doc.detailFields) {
        const dl = escapePdfString(d.label)
        const dv = escapePdfString(d.value)
        lines.push("0 -16 Td", `(${dl}) Tj`, "280 0 Td", `(${dv}) Tj`, "-280 0 Td")
    }

    // Separator
    lines.push(
        "0 -20 Td",
        "/F1 6 Tf",
        "(________________________________________________) Tj"
    )

    // Total
    lines.push(
        "0 -24 Td",
        "/F1 12 Tf",
        `(${tl}) Tj`,
        "280 0 Td",
        `(${tv}) Tj`,
        "-280 0 Td"
    )

    // Footer
    if (footer) {
        lines.push(
            "0 -40 Td",
            "/F1 8 Tf",
            `(${footer}) Tj`
        )
    }

    lines.push("ET")
    return lines.join("\n")
}

/**
 * Generates a minimal, valid PDF Blob from the given config.
 * The PDF is rendered as a single-page document with basic styling.
 */
export function generateSimplePdf(doc: PdfDocConfig): Blob {
    const content = buildContentStream(doc)
    const contentLength = content.length

    const xrefEntries = [
        "0000000000 65535 f",
        "0000000009 00000 n",
        "0000000058 00000 n",
        "0000000115 00000 n",
        `000000${String(contentLength + 9).padStart(10, "0")} 00000 n`,
        `000000${String(contentLength + 58).padStart(10, "0")} 00000 n`,
    ].join("\n")

    // Approximate position of the xref table (after 5 objects + stream content)
    const xrefOffset = 9 + 49 + 57 + contentLength + 49 + 49 + 95
    const startxref = `startxref\n${xrefOffset}\n%%EOF`

    const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${contentLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
${xrefEntries}
trailer
<< /Size 6 /Root 1 0 R >>
${startxref}`

    return new Blob([pdf], { type: "application/pdf" })
}
