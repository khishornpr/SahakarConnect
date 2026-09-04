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

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

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
 * Direct jsPDF High-Resolution Vector Renderer.
 * Always renders in pure White Mode for professional, ink-friendly output.
 */
export function generateVectorInvoicePdf(inv, filename) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const society = inv?.society || {
    name: 'Delhi Shramik Sahakari Federation Ltd.',
    regNo: 'DEL/LAB-COOP/2021/894',
    address: 'Cooperative Bhavan, Siri Fort Institutional Area, New Delhi - 110049',
    phone: '+91 11 2689 4432',
  }

  const customerBaseName = (inv?.customer?.name || 'Customer')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim() || 'Customer'
  const workerBaseName = (inv?.worker?.name || 'Worker')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim() || 'Worker'

  const customerDisplayName = `${customerBaseName} (Customer)`
  const workerDisplayName = `${workerBaseName} (Worker)`
  const customerAddress = inv?.customer?.address || 'Delhi-NCR'
  const workerTrade = inv?.worker?.trade || 'Electrician'

  const job = inv?.job || {
    title: 'Ceiling Fan & Heavy Appliance Wiring',
    description: 'Installation of 2 heavy-duty ceiling fans and modular switches in master bedroom.',
    estimatedHours: 2,
    completionNotes: 'Wiring tested successfully. Voltage stabilized.',
  }

  const financials = inv?.financials || {
    grossAmount: 800,
    cooperativeFeeAmount: 40,
    welfareFundAmount: 10,
    netWorkerPayout: 750,
    paymentMode: 'UPI Instant Settlement',
    paymentStatus: 'PAID & SETTLED',
  }

  const hourlyTariff = Math.round(financials.grossAmount / (job.estimatedHours || 1))
  const invoiceNo = inv?.invoiceNo || 'INV-JOB-HIST'
  const invoiceDate = inv?.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  // Fill entire page background with pure white
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  // Invoice Container Card
  const cardX = 12
  const cardY = 12
  const cardW = 186
  const cardH = 265

  pdf.setFillColor(255, 255, 255)
  pdf.setDrawColor(226, 232, 240) // #e2e8f0
  pdf.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'FD')

  // Top Header Emblem Box
  pdf.setFillColor(5, 150, 105) // #059669
  pdf.roundedRect(cardX + 8, cardY + 8, 10, 10, 2, 2, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('CO', cardX + 9.5, cardY + 14.5)

  // Society Name
  pdf.setTextColor(6, 78, 59) // #064e3b
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text(society.name, cardX + 22, cardY + 13)

  // Registration & Address
  pdf.setTextColor(100, 116, 139) // #64748b
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`REGISTRATION NO: ${society.regNo} • MULTI-STATE COOPERATIVE ACT`, cardX + 22, cardY + 17.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`${society.address} • Phone: ${society.phone}`, cardX + 22, cardY + 22)

  // Invoice Number Badge
  pdf.setFillColor(236, 253, 245) // #ecfdf5
  pdf.setDrawColor(110, 231, 183) // #6ee7b7
  pdf.setTextColor(6, 95, 70) // #065f46
  pdf.roundedRect(cardX + cardW - 48, cardY + 8, 40, 7, 1.5, 1.5, 'FD')
  pdf.setFontSize(8.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(invoiceNo, cardX + cardW - 28, cardY + 13, { align: 'center' })

  // Date
  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Date: ${invoiceDate}`, cardX + cardW - 8, cardY + 20, { align: 'right' })

  // Divider
  pdf.setDrawColor(226, 232, 240)
  pdf.line(cardX + 8, cardY + 26, cardX + cardW - 8, cardY + 26)

  // Customer & Worker Details Box
  const cwY = cardY + 30
  const cwW = (cardW - 20) / 2
  const cwH = 26

  pdf.setFillColor(248, 250, 252) // #f8fafc
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(cardX + 8, cwY, cardW - 16, cwH, 2.5, 2.5, 'FD')

  // Customer
  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text('CUSTOMER:', cardX + 12, cwY + 6)

  pdf.setTextColor(15, 23, 42) // #0f172a
  pdf.setFontSize(9.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(customerDisplayName, cardX + 12, cwY + 12)

  pdf.setTextColor(71, 85, 105) // #475569
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text(customerAddress, cardX + 12, cwY + 18)

  // Worker
  const workerX = cardX + 8 + cwW + 4
  pdf.setDrawColor(226, 232, 240)
  pdf.line(workerX - 4, cwY + 3, workerX - 4, cwY + cwH - 3)

  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ASSIGNED WORKER:', workerX, cwY + 6)

  pdf.setTextColor(15, 23, 42)
  pdf.setFontSize(9.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(workerDisplayName, workerX, cwY + 12)

  pdf.setTextColor(4, 120, 87) // #047857
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${workerTrade} Trade • Verified Member`, workerX, cwY + 18)

  // Table
  const tblY = cwY + cwH + 6
  const tblH = 34

  pdf.setFillColor(241, 245, 249) // #f1f5f9
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(cardX + 8, tblY, cardW - 16, tblH, 2.5, 2.5, 'FD')

  pdf.setFillColor(241, 245, 249)
  pdf.setTextColor(51, 65, 85) // #334155
  pdf.rect(cardX + 8, tblY, cardW - 16, 8, 'F')
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Service Task', cardX + 12, tblY + 5.5)
  pdf.text('Duration', cardX + 100, tblY + 5.5, { align: 'center' })
  pdf.text('Standard Tariff', cardX + 138, tblY + 5.5, { align: 'right' })
  pdf.text('Total Amount', cardX + cardW - 12, tblY + 5.5, { align: 'right' })

  pdf.line(cardX + 8, tblY + 8, cardX + cardW - 8, tblY + 8)

  pdf.setTextColor(15, 23, 42)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text(job.title, cardX + 12, tblY + 14)

  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  const splitDesc = pdf.splitTextToSize(job.description, 80)
  pdf.text(splitDesc, cardX + 12, tblY + 19)

  pdf.setTextColor(51, 65, 85)
  pdf.setFontSize(8)
  pdf.text(`${job.estimatedHours} hrs`, cardX + 100, tblY + 16, { align: 'center' })

  pdf.setTextColor(71, 85, 105)
  pdf.text(`Rs. ${hourlyTariff} / hr`, cardX + 138, tblY + 16, { align: 'right' })

  pdf.setTextColor(4, 120, 87)
  pdf.setFontSize(10.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Rs. ${financials.grossAmount}`, cardX + cardW - 12, tblY + 16, { align: 'right' })

  // Payment Settlement Box
  const payY = tblY + tblH + 6
  const payH = 68

  pdf.setFillColor(248, 250, 252) // #f8fafc
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(cardX + 8, payY, cardW - 16, payH, 2.5, 2.5, 'FD')

  pdf.setTextColor(4, 120, 87)
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text('PAYMENT & WORKER WAGE SETTLEMENT', cardX + 12, payY + 6.5)

  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Statutory Cooperative Ledger', cardX + cardW - 12, payY + 6.5, { align: 'right' })

  pdf.setTextColor(51, 65, 85)
  pdf.setFontSize(8)
  pdf.text('Total Customer Payment (Gross Amount):', cardX + 12, payY + 14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(15, 23, 42)
  pdf.text(`Rs. ${financials.grossAmount}`, cardX + cardW - 12, payY + 14, { align: 'right' })

  pdf.setTextColor(180, 83, 9) // #b45309
  pdf.setFont('helvetica', 'bold')
  pdf.text('Less: Co-op 5% Maintenance Contribution:', cardX + 12, payY + 21)
  pdf.text(`- Rs. ${financials.cooperativeFeeAmount}`, cardX + cardW - 12, payY + 21, { align: 'right' })

  pdf.setTextColor(3, 105, 161) // #0369a1
  pdf.text('Less: Worker Welfare & Social Security Fund:', cardX + 12, payY + 28)
  pdf.text(`- Rs. ${financials.welfareFundAmount}`, cardX + cardW - 12, payY + 28, { align: 'right' })

  pdf.setDrawColor(226, 232, 240)
  pdf.line(cardX + 12, payY + 33, cardX + cardW - 12, payY + 33)

  pdf.setTextColor(4, 120, 87)
  pdf.setFontSize(9.5)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Direct Worker Take-Home Pay:', cardX + 12, payY + 41)

  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'normal')
  pdf.text(
    `Amount Calculation: Rs. ${financials.grossAmount} - Rs. ${financials.cooperativeFeeAmount} - Rs. ${financials.welfareFundAmount} = Rs. ${financials.netWorkerPayout}`,
    cardX + 12,
    payY + 46
  )

  pdf.setTextColor(4, 120, 87)
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Rs. ${financials.netWorkerPayout}`, cardX + cardW - 12, payY + 44, { align: 'right' })

  pdf.setDrawColor(226, 232, 240)
  pdf.setTextColor(100, 116, 139)
  pdf.line(cardX + 12, payY + 52, cardX + cardW - 12, payY + 52)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Payment Mode: ${financials.paymentMode}`, cardX + 12, payY + 59)

  pdf.setTextColor(4, 120, 87)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`✓ ${financials.paymentStatus}`, cardX + cardW - 12, payY + 59, { align: 'right' })

  // Completion Notes Box
  const notesY = payY + payH + 5
  pdf.setFillColor(248, 250, 252)
  pdf.setDrawColor(226, 232, 240)
  pdf.setTextColor(71, 85, 105)
  pdf.roundedRect(cardX + 8, notesY, cardW - 16, 14, 2, 2, 'FD')
  pdf.setFontSize(7.5)
  pdf.setFont('helvetica', 'italic')
  const splitNotes = pdf.splitTextToSize(`"${job.completionNotes || 'Wiring tested successfully. Voltage stabilized.'}"`, cardW - 24)
  pdf.text(splitNotes, cardX + 12, notesY + 6)

  // Guarantee
  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Official Cooperative Federation Guarantee • 100% Transparent Statutory Ledger', cardX + cardW / 2, notesY + 22, {
    align: 'center',
  })

  const blob = pdf.output('blob')
  triggerBlobDownload(blob, filename)
  return true
}

/**
 * Generates an official Cooperative Service Invoice PDF.
 * Always renders in pure White Mode for standard, ink-friendly, high-contrast download.
 *
 * Uses an isolated hidden <iframe> sandbox to prevent CSS stylesheet parse errors from Tailwind v4.
 * Uses standard sans-serif font stack with clean character spacing to eliminate any glyph collision.
 *
 * @param {Object} inv - The structured invoice data from generateInvoiceData()
 * @param {string} customFilename - Optional custom filename
 */
export async function downloadInvoicePdf(inv, customFilename) {
  if (!inv) throw new Error('Invoice data is missing')

  const filename = customFilename || getInvoicePdfFilename(inv)

  const society = inv.society || {
    name: 'Delhi Shramik Sahakari Federation Ltd.',
    regNo: 'DEL/LAB-COOP/2021/894',
    address: 'Cooperative Bhavan, Siri Fort Institutional Area, New Delhi - 110049',
    phone: '+91 11 2689 4432',
  }

  // Clean customer & worker names to avoid duplicate role tags or design decorations
  const customerBaseName = (inv.customer?.name || 'Customer')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim() || 'Customer'
  const workerBaseName = (inv.worker?.name || 'Worker')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim() || 'Worker'

  const customerDisplayName = `${customerBaseName} (Customer)`
  const workerDisplayName = `${workerBaseName} (Worker)`

  const customer = { ...inv.customer, name: customerDisplayName, address: inv.customer?.address || 'Delhi-NCR' }
  const worker = { ...inv.worker, name: workerDisplayName, trade: inv.worker?.trade || 'Electrician' }
  const job = inv.job || {
    title: 'Ceiling Fan & Heavy Appliance Wiring',
    description: 'Installation of 2 heavy-duty ceiling fans and modular switches in master bedroom.',
    estimatedHours: 2,
    completionNotes: 'Wiring tested successfully. Voltage stabilized.',
  }
  const financials = inv.financials || {
    grossAmount: 800,
    cooperativeFeeAmount: 40,
    welfareFundAmount: 10,
    netWorkerPayout: 750,
    paymentMode: 'UPI Instant Settlement',
    paymentStatus: 'PAID & SETTLED',
  }

  const hourlyTariff = Math.round(financials.grossAmount / (job.estimatedHours || 1))

  try {
    // 1. Create a sandboxed iframe to isolate from Tailwind CSS v4 stylesheets
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-9999px'
    iframe.style.left = '-9999px'
    iframe.style.width = '800px'
    iframe.style.height = '1200px'
    iframe.style.border = '0'
    iframe.style.opacity = '0'
    iframe.style.pointerEvents = 'none'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument
    if (!iframeDoc) throw new Error('Cannot access iframe document')

    // Always pure White Mode HTML template for downloaded PDF
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; letter-spacing: normal; }
          body { background: #ffffff; padding: 24px; }
          .num-val { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-weight: 700; white-space: nowrap; }
        </style>
      </head>
      <body>
        <div id="invoice-card" style="width: 720px; background: #ffffff; color: #0f172a; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-sizing: border-box;">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="width: 36px; height: 36px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; font-weight: bold; flex-shrink: 0; line-height: 36px; text-align: center;">
                🤝
              </div>
              <div>
                <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #064e3b;">${society.name}</h2>
                <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-top: 2px;">
                  REGISTRATION NO: ${society.regNo} • MULTI-STATE COOPERATIVE ACT
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                  ${society.address} • Phone: ${society.phone}
                </div>
              </div>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; font-weight: 700; font-size: 12px; color: #065f46; background: #ecfdf5; padding: 4px 10px; border-radius: 6px; border: 1px solid #6ee7b7;">
                ${inv.invoiceNo || 'INV-JOB-HIST'}
              </span>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${inv.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <!-- Customer & Worker Box -->
          <div style="display: flex; gap: 16px; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; margin-top: 20px; font-size: 12px;">
            <div style="flex: 1;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #64748b; display: block;">CUSTOMER:</span>
              <strong style="font-size: 14px; font-weight: bold; color: #0f172a; display: block; margin-top: 2px;">${customer.name}</strong>
              <p style="margin: 4px 0 0 0; color: #475569; line-height: 1.4;">${customer.address}</p>
            </div>
            <div style="flex: 1; border-left: 1px solid #e2e8f0; padding-left: 16px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #64748b; display: block;">ASSIGNED WORKER:</span>
              <strong style="font-size: 14px; font-weight: bold; color: #0f172a; display: block; margin-top: 2px;">${worker.name}</strong>
              <p style="margin: 4px 0 0 0; color: #047857; font-weight: 600;">${worker.trade} Trade • Verified Member</p>
            </div>
          </div>

          <!-- Line Items Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 20px; font-size: 12px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; table-layout: fixed;">
              <colgroup>
                <col style="width: 44%;">
                <col style="width: 16%;">
                <col style="width: 20%;">
                <col style="width: 20%;">
              </colgroup>
              <thead>
                <tr style="background: #f1f5f9; color: #334155; font-weight: bold; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 10px 14px;">Service Task</th>
                  <th style="padding: 10px 12px; text-align: center; white-space: nowrap;">Duration</th>
                  <th style="padding: 10px 12px; text-align: right; white-space: nowrap;">Standard Tariff</th>
                  <th style="padding: 10px 14px; text-align: right; white-space: nowrap;">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px 14px; border-bottom: none;">
                    <div style="font-weight: bold; color: #0f172a;">${job.title}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${job.description}</div>
                  </td>
                  <td style="padding: 12px 12px; text-align: center; color: #334155; font-weight: 500; white-space: nowrap;">
                    ${job.estimatedHours} hrs
                  </td>
                  <td style="padding: 12px 12px; text-align: right; color: #475569; white-space: nowrap;">
                    ₹ ${hourlyTariff} / hr
                  </td>
                  <td style="padding: 12px 14px; text-align: right; font-weight: 900; color: #047857; font-size: 14px; white-space: nowrap;">
                    ₹ ${financials.grossAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Payment & Worker Wage Settlement -->
          <div style="background: #f8fafc; color: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 20px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #047857;">
                PAYMENT & WORKER WAGE SETTLEMENT
              </span>
              <span style="font-size: 10px; color: #64748b;">Statutory Cooperative Ledger</span>
            </div>

            <div style="display: flex; justify-content: space-between; color: #334155; margin-top: 6px;">
              <span>Total Customer Payment (Gross Amount):</span>
              <span style="font-weight: 700; color: #0f172a; white-space: nowrap;">₹ ${financials.grossAmount}</span>
            </div>

            <div style="display: flex; justify-content: space-between; color: #b45309; margin-top: 5px; font-weight: 600;">
              <span>Less: Co-op 5% Maintenance Contribution:</span>
              <span style="font-weight: 700; white-space: nowrap;">- ₹ ${financials.cooperativeFeeAmount}</span>
            </div>

            <div style="display: flex; justify-content: space-between; color: #0369a1; margin-top: 5px; font-weight: 600;">
              <span>Less: Worker Welfare & Social Security Fund:</span>
              <span style="font-weight: 700; white-space: nowrap;">- ₹ ${financials.welfareFundAmount}</span>
            </div>

            <div style="height: 1px; background: #e2e8f0; margin: 8px 0;"></div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div>
                <span style="font-size: 14px; font-weight: 900; color: #047857; display: block;">Direct Worker Take-Home Pay:</span>
                <span style="font-size: 10px; color: #64748b; display: block; margin-top: 2px;">
                  Amount Calculation: ₹ ${financials.grossAmount} - ₹ ${financials.cooperativeFeeAmount} - ₹ ${financials.welfareFundAmount} = ₹ ${financials.netWorkerPayout}
                </span>
              </div>
              <span style="font-size: 18px; font-weight: 900; color: #047857; white-space: nowrap;">₹ ${financials.netWorkerPayout}</span>
            </div>

            <div style="font-size: 10px; color: #64748b; padding-top: 8px; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; margin-top: 8px;">
              <span>Payment Mode: ${financials.paymentMode}</span>
              <span style="color: #047857; font-weight: bold;">✓ ${financials.paymentStatus}</span>
            </div>
          </div>

          <!-- Completion Notes -->
          <div style="font-size: 11px; font-style: italic; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; margin-top: 16px;">
            "${job.completionNotes || 'Wiring tested successfully. Voltage stabilized.'}"
          </div>

          <!-- Footer Guarantee -->
          <div style="text-align: center; font-size: 10px; font-weight: bold; color: #64748b; margin-top: 16px;">
            Official Cooperative Federation Guarantee • 100% Transparent Statutory Ledger
          </div>
        </div>
      </body>
      </html>
    `

    iframeDoc.open()
    iframeDoc.write(invoiceHtml)
    iframeDoc.close()

    // Wait a brief tick for layout
    await new Promise((resolve) => setTimeout(resolve, 80))

    const targetEl = iframeDoc.getElementById('invoice-card')
    if (!targetEl) throw new Error('Invoice card element not found inside iframe')

    const canvas = await html2canvas(targetEl, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      window: iframe.contentWindow,
    })

    try {
      document.body.removeChild(iframe)
    } catch {
      // ignore
    }

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

    // Fill entire A4 page with pure white
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')

    const margin = 10
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
        if (page > 0) {
          pdf.addPage()
          pdf.setFillColor(255, 255, 255)
          pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        }
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
  } catch (err) {
    console.warn('Iframe html2canvas raster failed, invoking vector PDF generator fallback:', err)
    return generateVectorInvoicePdf(inv, filename)
  }
}

/**
 * Captures a DOM element and exports to PDF (used for Reports / General containers).
 * Uses sandboxed iframe isolation to avoid Tailwind v4 stylesheet parse crashes.
 */
export async function exportElementToPdf(element, filename = 'Document.pdf', options = {}) {
  if (!element) throw new Error('Element to export is not available')

  try {
    const isDark = options.backgroundColor && options.backgroundColor !== '#ffffff'

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-9999px'
    iframe.style.left = '-9999px'
    iframe.style.width = `${Math.max(element.scrollWidth || 900, 900)}px`
    iframe.style.height = `${Math.max(element.scrollHeight || 1200, 1200)}px`
    iframe.style.border = '0'
    iframe.style.opacity = '0'
    iframe.style.pointerEvents = 'none'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument
    if (!iframeDoc) throw new Error('Cannot access iframe document')

    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; letter-spacing: normal; }
          body { background: ${options.backgroundColor || '#0f1217'}; margin: 0; padding: 20px; }
          .no-pdf, .print\\:hidden { display: none !important; }
        </style>
      </head>
      <body>
        <div id="export-root">
          ${element.outerHTML}
        </div>
      </body>
      </html>
    `)
    iframeDoc.close()

    await new Promise((resolve) => setTimeout(resolve, 80))

    const targetEl = iframeDoc.getElementById('export-root') || iframeDoc.body

    const canvas = await html2canvas(targetEl, {
      scale: options.scale || 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: options.backgroundColor || '#0f1217',
      window: iframe.contentWindow,
    })

    try {
      document.body.removeChild(iframe)
    } catch {
      // ignore
    }

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

    // Set page background matching option
    if (isDark) {
      pdf.setFillColor(15, 18, 23) // #0f1217
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    } else {
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
    }

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
        if (page > 0) {
          pdf.addPage()
          if (isDark) {
            pdf.setFillColor(15, 18, 23)
            pdf.rect(0, 0, pageWidth, pageHeight, 'F')
          }
        }
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
    console.warn('Iframe element export failed, attempting direct capture fallback:', canvasErr)
    try {
      const directCanvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: options.backgroundColor || '#0f1217',
      })
      const imgData = directCanvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 10
      const contentWidth = pageWidth - margin * 2
      const contentHeight = (directCanvas.height * contentWidth) / directCanvas.width
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, undefined, 'FAST')
      const blob = pdf.output('blob')
      triggerBlobDownload(blob, filename)
      return true
    } catch (fallbackErr) {
      console.error('All PDF capture attempts failed:', fallbackErr)
      throw fallbackErr
    }
  }
}
