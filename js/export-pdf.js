/* ============ CyberForce PDF Export v14 (High Quality Native Layout) ============ */
console.log('CyberForce pdf v14 loaded');

document.getElementById('btnPdf').addEventListener('click', async () => {
  const btn = document.getElementById('btnPdf');
  const d = window.__CF_LAST_DATA;
  if (!d) { alert('Generate the preview first.'); return; }

  btn.disabled = true; 
  btn.textContent = 'Generating PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const dark = document.querySelector('input[name="skin"]:checked')?.value === 'black';

    // Styling Palette
    const bg = dark ? [15, 23, 42] : [255, 255, 255];
    const textMain = dark ? [241, 245, 249] : [30, 41, 59];
    const textSub = dark ? [148, 163, 184] : [100, 116, 139];
    const accent = dark ? [56, 189, 248] : [14, 116, 144];
    const cardBg = dark ? [30, 41, 59] : [248, 250, 252];
    const borderCol = dark ? [51, 65, 85] : [226, 232, 240];

    let currentY = 15;

    const fillPageBackground = () => {
      pdf.setFillColor(...bg);
      pdf.rect(0, 0, 210, 297, 'F');
    };

    const addFooter = (pageNum) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...textSub);
      pdf.text(`Case File No. ${d.caseId} · CyberForce Case Report System · National Cyber Crime Helpline: 1930`, 14, 288);
      pdf.text(`Page ${pageNum}`, 196, 288, { align: 'right' });
    };

    const addHeader = (title, sub) => {
      fillPageBackground();
      pdf.setFillColor(...accent);
      pdf.rect(14, 12, 3, 12, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(...textMain);
      pdf.text(title, 21, 18);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...textSub);
      pdf.text(`${sub}  |  Case File No. ${d.caseId}`, 21, 23);

      pdf.setDrawColor(...borderCol);
      pdf.setLineWidth(0.3);
      pdf.line(14, 27, 196, 27);

      currentY = 34;
    };

    const checkPageSpace = (neededHeight, pageNumObj) => {
      if (currentY + neededHeight > 275) {
        addFooter(pageNumObj.val);
        pdf.addPage();
        pageNumObj.val++;
        addHeader('Cyber Crime Report', 'Official Case File — Confidential');
      }
    };

    const drawSectionTitle = (title) => {
      pdf.setFillColor(...cardBg);
      pdf.roundedRect(14, currentY, 182, 8, 1, 1, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...accent);
      pdf.text(title.toUpperCase(), 18, currentY + 5.5);
      currentY += 12;
    };

    const drawTable = (rows, pageNumObj) => {
      rows.forEach(([label, value]) => {
        if (!value) return;
        const formattedVal = String(value);
        const splitVal = pdf.splitTextToSize(formattedVal, 115);
        const rowHeight = Math.max(8, splitVal.length * 4.5 + 3);

        checkPageSpace(rowHeight + 2, pageNumObj);

        pdf.setFillColor(...cardBg);
        pdf.roundedRect(14, currentY, 182, rowHeight, 1, 1, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...textSub);
        pdf.text(label, 18, currentY + 5);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textMain);
        pdf.text(splitVal, 68, currentY + 5);

        currentY += rowHeight + 2;
      });
    };

    let pageObj = { val: 1 };
    addHeader('Cyber Crime Report', 'Official Case File — Confidential');

    // Case Details Metadata
    drawTable([
      ['Case File No', d.caseId],
      ['Date of Report', d.date],
      ['Subject / Accused', d.suspect.name || 'Unidentified / Unknown']
    ], pageObj);
    currentY += 4;

    // 1. Suspect Info
    drawSectionTitle('1. Suspect Information');
    drawTable([
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
    ], pageObj);
    currentY += 4;

    // 2. Crime Details
    drawSectionTitle('2. Crime Details');
    drawTable([
      ['Crime Type', d.crime.type],
      ['Platform Used', d.crime.platform],
      ['Date & Time of Incident', d.crime.date],
      ['Place of Incident', d.crime.place],
      ['Amount Lost', d.crime.amount]
    ], pageObj);
    
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(...textSub);
    pdf.text('Indicative provisions: Information Technology Act, 2000 — S.66, 66C, 66D · Indian Penal Code — S.420, 468, 471', 14, currentY + 2);
    currentY += 10;

    // 3. Statement of Complainant
    checkPageSpace(30, pageObj);
    drawSectionTitle('3. Statement of Complainant');
    const descLines = pdf.splitTextToSize(d.desc || 'No detailed statement provided.', 174);
    const descHeight = descLines.length * 4.5 + 6;
    
    pdf.setFillColor(...cardBg);
    pdf.roundedRect(14, currentY, 182, descHeight, 1, 1, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...textMain);
    pdf.text(descLines, 18, currentY + 5);
    currentY += descHeight + 6;

    // 4. Officer Log & Verification
    checkPageSpace(35, pageObj);
    drawSectionTitle('4. Officer Use & Verification');
    drawTable([
      ['Received By (Name / ID)', d.officer.received || '____________________________________'],
      ['Station / Department / Unit', d.officer.station || '____________________________________'],
      ['Case Status', d.officer.status || 'Open / Under Investigation / Closed'],
      ['Officer Remarks', d.officer.remarks || 'None']
    ], pageObj);
    currentY += 4;

    // 5. Declaration
    checkPageSpace(35, pageObj);
    drawSectionTitle('5. Declaration & Signatures');
    const declText = "I hereby declare that the information furnished in this report is true to my knowledge. This report is prepared for submission before the Cyber Cell / concerned police authority. I understand that furnishing false information is a punishable offence.";
    const declLines = pdf.splitTextToSize(declText, 174);
    
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...textSub);
    pdf.text(declLines, 14, currentY);
    currentY += declLines.length * 4 + 6;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...textMain);
    pdf.text(`Complainant Name: ${d.decl.name || 'N/A'}${d.decl.contact ? ' (' + d.decl.contact + ')' : ''}`, 14, currentY);
    pdf.text('Signature: ______________________', 110, currentY);
    pdf.text('Date: __________________', 160, currentY);
    currentY += 12;

    // Annexure A - Evidence
    if (d.evidence && d.evidence.length > 0) {
      addFooter(pageObj.val);
      pdf.addPage();
      pageObj.val++;
      addHeader('Annexure A — Documentary Evidence', 'Exhibits & Attachments');
      
      d.evidence.forEach((e, idx) => {
        checkPageSpace(60, pageObj);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(...accent);
        pdf.text(`Exhibit ${String.fromCharCode(65 + idx)} — SHA-256: ${e.hash ? e.hash.slice(0, 24) : 'N/A'}...`, 14, currentY);
        currentY += 4;

        try {
          pdf.addImage(e.dataUrl, 'PNG', 14, currentY, 70, 45, undefined, 'FAST');
          currentY += 50;
        } catch(err) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8);
          pdf.setTextColor(...textSub);
          pdf.text('[Attached Image Evidence]', 14, currentY + 6);
          currentY += 12;
        }
      });
    }

    addFooter(pageObj.val);

    if (window.saveReportMeta) saveReportMeta(d);
    if (window.CF_TRACK) CF_TRACK('export_pdf', d.crime.type);

    pdf.save(`${d.caseId}-cyber-crime-report.pdf`);
  } catch (e) {
    console.error(e);
    alert('PDF export failed: ' + e.message);
  }

  btn.disabled = false;
  btn.textContent = 'Download PDF';
});