/* ============ CyberForce PDF Export v16 (Matches Exact Preview) ============ */
console.log('CyberForce pdf v16 loaded');

document.getElementById('btnPdf').addEventListener('click', async () => {
  const btn = document.getElementById('btnPdf');
  const sheets = document.querySelectorAll('#reportPreview .sheetpage, #reportPreview .page');
  
  if (!sheets.length) { 
    alert('Please generate the preview first.'); 
    return; 
  }

  const origText = btn.textContent;
  btn.disabled = true; 
  btn.textContent = 'Generating PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const cid = window.CF_CASE_ID || 'CF-REPORT';
    let isFirstPage = true;

    for (let idx = 0; idx < sheets.length; idx++) {
      const sheet = sheets[idx];
      const canvas = await html2canvas(sheet, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (!isFirstPage) {
        pdf.addPage('a4', 'portrait');
      }
      isFirstPage = false;

      // Render exact sheet page onto standard A4 canvas boundaries (210mm x 297mm)
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    if (window.__CF_LAST_DATA) {
      if (window.saveReportMeta) saveReportMeta(window.__CF_LAST_DATA);
      if (window.CF_TRACK) CF_TRACK('export_pdf', window.__CF_LAST_DATA.crime?.type);
    }

    pdf.save(`${cid}-cyberforce-evidence-report.pdf`);
  } catch (e) {
    console.error('PDF Export Error:', e);
    alert('PDF export failed: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = origText;
  }
});
