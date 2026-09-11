/* ============ CyberForce PDF Export v16 (premium, native text, matches on-screen design) ============ */
console.log('CyberForce pdf v16 loaded');

document.getElementById('btnPdf').addEventListener('click', async () => {
  const btn = document.getElementById('btnPdf');
  const d = window.__CF_LAST_DATA;
  if (!d) { alert('Generate the preview first.'); return; }
  btn.disabled = true; btn.textContent = 'Generating...';
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const cid = window.CF_CASE_ID;

    const skinEl = document.querySelector('input[name="skin"]:checked');
    const dark = !!(skinEl && skinEl.value === 'black');

    /* ---------- palette, lifted straight from the site's CSS ---------- */
    const PAL = dark ? {
      page: [15, 23, 42], head: [2, 44, 34], headBorder: [20, 184, 166],
      sub: [153, 246, 228], badgeText2: [94, 234, 212],
      sec: [19, 78, 74], secText: [94, 234, 212], secBorder: [13, 148, 136],
      labelBg: [30, 41, 59], rowBorder: [30, 41, 59], textLabel: [148, 163, 184],
      textValue: [226, 232, 240], textBody: [203, 213, 225], footText: [100, 116, 139],
      footBorder: [51, 65, 85], frame: [51, 65, 85], pboxBg: [30, 41, 59],
      pboxBorder: [71, 85, 105], exBg: [30, 41, 59], exBorder: [71, 85, 105],
      stampBorder: [71, 85, 105], stampText: [100, 116, 139], legal: [100, 116, 139],
      watermark: [255, 255, 255], wmOpacity: 0.045, triMid: [30, 41, 59],
      spineA: [15, 81, 50], spineB: [20, 160, 133],
    } : {
      page: [255, 255, 255], head: [15, 76, 71], headBorder: [20, 184, 166],
      sub: [153, 246, 228], badgeText2: [94, 234, 212],
      sec: [204, 251, 241], secText: [15, 118, 110], secBorder: [13, 148, 136],
      labelBg: [248, 250, 252], rowBorder: [241, 245, 249], textLabel: [71, 85, 105],
      textValue: [30, 41, 59], textBody: [51, 65, 85], footText: [148, 163, 184],
      footBorder: [229, 231, 235], frame: [209, 213, 219], pboxBg: [255, 255, 255],
      pboxBorder: [209, 213, 219], exBg: [255, 255, 255], exBorder: [226, 232, 240],
      stampBorder: [226, 232, 240], stampText: [148, 163, 184], legal: [100, 116, 139],
      watermark: [0, 0, 0], wmOpacity: 0.03, triMid: [245, 245, 245],
      spineA: [15, 81, 50], spineB: [20, 160, 133],
    };
    const TRI_A = [255, 153, 51], TRI_C = [19, 136, 8];

    /* ---------- layout constants (mm) ---------- */
    const PAGE_W = 210, PAGE_H = 297;
    const FRAME = 5;
    const TRI_H = 1.6;
    const HEAD_H = 23;
    const BAND_BOTTOM = FRAME + TRI_H + HEAD_H;
    const MARGIN = 17;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const FOOTER_Y = PAGE_H - 11;
    const BOTTOM_LIMIT = PAGE_H - FRAME - 15;

    let y = MARGIN;
    let curTitle = '', curSub = '';

    /* ---------- low-level helpers ---------- */
    const setFill = c => pdf.setFillColor(c[0], c[1], c[2]);
    const setDraw = c => pdf.setDrawColor(c[0], c[1], c[2]);
    const setText = c => pdf.setTextColor(c[0], c[1], c[2]);
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round); }
    function withOpacity(op, fn) {
      try { pdf.saveGraphicsState(); pdf.setGState(new pdf.GState({ opacity: op })); fn(); pdf.restoreGraphicsState(); }
      catch (e) { fn(); }
    }
    function dashed(pattern, fn) {
      try { pdf.setLineDashPattern(pattern, 0); fn(); pdf.setLineDashPattern([], 0); }
      catch (e) { fn(); }
    }

    function paintBg() { setFill(PAL.page); pdf.rect(0, 0, PAGE_W, PAGE_H, 'F'); }
    function drawFrame() { setDraw(PAL.frame); pdf.setLineWidth(0.35); pdf.roundedRect(FRAME - 1, FRAME - 1, PAGE_W - (FRAME - 1) * 2, PAGE_H - (FRAME - 1) * 2, 3, 3, 'S'); }
    function drawWatermark() {
      withOpacity(PAL.wmOpacity, () => {
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(68);
        setText(PAL.watermark);
        pdf.text('CYBERFORCE', PAGE_W / 2, PAGE_H / 2, { align: 'center', angle: 35 });
      });
    }
    function drawSpine() {
      const steps = 50, w = 2.3;
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const c = lerp(PAL.spineA, PAL.spineB, Math.sin(t * Math.PI));
        setFill(c);
        pdf.rect(FRAME, FRAME + (PAGE_H - FRAME * 2) * t, w, (PAGE_H - FRAME * 2) / steps + 0.6, 'F');
      }
    }
    function drawTricolor() {
      const y0 = FRAME, seg = (PAGE_W - FRAME * 2) / 3;
      setFill(TRI_A); pdf.rect(FRAME, y0, seg, TRI_H, 'F');
      setFill(PAL.triMid); pdf.rect(FRAME + seg, y0, seg, TRI_H, 'F');
      setFill(TRI_C); pdf.rect(FRAME + seg * 2, y0, seg, TRI_H, 'F');
    }
    function drawHeaderBand(title, sub) {
      const y0 = FRAME + TRI_H;
      setFill(PAL.head); pdf.rect(FRAME, y0, PAGE_W - FRAME * 2, HEAD_H, 'F');
      setDraw(PAL.headBorder); pdf.setLineWidth(0.9); pdf.line(FRAME, y0 + HEAD_H, PAGE_W - FRAME, y0 + HEAD_H);

      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15.5);
      setText([255, 255, 255]);
      pdf.text(title.toUpperCase(), MARGIN, y0 + 11);

      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
      setText(PAL.sub);
      pdf.text((sub + '   \u00b7   CASE FILE NO. ' + cid).toUpperCase(), MARGIN, y0 + 17.5);

      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5);
      const bw = pdf.getTextWidth('CYBERFORCE') + 15;
      const bx = PAGE_W - MARGIN - bw, by = y0 + 6, bh = 8.6;
      withOpacity(0.55, () => { setDraw([255, 255, 255]); pdf.setLineWidth(0.35); pdf.roundedRect(bx, by, bw, bh, 1.4, 1.4, 'S'); });
      setText([255, 255, 255]); pdf.text('CYBER', bx + 7, by + 5.6);
      const w1 = pdf.getTextWidth('CYBER');
      setText(PAL.badgeText2); pdf.text('FORCE', bx + 7 + w1, by + 5.6);
    }
    function newPage() {
      pdf.addPage();
      paintBg(); drawWatermark(); drawTricolor(); drawHeaderBand(curTitle, curSub); drawSpine(); drawFrame();
      y = BAND_BOTTOM + 9;
    }
    function startSection(title, sub, forcePage) {
      curTitle = title; curSub = sub;
      if (forcePage) { newPage(); return; }
      drawTricolor(); drawHeaderBand(title, sub); drawSpine(); drawFrame();
      y = BAND_BOTTOM + 9;
    }
    function ensure(h) { if (y + h > BOTTOM_LIMIT) newPage(); }
    function inkValue() { setText(PAL.textValue); }
    function inkLabel() { setText(PAL.textLabel); }

    function sectionTitle(t) {
      ensure(13);
      const h = 7.4;
      setFill(PAL.sec); pdf.rect(MARGIN - 3, y - 5.2, CONTENT_W + 3, h, 'F');
      setDraw(PAL.secBorder); pdf.setLineWidth(1.1); pdf.line(MARGIN - 3, y - 5.2, MARGIN - 3, y - 5.2 + h);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.3);
      setText(PAL.secText);
      pdf.text(t.toUpperCase(), MARGIN + 2, y);
      y += h + 4.5;
    }

    function paragraph(text, opts = {}) {
      const size = opts.size || 10;
      pdf.setFont('helvetica', opts.bold ? 'bold' : (opts.italic ? 'italic' : 'normal'));
      pdf.setFontSize(size);
      setText(opts.gray ? PAL.legal : PAL.textBody);
      const lineH = size * 0.42 + 1.35;
      const lines = pdf.splitTextToSize(String(text == null || text === '' ? '\u2014' : text), opts.width || CONTENT_W);
      lines.forEach(line => {
        ensure(lineH);
        pdf.text(line, MARGIN, y + lineH - 1.6);
        y += lineH;
      });
      y += opts.after ?? 2.5;
    }

    /* Label / value rows - shaded label column, wraps both sides, never shrinks. */
    function kvTable(rows, opts = {}) {
      rows = rows.filter(r => r[1]);
      if (!rows.length) return;
      const availW = opts.width || CONTENT_W;
      const labelW = opts.labelW || 56;
      const valueW = availW - labelW - 5;
      rows.forEach(([label, value, mono]) => {
        const valueFont = mono ? 'courier' : 'helvetica';
        pdf.setFont(valueFont, 'normal'); pdf.setFontSize(9.3);
        const valueLines = pdf.splitTextToSize(String(value), valueW);
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.3);
        const labelLines = pdf.splitTextToSize(label, labelW - 5);
        const lineH = 4.5;
        const rowH = Math.max(7.5, Math.max(valueLines.length, labelLines.length) * lineH + 3);
        ensure(rowH);
        setFill(PAL.labelBg); pdf.rect(MARGIN, y - 1.2, labelW, rowH, 'F');
        pdf.setFont('helvetica', 'bold'); inkLabel();
        pdf.text(labelLines, MARGIN + 2.5, y + 4);
        pdf.setFont(valueFont, 'normal'); inkValue();
        pdf.text(valueLines, MARGIN + labelW + 3, y + 4);
        y += rowH;
        setDraw(PAL.rowBorder); pdf.setLineWidth(0.2);
        pdf.line(MARGIN, y, MARGIN + availW, y);
        y += 0.8;
      });
      y += 3;
    }

    function suspectPhotoBox(dataUrl, wPx, hPx) {
      const boxW = 42, pad = 3, capH = 8;
      let iw = boxW - pad * 2, ih = iw * 0.85;
      if (wPx && hPx) { ih = iw * (hPx / wPx); const maxH = 48; if (ih > maxH) { iw = iw * (maxH / ih); ih = maxH; } }
      const boxH = pad * 2 + ih + capH;
      const bx = MARGIN + CONTENT_W - boxW, by = y;
      setFill(PAL.pboxBg); setDraw(PAL.pboxBorder); pdf.setLineWidth(0.5);
      pdf.roundedRect(bx, by, boxW, boxH, 2, 2, 'FD');
      try {
        const fmt = dataUrl.indexOf('data:image/png') === 0 ? 'PNG' : 'JPEG';
        pdf.addImage(dataUrl, fmt, bx + pad, by + pad, iw, ih);
      } catch (e) { /* skip broken image */ }
      setDraw(PAL.rowBorder); pdf.setLineWidth(0.2);
      pdf.line(bx + pad, by + pad + ih + 1.8, bx + boxW - pad, by + pad + ih + 1.8);
      pdf.setFont('courier', 'bold'); pdf.setFontSize(6.2);
      inkLabel();
      pdf.text('SUSPECT PHOTO', bx + boxW / 2, by + pad + ih + 5.2, { align: 'center' });
      return boxW + 5;
    }

    function stampBox() {
      ensure(20);
      const h = 17;
      setDraw(PAL.stampBorder); pdf.setLineWidth(0.5);
      dashed([1.6, 1.3], () => pdf.roundedRect(MARGIN, y, CONTENT_W, h, 2, 2, 'S'));
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5);
      setText(PAL.stampText);
      pdf.text('VERIFICATION AND STAMP', PAGE_W / 2, y + h / 2 + 1.2, { align: 'center' });
      y += h + 8;
    }

    function prepImage(e, maxColW) {
      let w = maxColW - 6, h = w * 0.68;
      if (e.w && e.h) { h = w * (e.h / e.w); const maxH = 62; if (h > maxH) { w = w * (maxH / h); h = maxH; } }
      return { w, h };
    }
    function evidenceGrid(list) {
      const gap = 5, colW = (CONTENT_W - gap) / 2;
      for (let i = 0; i < list.length; i += 2) {
        const idxs = [i, i + 1].filter(k => k < list.length);
        const boxes = idxs.map(k => prepImage(list[k], colW));
        const rowH = Math.max.apply(null, boxes.map(b => b.h)) + 15;
        ensure(rowH + 5);
        idxs.forEach((k, pos) => {
          const e = list[k], bx = MARGIN + pos * (colW + gap), b = boxes[pos];
          setFill(PAL.exBg); setDraw(PAL.exBorder); pdf.setLineWidth(0.4);
          pdf.roundedRect(bx, y, colW, rowH, 2, 2, 'FD');
          try {
            const fmt = e.dataUrl.indexOf('data:image/png') === 0 ? 'PNG' : 'JPEG';
            pdf.addImage(e.dataUrl, fmt, bx + 3, y + 3, b.w, b.h);
          } catch (err) { /* skip broken image */ }
          pdf.setFont('courier', 'normal'); pdf.setFontSize(6.6);
          inkLabel();
          const cap = 'Exhibit ' + String.fromCharCode(65 + k) + '  \u00b7  SHA-256: ' + e.hash.slice(0, 14) + '...';
          pdf.text(pdf.splitTextToSize(cap, colW - 6), bx + 3, y + 3 + b.h + 4.6);
        });
        y += rowH + gap;
      }
      y += 2;
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
        setDraw(PAL.footBorder); pdf.setLineWidth(0.3);
        pdf.line(MARGIN, FOOTER_Y - 4, PAGE_W - MARGIN, FOOTER_Y - 4);
        pdf.setFont('courier', 'normal'); pdf.setFontSize(7.4);
        setText(PAL.footText);
        pdf.text('CyberForce Case Report System', MARGIN, FOOTER_Y);
        pdf.text(cid, PAGE_W / 2, FOOTER_Y, { align: 'center' });
        pdf.text('Page ' + i + ' of ' + total, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });
      }
    }

    /* ================= Page 1 — Suspect + Crime ================= */
    paintBg(); drawWatermark();
    startSection('Cyber Crime Report', 'Official Case File \u2014 Confidential');

    if (d.suspect.name) {
      sectionTitle('Subject of Complaint');
      paragraph('Complaint against:  ' + d.suspect.name, { bold: true, after: 4 });
    }

    sectionTitle('1. Suspect Information');
    let reserved = 0;
    if (d.suspect.photo) reserved = suspectPhotoBox(d.suspect.photo, d.suspect.photoW, d.suspect.photoH);
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
    ], { width: CONTENT_W - reserved });

    sectionTitle('2. Crime Details');
    kvTable([
      ['Crime Type', d.crime.type],
      ['Platform Used', d.crime.platform],
      ['Date and Time of Incident', d.crime.date],
      ['Place of Incident', d.crime.place],
      ['Amount Lost', d.crime.amount],
    ]);
    paragraph('Indicative provisions: Information Technology Act, 2000 \u2014 S.66, 66C, 66D  \u00b7  Indian Penal Code \u2014 S.420, 468, 471', { size: 8.3, gray: true, italic: true });

    /* ================= Page 2 — Statement + Officer + Declaration ================= */
    startSection('Statement & Declaration', 'Continuation of Case File', true);

    sectionTitle('3. Statement of Complainant');
    String(d.desc || '\u2014').split(/\n+/).forEach(line => paragraph(line.trim() || ' ', { after: 1.5 }));
    y += 2;

    sectionTitle('4. Officer Use');
    kvTable([
      ['Received By (Name / ID)', d.officer.received || '____________________'],
      ['Station / Department / Unit', d.officer.station || '____________________'],
      ['Case Status', d.officer.status || 'Open / Under Investigation / Closed'],
      ['Officer Remarks', d.officer.remarks],
    ]);

    stampBox();

    sectionTitle('5. Declaration & Signatures');
    paragraph('I hereby declare that the information furnished in this report is true to my knowledge. This report is prepared for submission before the Cyber Cell / concerned police authority. I understand that furnishing false information is a punishable offence.', { after: 5 });

    ensure(10);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5); setText(PAL.textValue);
    pdf.text('Complainant: ' + d.decl.name + (d.decl.contact ? '   \u00b7   ' + d.decl.contact : ''), MARGIN, y);
    y += 9;
    ensure(8);
    pdf.text('Signature: ____________________', MARGIN, y);
    pdf.text('Date: ____________________', MARGIN + 100, y);
    y += 10;

    const qr = captureQr();
    if (qr) {
      ensure(32);
      try {
        const fmt = qr.dataUrl.indexOf('data:image/png') === 0 ? 'PNG' : 'JPEG';
        pdf.addImage(qr.dataUrl, fmt, MARGIN, y, 26, 26);
      } catch (e) { /* skip broken image */ }
      y += 30;
    }

    /* ================= Page 3 — Evidence Annexure ================= */
    startSection('Annexure A \u2014 Evidence', 'Documentary Evidence & Exhibits', true);

    if (!d.evidence.length) {
      paragraph('No evidence attached.');
    } else {
      evidenceGrid(d.evidence);
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
