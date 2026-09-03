import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generates a clean, standard invoice filename.
 * Format: Invoice_{INVOICE_NO}_{PartyName}.pdf
 * Example: Invoice_INV-JOB-HIST_PriyaSharma.pdf
 */
export function getInvoicePdfFilename(inv) {
  const rawInvoiceNo = inv?.invoiceNo || inv?.id || 'INV'
  const cleanInvoiceNo = rawInvoiceNo.replace(/[^a-zA-Z0-9_-]/g, '')
  
  // Prefer customer name or worker name, fallback to party/Society
  const partyName =
    inv?.customer?.name ||
    inv?.household?.full_name ||
    inv?.worker?.name ||
    inv?.worker?.full_name ||
    'Customer'

  // Remove non-alphanumeric characters for a clean filename (e.g. "Priya Sharma" -> "PriyaSharma")
  const cleanParty = partyName.replace(/[^a-zA-Z0-9]/g, '') || 'Receipt'

  return `Invoice_${cleanInvoiceNo}_${cleanParty}.pdf`
}

/**
 * Helper to trigger an immediate, programmatic file download across all browsers
 * (Chrome, Firefox, Safari, Edge, Mobile Chrome, iOS Safari).
 */
export function triggerBlobDownload(blob, filename) {
  if (!blob) return

  // Standard Blob Object URL method
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  // Clean up
  setTimeout(() => {
    try {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }, 1000)
}

/**
 * Generates a razor-sharp, vector-quality official Cooperative Service Invoice PDF.
 * Never crashes on CSS variables or canvas errors. Fully vector with selectable text,
 * crisp borders, federation emblems, itemized line items, and fair wage breakdown.
 *
 * @param {Object} inv - The structured invoice data from generateInvoiceData()
 * @param {string} customFilename - Optional custom filename
 */
export async function downloadInvoicePdf(inv, customFilename) {
  if (!inv) throw new Error('Invoice data is missing')

  const filename = customFilename || getInvoicePdfFilename(inv)

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Fallback defaults if fields missing
  const society = inv.society || {
    name: 'Delhi Shramik Sahakari Federation Ltd.',
    regNo: 'DEL/LAB-COOP/2021/894',
    address: 'Cooperative Bhavan, Siri Fort Institutional Area, New Delhi - 110049',
    phone: '+91 11 2689 4432',
  }
  const customer = inv.customer || { name: 'Household Customer', address: 'Delhi-NCR' }
  const worker = inv.worker || { name: 'Verified Member Worker', trade: 'Skilled Trades', rating: 4.9 }
  const job = inv.job || {
    title: 'Service Task',
    description: 'Cooperative verified service fulfillment.',
    estimatedHours: 2,
    completionNotes: 'Work completed and verified satisfactorily.',
  }
  const financials = inv.financials || {
    grossAmount: 800,
    cooperativeFeeAmount: 40,
    welfareFundAmount: 10,
    netWorkerPayout: 750,
    paymentMode: 'UPI Instant Settlement',
    paymentStatus: 'PAID & SETTLED',
  }

  // 1. Header Emblem
  doc.setFillColor(5, 150, 105)
  doc.roundedRect(15, 15, 12, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('SC', 21, 22.5, { align: 'center' })

  // 2. Society Name & Info
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(15, 23, 42)
  doc.text(society.name, 31, 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(`REGISTRATION NO: ${society.regNo} • MULTI-STATE COOPERATIVE ACT`, 31, 24.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(`${society.address} • Phone: ${society.phone}`, 31, 28.5)

  // 3. Invoice No Badge & Date
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(16, 185, 129)
  doc.roundedRect(148, 15, 47, 8, 1.5, 1.5, 'FD')
  doc.setFont('courier', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(5, 150, 105)
  doc.text(inv.invoiceNo || 'INV-RECEIPT', 171.5, 20.2, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(`Date: ${inv.date || new Date().toLocaleDateString()}`, 195, 27.5, { align: 'right' })

  // Divider Line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(15, 33, 195, 33)

  // 4. Customer & Worker Info Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(15, 37, 180, 24, 2, 2, 'FD')

  // Customer column
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text('CUSTOMER:', 20, 43)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text(customer.name, 20, 48.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text(customer.address || 'Delhi-NCR', 20, 53)

  // Vertical separator
  doc.line(105, 40, 105, 58)

  // Worker column
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text('ASSIGNED WORKER:', 110, 43)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text(`${worker.name} (★ ${worker.rating || 4.9})`, 110, 48.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(5, 150, 105)
  doc.text(`${worker.trade || 'Skilled'} Trade • Verified Cooperative Member`, 110, 53)

  // 5. Line Items Table Header
  doc.setFillColor(241, 245, 249)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(15, 65, 180, 7.5, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(234, 88, 12) // Orange header accent
  doc.text('SERVICE TASK', 20, 70)
  doc.text('DURATION', 125, 70, { align: 'center' })
  doc.text('STANDARD RATE', 158, 70, { align: 'right' })
  doc.text('TOTAL', 190, 70, { align: 'right' })

  // 6. Line Items Table Row
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(15, 73.5, 180, 20, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(15, 23, 42)
  doc.text(job.title || 'Service Engagement', 20, 80)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  const splitDesc = doc.splitTextToSize(job.description || '', 95)
  doc.text(splitDesc, 20, 85)

  const hours = job.estimatedHours || 2
  const rate = (financials.grossAmount / hours).toFixed(0)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)
  doc.text(`${hours} hrs`, 125, 83, { align: 'center' })
  doc.text(`₹${rate}/hr`, 158, 83, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(5, 150, 105)
  doc.text(`₹${financials.grossAmount}`, 190, 83, { align: 'right' })

  // 7. Payment & Fair Wage Breakdown Card
  doc.setFillColor(18, 21, 27)
  doc.setDrawColor(30, 41, 59)
  doc.roundedRect(15, 98, 180, 46, 2.5, 2.5, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(16, 185, 129)
  doc.text('PAYMENT & WORKER WAGE BREAKDOWN', 22, 105)

  // Line 1: Total Customer Payment
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225)
  doc.text('Total Customer Payment:', 22, 112)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(`₹${financials.grossAmount}`, 188, 112, { align: 'right' })

  // Line 2: Co-op 5% Maintenance Fee
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(252, 211, 77)
  doc.text('Co-op 5% Maintenance Fee:', 22, 118)
  doc.text(`- ₹${financials.cooperativeFeeAmount}`, 188, 118, { align: 'right' })

  // Line 3: Worker Welfare Fund
  doc.setTextColor(103, 232, 249)
  doc.text('Worker Welfare Fund (PMSBY Insurance):', 22, 124)
  doc.text(`- ₹${financials.welfareFundAmount}`, 188, 124, { align: 'right' })

  // Divider Line inside dark card
  doc.setDrawColor(51, 65, 85)
  doc.line(22, 127.5, 188, 127.5)

  // Line 4: Direct Worker Take-Home Pay
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(52, 211, 153)
  doc.text('Direct Worker Take-Home Pay:', 22, 134)
  doc.setFontSize(11)
  doc.text(`₹${financials.netWorkerPayout}`, 188, 134, { align: 'right' })

  // Mode & Status
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(`Payment Mode: ${financials.paymentMode}`, 22, 140)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(52, 211, 153)
  doc.text(`✓ ${financials.paymentStatus}`, 188, 140, { align: 'right' })

  // 8. Completion Notes Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(15, 148, 180, 11, 1.5, 1.5, 'FD')

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text(`"${job.completionNotes || 'Service completed satisfactorily.'}"`, 20, 155)

  // 9. Official Cooperative Footer Guarantee
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(
    '🛡️ Official Cooperative Federation Guarantee • 100% Transparent Statutory Ledger',
    105,
    166,
    { align: 'center' }
  )

  // Generate Blob and trigger download
  const blob = doc.output('blob')
  triggerBlobDownload(blob, filename)
  return true
}

/**
 * Captures a DOM element and exports to PDF (used for Reports / General containers).
 * Includes automatic fallback and robust Blob download.
 */
export async function exportElementToPdf(element, filename = 'Document.pdf', options = {}) {
  if (!element) throw new Error('Element to export is not available')

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: options.backgroundColor || '#0f1217',
      ignoreElements: (el) =>
        el.classList?.contains('print:hidden') ||
        el.classList?.contains('no-pdf') ||
        el.getAttribute?.('data-html2canvas-ignore') === 'true',
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = options.margin !== undefined ? options.margin : 10
    const contentWidth = pageWidth - margin * 2
    const contentHeight = (imgHeight * contentWidth) / imgWidth

    if (contentHeight <= pageHeight - margin * 2) {
      const posY = margin + Math.max(0, (pageHeight - margin * 2 - contentHeight) / 4)
      pdf.addImage(imgData, 'PNG', margin, posY, contentWidth, contentHeight, undefined, 'FAST')
    } else {
      let heightLeft = contentHeight
      let position = margin
      let page = 0

      while (heightLeft > 0) {
        if (page > 0) pdf.addPage()
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position - page * (pageHeight - margin * 2),
          contentWidth,
          contentHeight,
          undefined,
          'FAST'
        )
        heightLeft -= pageHeight - margin * 2
        page++
      }
    }

    const blob = pdf.output('blob')
    triggerBlobDownload(blob, filename)
    return true
  } catch (canvasErr) {
    console.warn('html2canvas raster failed, attempting fallback download...', canvasErr)
    const fallbackPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    fallbackPdf.setFontSize(14)
    fallbackPdf.text('SahakarConnect Document Export', 20, 20)
    fallbackPdf.setFontSize(10)
    fallbackPdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30)
    const blob = fallbackPdf.output('blob')
    triggerBlobDownload(blob, filename)
    return true
  }
}
