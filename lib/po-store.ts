/**
 * Simple in-memory store shared between the Quotations page and the
 * Purchase Order List page. In a real app this would be a database / API.
 */

export type PurchaseOrder = {
  no: string
  quotationRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmail: string
  dateOfQuoteApproved: string
  quoteTotal: string
  datePOCreated: string
  procurementComments: string
  approvalQuotation: "Approved" | "Rejected" | "Pending"
  approvalRelatedRequests: string
}

// Seed with rows that already had "PO Created" status
const _orders: PurchaseOrder[] = [
  {
    no: "1",
    quotationRef: "QR-2023-0891",
    project: "Downtown Tower A",
    mainFolder: "Structural",
    subFolder: "Concrete",
    variationRef: "VAR-001",
    supplierName: "BuildMat Supplies Ltd",
    supplierEmail: "sales@buildmat.com",
    dateOfQuoteApproved: "2023-10-12",
    quoteTotal: "$45,000.00",
    datePOCreated: "2023-10-14",
    procurementComments: "",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Lowest bidder, meets all specs.",
  },
  {
    no: "3",
    quotationRef: "QR-2023-0895",
    project: "Riverside Complex",
    mainFolder: "MEP",
    subFolder: "HVAC",
    variationRef: "VAR-012",
    supplierName: "CoolAir Systems",
    supplierEmail: "bids@coolair.com",
    dateOfQuoteApproved: "2023-10-15",
    quoteTotal: "$89,200.00",
    datePOCreated: "2023-10-16",
    procurementComments: "",
    approvalQuotation: "Approved",
    approvalRelatedRequests: "Preferred vendor, fast lead time.",
  },
]

type Listener = () => void
const _listeners = new Set<Listener>()

export function getOrders(): PurchaseOrder[] {
  return [..._orders]
}

export function addOrder(order: PurchaseOrder) {
  // Avoid duplicates by quotation ref
  if (_orders.some((o) => o.quotationRef === order.quotationRef)) return
  _orders.push(order)
  _listeners.forEach((fn) => fn())
}

export function subscribe(fn: Listener): () => void {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}
