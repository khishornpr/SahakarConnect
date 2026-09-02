// Official Cooperative Service Invoice Generator & Print Formatter
// Society: Delhi Shramik Sahakari Federation Ltd. (Reg: DEL/LAB-COOP/2021/894)

export function generateInvoiceData(job, worker, household, wageLedgerItem) {
  const gross = wageLedgerItem?.gross_amount || job?.final_amount || job?.estimated_amount || 600
  const coopFeePct = wageLedgerItem?.cooperative_fee_pct || 5.0
  const coopFeeAmount = wageLedgerItem?.cooperative_fee_amount || (gross * coopFeePct) / 100
  const welfareFund = wageLedgerItem?.welfare_fund_amount || 10.0
  const netPayout = wageLedgerItem?.net_payout || gross - coopFeeAmount - welfareFund

  return {
    invoiceNo: `INV-${(job?.id || 'JOB').slice(0, 8).toUpperCase()}`,
    date: new Date(job?.completed_at || job?.created_at || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    society: {
      name: 'Delhi Shramik Sahakari Federation Ltd.',
      regNo: 'DEL/LAB-COOP/2021/894',
      address: 'Cooperative Bhavan, Siri Fort Institutional Area, New Delhi - 110049',
      phone: '+91 11 2689 4432',
      email: 'billing@delhicoop.in',
    },
    customer: {
      name: household?.full_name || job?.household?.full_name || 'Household Customer',
      address: job?.address || 'New Delhi, Delhi-NCR',
      area: job?.area || 'South Delhi',
    },
    worker: {
      name: worker?.full_name || job?.worker?.full_name || 'Verified Worker',
      trade: job?.trade_category || 'Skilled Craftsman',
      rating: worker?.rating || 4.9,
    },
    job: {
      id: job?.id,
      title: job?.title,
      description: job?.description,
      scheduledTime: job?.scheduled_time_slot,
      estimatedHours: job?.estimated_hours || 2.0,
      completionNotes: job?.completion_notes || 'Service verified and completed satisfactorily.',
    },
    financials: {
      grossAmount: gross,
      cooperativeFeePct: coopFeePct,
      cooperativeFeeAmount: coopFeeAmount,
      welfareFundAmount: welfareFund,
      netWorkerPayout: netPayout,
      paymentMode: wageLedgerItem?.payment_mode || 'UPI Instant Settlement',
      paymentStatus: 'PAID & SETTLED',
    },
  }
}
