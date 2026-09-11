/* ============ CyberForce DOCX Export v15 ============ */
console.log('CyberForce docx v15 loaded');
document.getElementById('btnDoc').addEventListener('click', async () => {
  const d = window.__CF_LAST_DATA;
  if (!d) { alert('Generate the preview first.'); return; }
  const btn = document.getElementById('btnDoc');
  btn.disabled = true; btn.textContent = 'Generating...';
  try {
    const {
      Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
      Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign
    } = window.docx;

    /* ---------- consistent design tokens ---------- */
    const FONT = 'Calibri';
    const NAVY = '0B2447';
    const GRAY = '666666';
    const LINE = 'D4D6DB';
    const TINT = 'EEF1F6';

    const cellMargin = { top: 60, bottom: 60, left: 100, right: 100 };
    const tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      right: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: LINE },
    };

    const run = (text, o = {}) => new TextRun({ text, font: FONT, bold: o.bold, italics: o.italics, size: o.size, color: o.color });
    const P = (text, o = {}) => new Paragraph({ children: [run(text, o)], spacing: { after: o.after ?? 120 }, alignment: o.align });
    const H = t => new Paragraph({
      children: [new TextRun({ text: t, font: FONT, bold: true, size: 24, color: NAVY })],
      spacing: { before: 260, after: 130 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
    });

    const kvCell = (text, o = {}) => new TableCell({
      width: o.width, shading: o.fill ? { fill: o.fill } : undefined,
      verticalAlign: VerticalAlign.CENTER, margins: cellMargin,
      children: [P(text, { size: 19, after: 0, bold: o.bold })],
    });
    const kvRow = (label, value) => new TableRow({
      children: [
        kvCell(label, { width: { size: 32, type: WidthType.PERCENTAGE }, fill: TINT, bold: true }),
        kvCell(value, { width: { size: 68, type: WidthType.PERCENTAGE } }),
      ],
    });
    const kvTable = rows => {
      const filled = rows.filter(([, v]) => v);
      if (!filled.length) return null;
      return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: tableBorders, rows: filled.map(([l, v]) => kvRow(l, v)) });
    };

    const bytes = dataUrl => { const bin = atob(dataUrl.split(',')[1]); const b = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) b[j] = bin.charCodeAt(j); return b; };
    const imgPara = (dataUrl, w, h, center) => new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new ImageRun({ type: 'png', data: bytes(dataUrl), transformation: { width: w, height: h } })],
      spacing: { after: 100 },
    });

    const children = [];

    /* ---------- title block ---------- */
    children.push(new Paragraph({ children: [new TextRun({ text: 'CYBERFORCE EVIDENCE REPORT', bold: true, font: FONT, size: 34, color: NAVY })], spacing: { after: 100 } }));
    children.push(P('Official Case File — Confidential', { size: 19, italics: true, color: GRAY }));
    children.push(P('Case File No: ' + d.caseId + '   |   Date of Report: ' + d.date, { size: 20 }));

    if (d.suspect.name) {
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
        rows: [new TableRow({ children: [new TableCell({
          shading: { fill: TINT }, margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [new Paragraph({ children: [run('Complaint against:  ', {}), run(d.suspect.name, { bold: true })], spacing: { after: 0 } })],
        })] })],
      }));
      children.push(new Paragraph({ spacing: { after: 120 } }));
    }

    /* ---------- 1. Suspect information ---------- */
    children.push(H('1. Suspect Information'));
    if (d.suspect.photo && d.suspect.photoW) {
      children.push(imgPara(d.suspect.photo, d.suspect.photoW, d.suspect.photoH, true));
      children.push(P('Suspect Photograph', { italics: true, size: 16, color: GRAY, align: AlignmentType.CENTER, after: 160 }));
    }
    const suspectTable = kvTable([
      ['Suspect / Accused Name', d.suspect.name],
      ['Primary Phone Number', d.suspect.phone],
      ['Alternative Number', d.suspect.alt],
      ['Payment Methods', d.suspect.pay],
      ['UPI ID', d.suspect.upi],
      ['Crypto Wallet Address', d.suspect.crypto],
      ['Instagram Username', d.suspect.insta],
      ['Telegram Username', d.suspect.tgUser],
      ['Telegram ID', d.suspect.tgId],
      ['Social Media Accounts', d.suspect.social],
      ['Other (Email / Website / App)', d.suspect.other],
    ]);
    if (suspectTable) children.push(suspectTable);
    children.push(new Paragraph({ spacing: { after: 120 } }));

    /* ---------- 2. Crime details ---------- */
    children.push(H('2. Crime Details'));
    const crimeTable = kvTable([
      ['Crime Type', d.crime.type],
      ['Platform Used', d.crime.platform],
      ['Date and Time of Incident', d.crime.date],
      ['Place of Incident', d.crime.place],
      ['Amount Lost', d.crime.amount],
    ]);
    if (crimeTable) children.push(crimeTable);
    children.push(P('Indicative provisions: IT Act 2000 — S.66, 66C, 66D  ·  IPC — S.420, 468, 471', { size: 16, color: GRAY, italics: true, after: 140 }));

    /* ---------- 3. Statement ---------- */
    children.push(H('3. Statement of Complainant'));
    const descLines = String(d.desc || '—').split(/\n+/);
    descLines.forEach((line, i) => children.push(P(line.trim() || ' ', { after: i === descLines.length - 1 ? 160 : 60 })));

    /* ---------- 4. Officer use ---------- */
    children.push(H('4. Officer Use'));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE }, borders: tableBorders,
      rows: [
        kvRow('Received By (Name / ID)', d.officer.received || '____________________'),
        kvRow('Station / Department / Unit', d.officer.station || '____________________'),
        kvRow('Case Status', d.officer.status || 'Open / Under Investigation / Closed'),
      ],
    }));
    if (d.officer.remarks) { children.push(new Paragraph({ spacing: { after: 100 } })); const rt = kvTable([['Officer Remarks', d.officer.remarks]]); if (rt) children.push(rt); }
    children.push(new Paragraph({
      spacing: { before: 180, after: 160 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } },
      alignment: AlignmentType.CENTER,
      children: [run('VERIFICATION AND STAMP', { bold: true, size: 17, color: GRAY })],
    }));

    /* ---------- 5. Declaration ---------- */
    children.push(H('5. Declaration & Signatures'));
    children.push(P('I hereby declare that the information furnished in this report is true to my knowledge. This report is prepared for submission before the Cyber Cell / concerned police authority. I understand that furnishing false information is a punishable offence.'));
    children.push(P('Complainant: ' + d.decl.name + (d.decl.contact ? '   ·   ' + d.decl.contact : '')));
    children.push(P('Signature: ____________________       Date: ____________________', { after: 200 }));

    /* ---------- Annexure A ---------- */
    children.push(H('Annexure A — Evidence'));
    if (!d.evidence.length) {
      children.push(P('No evidence attached.'));
    } else {
      for (let i = 0; i < d.evidence.length; i++) {
        const e = d.evidence[i];
        children.push(new Paragraph({ children: [run('Exhibit ' + String.fromCharCode(65 + i) + ' - SHA-256: ' + e.hash.slice(0, 16) + '...', { bold: true, size: 18 })], spacing: { before: 160, after: 80 } }));
        children.push(imgPara(e.dataUrl, e.w, e.h, true));
      }
    }

    children.push(new Paragraph({
      spacing: { before: 220 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 8 } },
      children: [run('Case File No. ' + d.caseId + ' · CyberForce Case Report System · National Cyber Crime Helpline: 1930', { size: 16, color: GRAY })],
    }));

    const doc = new Document({
      styles: { default: { document: { run: { font: FONT, size: 20 } } } },
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
        children,
      }],
    });
    const blob = await Packer.toBlob(doc);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = window.CF_CASE_ID + '-cyberforce-evidence-report.docx';
    a.click();
    if (window.saveReportMeta) saveReportMeta(d);
    if (window.CF_TRACK) CF_TRACK('export_docx', d.crime.type);
  } catch (e) { alert('DOC export failed: ' + e.message); }
  btn.disabled = false; btn.textContent = 'Download DOC';
});
