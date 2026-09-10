/* ============ CyberForce DOCX Export v15 ============ */
console.log('CyberForce docx v15 loaded');

document.getElementById('btnDoc').addEventListener('click', async () => {
  const d = window.__CF_LAST_DATA;
  if (!d) { alert('Generate the preview first.'); return; }

  const btn = document.getElementById('btnDoc');
  btn.disabled = true; 
  btn.textContent = 'Generating DOCX...';

  try {
    const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } = window.docx;

    const noBorders = {
      top: { style: BorderStyle.NONE, size: 0, color: "AUTO" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "AUTO" },
      left: { style: BorderStyle.NONE, size: 0, color: "AUTO" },
      right: { style: BorderStyle.NONE, size: 0, color: "AUTO" }
    };

    const lightBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      left: { style: BorderStyle.NONE, size: 0, color: "AUTO" },
      right: { style: BorderStyle.NONE, size: 0, color: "AUTO" }
    };

    const H = (t) => new Paragraph({
      children: [new TextRun({ text: t, bold: true, size: 22, color: "0E7490", font: "Calibri" })],
      spacing: { before: 240, after: 120 }
    });

    const createTableRow = (label, value) => {
      if (!value) return null;
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: "475569", font: "Calibri" })] })],
            borders: lightBorder
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: String(value), size: 18, color: "0F172A", font: "Calibri" })] })],
            borders: lightBorder
          })
        ]
      });
    };

    const buildTable = (dataArr) => {
      const rows = dataArr.map(([l, v]) => createTableRow(l, v)).filter(Boolean);
      if (rows.length === 0) return new Paragraph({ text: 'None', spacing: { after: 100 } });
      return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
    };

    const bytes = dataUrl => {
      const bin = atob(dataUrl.split(',')[1]);
      const b = new Uint8Array(bin.length);
      for (let j = 0; j < bin.length; j++) b[j] = bin.charCodeAt(j);
      return b;
    };

    const children = [];

    // Title Section
    children.push(new Paragraph({
      children: [new TextRun({ text: 'CYBERFORCE EVIDENCE REPORT', bold: true, size: 30, color: "0F172A", font: "Calibri" })],
      spacing: { after: 40 }
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Official Case File — Confidential', italics: true, size: 18, color: "64748B", font: "Calibri" })],
      spacing: { after: 120 }
    }));

    // Metadata Table
    children.push(buildTable([
      ['Case File No', d.caseId],
      ['Date of Report', d.date],
      ['Complaint Against', d.suspect.name || 'Unidentified / Unknown']
    ]));

    // 1. Suspect Info
    children.push(H('1. Suspect Information'));
    if (d.suspect.photo && d.suspect.photoW) {
      children.push(new Paragraph({
        children: [new ImageRun({ type: 'png', data: bytes(d.suspect.photo), transformation: { width: d.suspect.photoW, height: d.suspect.photoH } })],
        spacing: { after: 100 }
      }));
    }
    children.push(buildTable([
      ['Primary Phone Number', d.suspect.phone],
      ['Alternative Number', d.suspect.alt],
      ['Payment Methods', d.suspect.pay],
      ['UPI ID', d.suspect.upi],
      ['Crypto Wallet Address', d.suspect.crypto],
      ['Instagram Username', d.suspect.insta],
      ['Telegram Username', d.suspect.tgUser],
      ['Telegram ID', d.suspect.tgId],
      ['Social Media Accounts', d.suspect.social],
      ['Other (Email / Web / App)', d.suspect.other]
    ]));

    // 2. Crime Details
    children.push(H('2. Crime Details'));
    children.push(buildTable([
      ['Crime Type', d.crime.type],
      ['Platform Used', d.crime.platform],
      ['Date and Time of Incident', d.crime.date],
      ['Place of Incident', d.crime.place],
      ['Amount Lost', d.crime.amount]
    ]));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Indicative provisions: Information Technology Act, 2000 — S.66, 66C, 66D · IPC — S.420, 468, 471', size: 16, color: '64748B', font: 'Calibri' })],
      spacing: { before: 80, after: 120 }
    }));

    // 3. Statement of Complainant
    children.push(H('3. Statement of Complainant'));
    children.push(new Paragraph({
      children: [new TextRun({ text: d.desc || 'No description provided.', size: 18, color: '0F172A', font: 'Calibri' })],
      spacing: { after: 140 }
    }));

    // 4. Officer Log
    children.push(H('4. Officer Use & Verification'));
    children.push(buildTable([
      ['Received By (Name / ID)', d.officer.received || '____________________'],
      ['Station / Department / Unit', d.officer.station || '____________________'],
      ['Case Status', d.officer.status || 'Open / Under Investigation / Closed'],
      ['Officer Remarks', d.officer.remarks || 'None']
    ]));

    // 5. Declaration
    children.push(H('5. Declaration & Signatures'));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'I hereby declare that the information furnished in this report is true to my knowledge. This report is prepared for submission before the Cyber Cell / concerned police authority.', italics: true, size: 18, color: '475569', font: 'Calibri' })],
      spacing: { after: 120 }
    }));
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Complainant: ' + d.decl.name + (d.decl.contact ? ' · ' + d.decl.contact : ''), bold: true, size: 18, font: 'Calibri' }),
        new TextRun({ text: '    |    Signature: ____________________    |    Date: ____________________', size: 18, font: 'Calibri' })
      ],
      spacing: { after: 180 }
    }));

    // Annexure A - Evidence
    children.push(H('Annexure A — Documentary Evidence'));
    if (!d.evidence || !d.evidence.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: 'No evidence attached.', size: 18, italics: true, font: 'Calibri' })] }));
    } else {
      for (let i = 0; i < d.evidence.length; i++) {
        const e = d.evidence[i];
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Exhibit ' + String.fromCharCode(65 + i) + ' - SHA-256: ' + (e.hash ? e.hash.slice(0, 24) : 'N/A') + '...', bold: true, size: 18, font: 'Calibri' })],
          spacing: { before: 100, after: 60 }
        }));
        if (e.dataUrl && e.w && e.h) {
          children.push(new Paragraph({
            children: [new ImageRun({ type: 'png', data: bytes(e.dataUrl), transformation: { width: Math.min(e.w, 400), height: Math.min(e.h, 300) } })],
            spacing: { after: 120 }
          }));
        }
      }
    }

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Case File No. ' + d.caseId + ' · CyberForce Case Report System · National Cyber Crime Helpline: 1930', size: 16, color: '94A3B8', font: 'Calibri' })],
      spacing: { before: 240 }
    }));

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${window.CF_CASE_ID}-cyberforce-evidence-report.docx`;
    a.click();

    if (window.saveReportMeta) saveReportMeta(d);
    if (window.CF_TRACK) CF_TRACK('export_docx', d.crime.type);
  } catch (e) {
    console.error(e);
    alert('DOCX export failed: ' + e.message);
  }

  btn.disabled = false;
  btn.textContent = 'Download DOC';
});