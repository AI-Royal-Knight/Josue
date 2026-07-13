/**
 * Shared in-memory store for user invoices.
 * Manager approves first → appears in finance team's view → finance approves → paid.
 */

export type UserInvoice = {
  no: string
  invoiceNumber: string
  date: string
  variationSheetNo: string
  nfiProformaNo: string
  project: string
  workArea: string
  workSection: string
  description: string
  createdBy: string
  /** Set when manager toggles approval */
  managerApproved: boolean
  managerApprovedBy: string
  managerApprovedDate: string
  /** Set when finance team toggles approval */
  financeApproved: boolean
  approvedBy: string
  total: string
  datePaid: string
  paidBy: string
  financeComments: string
  commercialComments: string
  companyId?: string
  supplierEmail?: string
}

const _invoices: UserInvoice[] = [
  {
    no: "1",
    invoiceNumber: "INV-2024-003",
    date: "15/03/2024",
    variationSheetNo: "VS-012",
    nfiProformaNo: "NFI-045",
    project: "Al Barsha Tower",
    workArea: "Zone B",
    workSection: "Structural",
    description: "Concrete pouring for Level 5",
    createdBy: "Ahmed K.",
    managerApproved: true,
    managerApprovedBy: "Mohammad R.",
    managerApprovedDate: "16/03/2024",
    financeApproved: true,
    approvedBy: "Sarah L.",
    total: "£145,000.00",
    datePaid: "22/03/2024",
    paidBy: "Sarah L.",
    financeComments: "Cleared",
    commercialComments: "Approved",
  },
  {
    no: "2",
    invoiceNumber: "INV-2024-004",
    date: "20/03/2024",
    variationSheetNo: "VS-015",
    nfiProformaNo: "NFI-048",
    project: "Dubai Marina Plaza",
    workArea: "Zone C",
    workSection: "",
    description: "",
    createdBy: "",
    managerApproved: false,
    managerApprovedBy: "",
    managerApprovedDate: "",
    financeApproved: false,
    approvedBy: "",
    total: "",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "3",
    invoiceNumber: "INV-2024-005",
    date: "28/03/2024",
    variationSheetNo: "VS-018",
    nfiProformaNo: "NFI-052",
    project: "Dubai Marina Plaza",
    workArea: "Zone A",
    workSection: "MEP",
    description: "HVAC installation Phase 2",
    createdBy: "Omar S.",
    managerApproved: true,
    managerApprovedBy: "Fatima H.",
    managerApprovedDate: "29/03/2024",
    financeApproved: true,
    approvedBy: "Sarah L.",
    total: "£89,500.00",
    datePaid: "05/04/2024",
    paidBy: "Sarah L.",
    financeComments: "Processed",
    commercialComments: "Verified",
  },
  {
    no: "4",
    invoiceNumber: "INV-2024-006",
    date: "01/04/2024",
    variationSheetNo: "VS-020",
    nfiProformaNo: "NFI-058",
    project: "Al Barsha Tower",
    workArea: "Zone C",
    workSection: "Electrical",
    description: "Main distribution board installation",
    createdBy: "Khalid M.",
    managerApproved: true,
    managerApprovedBy: "Mohammad R.",
    managerApprovedDate: "02/04/2024",
    financeApproved: false,
    approvedBy: "",
    total: "£62,000.00",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
  {
    no: "5",
    invoiceNumber: "INV-2024-007",
    date: "05/04/2024",
    variationSheetNo: "VS-022",
    nfiProformaNo: "NFI-061",
    project: "Dubai Marina Plaza",
    workArea: "Zone B",
    workSection: "Civil",
    description: "Foundation works Block D",
    createdBy: "Yusuf A.",
    managerApproved: false,
    managerApprovedBy: "",
    managerApprovedDate: "",
    financeApproved: false,
    approvedBy: "",
    total: "£110,000.00",
    datePaid: "",
    paidBy: "",
    financeComments: "",
    commercialComments: "",
  },
]

type Listener = () => void
const _listeners = new Set<Listener>()

export function getInvoices(): UserInvoice[] {
  return [..._invoices]
}

export function updateInvoice(no: string, patch: Partial<UserInvoice>) {
  const idx = _invoices.findIndex((i) => i.no === no)
  if (idx === -1) return
  _invoices[idx] = { ..._invoices[idx], ...patch }
  _listeners.forEach((fn) => fn())
}

export function addInvoice(invoice: UserInvoice) {
  _invoices.push(invoice)
  _listeners.forEach((fn) => fn())
}

export function subscribe(fn: Listener): () => void {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}
