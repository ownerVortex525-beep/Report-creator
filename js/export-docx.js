/* ============ CyberForce DOCX Export v16 (premium, matches on-screen design) ============ */
console.log('CyberForce docx v16 loaded');
document.getElementById('btnDoc').addEventListener('click', async () => {
  const d = window.__CF_LAST_DATA;
  if (!d) { alert('Generate the preview first.'); return; }
  const btn = document.getElementById('btnDoc');
  btn.disabled = true; btn.textContent = 'Generating...';
  try {
    const {
      Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
      Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign,
    } = window.docx;

    /* ---------- design tokens, matched to the site's CSS ---------- */
    const FONT = 'Calibri';
    const MONO = 'Consolas';
    const TEAL_DARK = '0F4C47';   /* sp-head background   */
    const TEAL_MID = '0D9488';    /* section accent border */
    const TEAL_TEXT = '0F766E';   /* section label text    */
    const TEAL_TINT = 'CCFBF1';   /* section background    */
    const GRAY = '667085';
    const LINE = 'D8DCE3';
    const LABEL_TINT = 'F1F5F9';
    const TRI_A = 'FF9933', TRI_B = 'F5F5F5', TRI_C = '138808';

    const cellMargin = { top: 70, bottom: 70, left: 110, right: 110 };
    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      right: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: LINE },
    };
    const noBorders = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER };

    /* Detect real image type from the data URL — a hardcoded 'png' silently
       failed to embed camera/phone JPEGs, which is why the suspect photo
       never actually showed up in the exported document. */
    const imgType = dataUrl => (dataUrl && dataUrl.indexOf('data:image/png') === 0) ? 'png' : 'jpg';
    const bytes = dataUrl => { const bin = atob(dataUrl.split(',')[1]); const b = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) b[j] = bin.charCodeAt(j); return b; };
    /* Fallback size when the source has no known width/height, so the image
       still gets embedded instead of being skipped. */
    const imgBox = (w, h, maxW, maxH) => {
      let iw = w || maxW, ih = h || Math.round(maxW * 0.75);
      if (iw > maxW) { ih = Math.round(ih * (maxW / iw)); iw = maxW; }
      if (ih > maxH) { iw = Math.round(iw * (maxH / ih)); ih = maxH; }
      return { w: iw, h: ih };
    };

    const run = (text, o = {}) => new TextRun({ text, font: o.mono ? MONO : FONT, bold: o.bold, italics: o.italics, size: o.size, color: o.color });
    const P = (text, o = {}) => new Paragraph({ children: [run(text, o)], spacing: { after: o.after ?? 120 }, alignment: o.align });
    const H = t => new Paragraph({
      children: [new TextRun({ text: t, font: FONT, bold: true, size: 24, color: TEAL_TEXT })],
      spacing: { before: 280, after: 130 },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: TEAL_MID, space: 6 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } },
      indent: { left: 40 },
    });

    const kvCell = (text, o = {}) => new TableCell({
      width: o.width, shading: o.fill ? { fill: o.fill } : undefined,
      verticalAlign: VerticalAlign.CENTER, margins: cellMargin,
      children: [P(text, { size: 19, after: 0, bold: o.bold, mono: o.mono })],
    });
    const kvRow = (label, value, mono) => new TableRow({
      children: [
        kvCell(label, { width: { size: 32, type: WidthType.PERCENTAGE }, fill: LABEL_TINT, bold: true }),
        kvCell(value, { width: { size: 68, type: WidthType.PERCENTAGE }, mono }),
      ],
    });
    const kvTable = rows => {
      const filled = rows.filter(([, v]) => v);
      if (!filled.length) return null;
      return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: tableBorders, rows: filled.map(([l, v, m]) => kvRow(l, v, m)) });
    };

    const imgPara = (dataUrl, w, h, center) => new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new ImageRun({ type: imgType(dataUrl), data: bytes(dataUrl), transformation: { width: w, height: h } })],
      spacing: { after: 100 },
    });

    const children = [];

    /* ---------- letterhead ---------- */
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders,
      rows: [new TableRow({ children: [new TableCell({
        shading: { fill: TEAL_DARK }, margins: { top: 220, bottom: 220, left: 220, right: 220 },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'CYBERFORCE EVIDENCE REPORT', bold: true, font: FONT, size: 32, color: 'FFFFFF' })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: 'OFFICIAL CASE FILE \u2014 CONFIDENTIAL', font: FONT, size: 16, color: '99F6E4' })], spacing: { after: 0 } }),
        ],
      })] })],
    }));
    /* tiny tricolor accent strip under the letterhead */
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders,
      rows: [new TableRow({ children: [
        new TableCell({ width: { size: 34, type: WidthType.PERCENTAGE }, shading: { fill: TRI_A }, children: [new Paragraph('')] }),
        new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, shading: { fill: TRI_B }, children: [new Paragraph('')] }),
        new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, shading: { fill: TRI_C }, children: [new Paragraph('')] }),
      ] })],
    }));
    children.push(new Paragraph({ spacing: { after: 180 } }));

    children.push(P('Case File No: ' + d.caseId + '   |   Date of Report: ' + d.date, { size: 20, color: GRAY }));

    if (d.suspect.name) {
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders,
        rows: [new TableRow({ children: [new TableCell({
          shading: { fill: TEAL_TINT }, margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [new Paragraph({ children: [run('Complaint against:  ', { color: TEAL_TEXT }), run(d.suspect.name, { bold: true, color: TEAL_TEXT })], spacing: { after: 0 } })],
        })] })],
      }));
      children.push(new Paragraph({ spacing: { after: 160 } }));
    }

    /* ---------- 1. Suspect information ---------- */
    children.push(H('1. Suspect Information'));
    if (d.suspect.photo) {
      /* FIX: previously gated on d.suspect.photoW which was never set upstream,
         so the photo silently never rendered. Now always embed with a safe
         fallback box size when dimensions are unknown. */
      const box = imgBox(d.suspect.photoW, d.suspect.photoH, 260, 320);
      children.push(imgPara(d.suspect.photo, box.w, box.h, true));
      children.push(P('Suspect Photograph', { italics: true, size: 16, color: GRAY, align: AlignmentType.CENTER, after: 160 }));
    }
    const suspectTable = kvTable([
      ['Suspect / Accused Name', d.suspect.name],
      ['Primary Phone Number', d.suspect.phone, true],
      ['Alternative Number', d.suspect.alt, true],
      ['Payment Methods', d.suspect.pay, true],
      ['UPI ID', d.suspect.upi, true],
      ['Crypto Wallet Address', d.suspect.crypto, true],
      ['Instagram Username', d.suspect.insta],
      ['Telegram Username', d.suspect.tgUser],
      ['Telegram ID', d.suspect.tgId, true],
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
    children.push(P('Indicative provisions: IT Act 2000 \u2014 S.66, 66C, 66D  \u00b7  IPC \u2014 S.420, 468, 471', { size: 16, color: GRAY, italics: true, after: 140 }));

    /* ---------- 3. Statement ---------- */
    children.push(H('3. Statement of Complainant'));
    const descLines = String(d.desc || '\u2014').split(/\n+/);
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
      spacing: { before: 200, after: 160 },
      border: { top: { style: BorderStyle.DASHED, size: 4, color: LINE, space: 6 }, bottom: { style: BorderStyle.DASHED, size: 4, color: LINE, space: 6 } },
      alignment: AlignmentType.CENTER,
      children: [run('VERIFICATION AND STAMP', { bold: true, size: 17, color: GRAY })],
    }));

    /* ---------- 5. Declaration ---------- */
    children.push(H('5. Declaration & Signatures'));
    children.push(P('I hereby declare that the information furnished in this report is true to my knowledge. This report is prepared for submission before the Cyber Cell / concerned police authority. I understand that furnishing false information is a punishable offence.'));
    children.push(P('Complainant: ' + d.decl.name + (d.decl.contact ? '   \u00b7   ' + d.decl.contact : '')));
    children.push(P('Signature: ____________________       Date: ____________________', { after: 200 }));

    /* ---------- Annexure A — evidence, 2-up grid ---------- */
    children.push(H('Annexure A \u2014 Evidence'));
    if (!d.evidence.length) {
      children.push(P('No evidence attached.'));
    } else {
      for (let i = 0; i < d.evidence.length; i += 2) {
        const pair = [d.evidence[i], d.evidence[i + 1]].filter(Boolean);
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders,
          rows: [new TableRow({ children: pair.map((e, pos) => {
            const idx = i + pos;
            const box = imgBox(e.w, e.h, 240, 260);
            return new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE }, margins: { top: 80, bottom: 80, left: 80, right: 80 },
              children: [
                new Paragraph({ children: [run('Exhibit ' + String.fromCharCode(65 + idx), { bold: true, size: 17, color: TEAL_TEXT })], spacing: { after: 60 } }),
                imgPara(e.dataUrl, box.w, box.h, false),
                P('SHA-256: ' + e.hash.slice(0, 16) + '...', { size: 13, mono: true, color: GRAY, after: 0 }),
              ],
            });
          }) })],
        }));
        children.push(new Paragraph({ spacing: { after: 160 } }));
      }
    }

    children.push(new Paragraph({
      spacing: { before: 220 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 8 } },
      children: [run('Case File No. ' + d.caseId + ' \u00b7 CyberForce Case Report System \u00b7 National Cyber Crime Helpline: 1930', { size: 16, color: GRAY })],
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
