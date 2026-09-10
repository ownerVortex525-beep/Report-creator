/* ============ CyberForce DOCX Export v16 ============ */
console.log('CyberForce docx v16 loaded');

document.getElementById('btnDoc').addEventListener('click', async () => {
  const d = window.__CF_LAST_DATA;
  if (!d) { alert('Please generate the preview first.'); return; }

  const btn = document.getElementById('btnDoc');
  const origText = btn.textContent;
  btn.disabled = true; 
  btn.textContent = 'Generating DOCX...';

  try {
    const docxLib = window.docx;
    if (!docxLib) { throw new Error('DOCX library not loaded. Please check script imports.'); }

    const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } = docxLib;

    const noBorders = {
      top: { style: BorderStyle.NONE, size: 0, color: "AUTO" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "AUTO" },
      left: { style: BorderStyle.NONE, size: 0, color: "AUTO" },
      right: { style: BorderStyle.NONE, size: 0, color: "AUTO" }
    };

    const tableBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" }
    };

    const bytes = dataUrl => {
      if (!dataUrl || !dataUrl.includes(',')) return null;
      try {
        const bin = atob(dataUrl.split(',')[1]);
        const b = new Uint8Array(bin.length);
        for (let j = 0; j < bin.length; j++) b[j] = bin.charCodeAt(j);
        return b;
      } catch(e) { return null; }
    };

    const sectionHeader = (num, title) => new Paragraph({
      children: [
        new TextRun({ text: num + '. ', bold: true, size: 20, color: "38BDF8", font: "Arial" }),
        new TextRun({ text: title.toUpperCase(), bold: true, size: 20, color: "FFFFFF", font: "Arial" })
      ],
      shading: { fill: "0F172A" },
      spacing: { before: 180, after: 120 }
    });

    const createRow = (label, val, isMono) => {
      if (!val) return null;
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            shading: { fill: "F8FAFC" },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 17, color: "334155", font: "Arial" })] })],
            borders: tableBorder
          }),
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: String(val), size: 17, color: "0F172A", font: isMono ? "Courier New" : "Arial" })] })],
            borders: tableBorder
          })
        ]
      });
    };

    const buildDataGrid = (arr) => {
      const rows = arr.map(([l, v, m]) => createRow(l, v, m)).filter(Boolean);
      if (!rows.length) return new Paragraph({ text: 'No data provided.', spacing: { after: 100 } });
      return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
    };

    const children = [];

    // Masthead Header
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'CYBER', bold: true, size: 32, color: "0F172A", font: "Arial" }),
        new TextRun({ text: 'FORCE', size: 32, color: "0284C7", font: "Arial" }),
        new TextRun({ text: '  |  OFFICIAL EVIDENCE REPORT', bold: true, size: 20, color: "64748B", font: "Arial" })
      ],
      spacing: { after: 40 }
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'National Cyber Crime Investigation Network  Â·  Case Ref: [' + d.caseId + ']', size: 16, color: "475569", font: "Arial" })],
      spacing: { after: 160 }
    }));

    // Section 1: Suspect Information
    children.push(sectionHeader('01', 'Suspect & Accused Information'));
    
    if (d.suspect.photo) {
      const photoBytes = bytes(d.suspect.photo);
      if (photoBytes) {
        children.push(new Paragraph({
          children: [new ImageRun({ type: 'png', data: photoBytes, transformation: { width: 110, height: 125 } })],
          spacing: { after: 80 }
        }));
      }
    }

    children.push(buildDataGrid([
      ['Full Name / Alias', d.suspect.name],
      ['Primary Phone', d.suspect.phone, true],
      ['Alternative Number', d.suspect.alt, true],
      ['Payment Methods / Gateways', d.suspect.pay, true],
      ['UPI ID', d.suspect.upi, true],
      ['Crypto Wallet Address', d.suspect.crypto, true],
      ['Instagram Username', d.suspect.insta],
      ['Telegram Username', d.suspect.tgUser, true],
      ['Telegram ID', d.suspect.tgId, true],
      ['Social Media Accounts', d.suspect.social],
      ['Other Tokens (Email / Web)', d.suspect.other]
    ]));

    // Section 2: Crime Details
    children.push(sectionHeader('02', 'Incident & Financial Crime Details'));
    children.push(buildDataGrid([
      ['Category of Crime', d.crime.type],
      ['Platform Used', d.crime.platform],
      ['Date & Time of Incident', d.crime.date],
      ['Jurisdiction / Location', d.crime.place],
      ['Total Amount Lost', d.crime.amount]
    ]));

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Statutory Provisions: IT Act, 2000 â€” S.66, 66C, 66D Â· Bharatiya Nyaya Sanhita (BNS) â€” S.318(4), 336(3)', italics: true, size: 15, color: "64748B", font: "Arial" })],
      spacing: { before: 80, after: 140 }
    }));

    // Section 3: Complainant Statement
    children.push(sectionHeader('03', 'Sworn Statement of Complainant'));
    children.push(new Paragraph({
      children: [new TextRun({ text: d.desc || 'No statement recorded.', size: 17, color: "1E293B", font: "Arial" })],
      spacing: { after: 160 }
    }));

    // Section 4: Officer Use
    children.push(sectionHeader('04', 'Officer Log & Case Verification'));
    children.push(buildDataGrid([
      ['Receiving Officer / ID', d.officer.received || 'Insp. Vikram Singh (ID: CY-4402)'],
      ['Station / Unit', d.officer.station || 'Special Cyber Crime Unit, Zone-4'],
      ['Current Case Status', d.officer.status || 'Active / Under FIR Registration'],
      ['Investigating Remarks', d.officer.remarks || 'Payment trail analysis under process. Bank freeze request initiated.']
    ]));

    // Section 5: Declaration & Signatures
    children.push(sectionHeader('05', 'Declaration & Signatures'));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'I hereby declare that the information provided above is true and complete to the best of my knowledge. Furnishing false information in criminal investigation is a punishable offense under law.', italics: true, size: 15, color: "475569", font: "Arial" })],
      spacing: { after: 100 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Complainant: ' + (d.decl.name || '[Ramesh Sharma]') + (d.decl.contact ? ' (' + d.decl.contact + ')' : ''), bold: true, size: 17, font: "Arial" }),
        new TextRun({ text: '   |   Signature: ____________________   |   Date: ____/____/2026', size: 17, font: "Arial" })
      ],
      spacing: { after: 200 }
    }));

    // Annexure A: Evidence Exhibits
    if (d.evidence && d.evidence.length > 0) {
      children.push(sectionHeader('Annexure A', 'Documentary Evidence & Exhibits'));
      for (let i = 0; i < d.evidence.length; i++) {
        const e = d.evidence[i];
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Exhibit ' + String.fromCharCode(65 + i) + ' â€” SHA-256: ' + (e.hash ? e.hash : 'N/A'), bold: true, size: 16, color: "0F172A", font: "Courier New" })],
          spacing: { before: 80, after: 40 }
        }));
        if (e.dataUrl) {
          const imgB = bytes(e.dataUrl);
          if (imgB) {
            children.push(new Paragraph({
              children: [new ImageRun({ type: 'png', data: imgB, transformation: { width: Math.min(e.w || 220, 320), height: Math.min(e.h || 160, 220) } })],
              spacing: { after: 100 }
            }));
          }
        }
      }
    }

    children.push(new Paragraph({
      children: [new TextRun({ text: 'Case File Ref: [' + d.caseId + '] Â· Confidential & Legal Evidence Â· CyberForce Investigation Network', size: 15, color: "64748B", font: "Arial" })],
      spacing: { before: 200 }
    }));

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = (d.caseId || 'CYBERFORCE') + '-evidence-report.docx';
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

    if (window.saveReportMeta) saveReportMeta(d);
    if (window.CF_TRACK) CF_TRACK('export_docx', d.crime?.type);
  } catch (e) {
    console.error('DOCX Export Error:', e);
    alert('DOCX export failed: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = origText;
  }
});
