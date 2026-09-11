/* ============ CyberForce PDF Export v15 (native text PDF, no screenshots) ============ */
console.log('CyberForce pdf v15 loaded');

document.getElementById('btnPdf').addEventListener('click', async () => {
  const btn = document.getElementById('btnPdf');
  const d = window.__CF_LAST_DATA;
  if (!d) { alert('Generate the preview first.'); return; }
  btn.disabled = true; btn.textContent = 'Generating...';
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const cid = window.CF_CASE_ID;

    /* ---------- theme ---------- */
    const skinEl = document.querySelector('input[name="skin"]:checked');
    const dark = !!(skinEl && skinEl.value === 'black');

    /* ---------- layout constants (mm) ---------- */
    const PAGE_W = 210, PAGE_H = 297;
    const MARGIN = 16;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const FOOTER_Y = PAGE_H - 10;

    const NAVY = [11, 36, 71];
    const GRAY = [102, 102, 102];
    const LIGHT_LINE = dark ? [72, 74, 80] : [212, 214, 219];
    const INK = dark ? [235, 235, 238] : [28, 28, 30];
    const PAPER = dark ? [17, 17, 19] : [255, 255, 255];
    const ACCENT = dark ? [130, 168, 240] : NAVY;

    let y = MARGIN;

    /* ---------- primitives ---------- */
    function paintBg() { if (dark) { pdf.setFillColor(PAPER[0], PAPER[1], PAPER[2]); pdf.rect(0, 0, PAGE_W, PAGE_H, 'F'); } }
    function newPage() { pdf.addPage(); paintBg(); y = MARGIN; }
    function ensure(h) { if (y + h > PAGE_H - MARGIN - 14) newPage(); }
    function setInk() { pdf.setTextColor(INK[0], INK[1], INK[2]); }
    function setGray() { pdf.setTextColor(GRAY[0], GRAY[1], GRAY[2]); }
    function pxToMm(px) { return px * 25.4 / 96; }

    paintBg();

    function reportHeader(title, subtitle) {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11);
      pdf.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
      pdf.text('CYBER', MARGIN, y);
      const w = pdf.getTextWidth('CYBER');
      setInk();
      pdf.text('FORCE', MARGIN + w, y);
      y += 7;

      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(17);
      setInk();
      pdf.text(title, MARGIN, y);
      y += 6;

      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5);
      setGray();
      pdf.text(subtitle + '   ·   Case File No. ' + d.caseId, MARGIN, y);
      y += 4;

      pdf.setDrawColor(LIGHT_LINE[0], LIGHT_LINE[1], LIGHT_LINE[2]); pdf.setLineWidth(0.4);
      pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 7;
    }

    function sectionTitle(t) {
      ensure(12);
      pdf.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
      pdf.rect(MARGIN, y - 3.7, 2.1, 5.3, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11.5);
      setInk();
      pdf.text(t, MARGIN + 5, y);
      y += 7;
    }

    function metaLine(items) {
      ensure(8);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5);
      setGray();
      pdf.text(items.join('      '), MARGIN, y);
      y += 8;
    }

    /* Flowing paragraph text - wraps and paginates naturally, never shrinks font. */
    function paragraph(text, opts = {}) {
      const size = opts.size || 10;
      pdf.setFont('helvetica', opts.bold ? 'bold' : (opts.italic ? 'italic' : 'normal'));
      pdf.setFontSize(size);
      opts.gray ? setGray() : setInk();
      const lineH = size * 0.42 + 1.25;
      const lines = pdf.splitTextToSize(String(text == null || text === '' ? '—' : text), CONTENT_W);
      lines.forEach(line => {
        ensure(lineH);
        pdf.text(line, MARGIN, y + lineH - 1.5);
        y += lineH;
      });
      y += opts.after ?? 2;
    }

    /* Aligned label / value rows with wrapping values and separator rules. */
    function kvTable(rows) {
      rows = rows.filter(r => r[1]);
      if (!rows.length) return;
      const labelW = 55;
      const valueW = CONTENT_W - labelW - 2;
      rows.forEach(([label, value, mono]) => {
        const valueFont = mono ? 'courier' : 'helvetica';
        pdf.setFont(valueFont, 'normal'); pdf.setFontSize(9.5);
        const lines = pdf.splitTextToSize(String(value), valueW);
        const lineH = 4.6;
        const rowH = Math.max(6.5, lines.length * lineH + 1.5);
        ensure(rowH);
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); setInk();
        pdf.text(label, MARGIN, y + 4.2);
        pdf.setFont(valueFont, 'normal'); setInk();
        pdf.text(lines, MARGIN + labelW, y + 4.2);
        y += rowH;
        pdf.setDrawColor(LIGHT_LINE[0], LIGHT_LINE[1], LIGHT_LINE[2]); pdf.setLineWidth(0.2);
        pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
        y += 3;
      });
      y += 2;
    }

    function addImageBlock(dataUrl, wPx, hPx, maxWmm, caption, centered) {
      if (!dataUrl) return;
      try {
        let w = (wPx && hPx) ? pxToMm(wPx) : maxWmm;
        let h = (wPx && hPx) ? pxToMm(hPx) : maxWmm * 0.75;
        if (w > maxWmm) { h = h * (maxWmm / w); w = maxWmm; }
        const maxH = 95;
        if (h > maxH) { w = w * (maxH / h); h = maxH; }
        ensure(h + (caption ? 8 : 3));
        const x = centered ? MARGIN + (CONTENT_W - w) / 2 : MARGIN;
        const fmt = dataUrl.indexOf('data:image/png') === 0 ? 'PNG' : 'JPEG';
        pdf.addImage(dataUrl, fmt, x, y, w, h);
        y += h + 2;
        if (caption) paragraph(caption, { size: 8, italic: true, gray: true, after: 4 });
        else y += 3;
      } catch (e) { /* skip a broken image rather than failing the whole export */ }
    }

    function captureQr() {
      const box = document.getElementById('qrBox');
      if (!box) return null;
      const canvas = box.querySelector('canvas');
      if (canvas) { try { return { dataUrl: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height }; } catch (e) { return null; } }
      const img = box.querySelector('img');
      if (img && img.src) return { dataUrl: img.src, w: img.naturalWidth || 120, h: img.naturalHeight || 120 };
      return null;
    }

    function drawFooters() {
      const total = pdf.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(LIGHT_LINE[0], LIGHT_LINE[1], LIGHT_LINE[2]); pdf.setLineWidth(0.3);
        pdf.line(MARGIN, FOOTER_Y - 4, PAGE_W - MARGIN, FOOTER_Y - 4);
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
        setGray();
        pdf.text('CyberForce Case Report System', MARGIN, FOOTER_Y);
        pdf.text(cid, PAGE_W / 2, FOOTER_Y, { align: 'center' });
        pdf.text('Page ' + i + ' of ' + total, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });
      }
    }

    /* ================= Page 1 — Suspect + Crime ================= */
    reportHeader('Cyber Crime Report', 'Official Case File — Confidential');
    metaLine(['Case File No: ' + d.caseId, 'Date of Report: ' + d.date]);

    if (d.suspect.name) {
      pdf.setFillColor(dark ? 40 : 240, dark ? 42 : 243, dark ? 48 : 247);
      ensure(11);
      pdf.rect(MARGIN, y - 5.5, CONTENT_W, 9, 'F');
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); setInk();
      pdf.text('Complaint against:', MARGIN + 3, y);
      pdf.setFont('helvetica', 'bold');
      pdf.text(d.suspect.name, MARGIN + 3 + pdf.getTextWidth('Complaint against:  '), y);
      y += 9;
    }

    sectionTitle('1. Suspect Information');
    if (d.suspect.photo) addImageBlock(d.suspect.photo, d.suspect.photoW, d.suspect.photoH, 45, 'Suspect Photograph', false);
    kvTable([
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

    sectionTitle('2. Crime Details');
    kvTable([
      ['Crime Type', d.crime.type],
      ['Platform Used', d.crime.platform],
      ['Date and Time of Incident', d.crime.date],
      ['Place of Incident', d.crime.place],
      ['Amount Lost', d.crime.amount],
    ]);
    paragraph('Indicative provisions: Information Technology Act, 2000 — S.66, 66C, 66D  ·  Indian Penal Code — S.420, 468, 471', { size: 8.5, gray: true, italic: true });

    /* ================= Page 2 — Statement + Officer + Declaration ================= */
    newPage();
    reportHeader('Statement & Declaration', 'Continuation of Case File');

    sectionTitle('3. Statement of Complainant');
    String(d.desc || '—').split(/\n+/).forEach(line => paragraph(line.trim() || ' ', { after: 1.5 }));
    y += 2;

    sectionTitle('4. Officer Use');
    kvTable([
      ['Received By (Name / ID)', d.officer.received || '____________________'],
      ['Station / Department / Unit', d.officer.station || '____________________'],
      ['Case Status', d.officer.status || 'Open / Under Investigation / Closed'],
      ['Officer Remarks', d.officer.remarks],
    ]);

    ensure(16);
    pdf.setDrawColor(LIGHT_LINE[0], LIGHT_LINE[1], LIGHT_LINE[2]); pdf.setLineWidth(0.3);
    pdf.rect(MARGIN, y, CONTENT_W, 14);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); setGray();
    pdf.text('VERIFICATION AND STAMP', MARGIN + CONTENT_W / 2, y + 8, { align: 'center' });
    y += 20;

    sectionTitle('5. Declaration & Signatures');
    paragraph('I hereby declare that the information furnished in this report is true to my knowledge. This report is prepared for submission before the Cyber Cell / concerned police authority. I understand that furnishing false information is a punishable offence.', { after: 5 });

    ensure(10);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); setInk();
    pdf.text('Complainant: ' + d.decl.name + (d.decl.contact ? '   ·   ' + d.decl.contact : ''), MARGIN, y);
    y += 9;
    ensure(8);
    pdf.text('Signature: ____________________', MARGIN, y);
    pdf.text('Date: ____________________', MARGIN + 100, y);
    y += 10;

    const qr = captureQr();
    if (qr) addImageBlock(qr.dataUrl, qr.w, qr.h, 28, null, false);

    /* ================= Page 3 — Evidence Annexure ================= */
    newPage();
    reportHeader('Annexure A — Evidence', 'Documentary Evidence & Exhibits');

    if (!d.evidence.length) {
      paragraph('No evidence attached.');
    } else {
      d.evidence.forEach((e, i) => {
        paragraph('Exhibit ' + String.fromCharCode(65 + i) + '   ·   SHA-256: ' + e.hash.slice(0, 16) + '...', { bold: true, size: 9.5, after: 3 });
        addImageBlock(e.dataUrl, e.w, e.h, CONTENT_W, null, false);
        y += 3;
      });
    }

    drawFooters();

    if (window.__CF_LAST_DATA) {
      if (window.saveReportMeta) saveReportMeta(window.__CF_LAST_DATA);
      if (window.CF_TRACK) CF_TRACK('export_pdf', window.__CF_LAST_DATA.crime.type);
    }
    pdf.save(cid + '-cyber-crime-report.pdf');
  } catch (e) { alert('PDF export failed: ' + e.message); }
  btn.disabled = false; btn.textContent = 'Download PDF';
});
