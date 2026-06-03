export type CallOffHistoryEntry = {
  callOffRef: string
  callOffDate: string
  callOffQty: number
  callOffPrice: string
  callOffBy: string
  approveBy: string
  expectedDeliveryDate: string
}

export type CallOffRow = {
  poRef: string
  callOffRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmail: string
  no: string
  productDescription: string
  totalQty: number
  unit: string
  unitPrice: string
  unitPriceNum: number
  qtyRemaining: number
  callOffQty: number
  callOffPrice: string
  callOffDate: string
  expectedDeliveryDate: string
  callOffBy: string
  approveBy: string
  history: CallOffHistoryEntry[]
  /** Procurement-only: whether management has approved this call-off request */
  managementApproved: boolean
  /** Procurement-only: date management approved, null until toggled on */
  managementApprovedDate: string | null
}

export type CallOffOrderLine = {
  callOffRef: string
  productDescription: string
  unit: string
  unitPrice: string
  unitPriceNum: number
  qtyRemaining: number
  expectedDelivery: string
  orderQty: number
}

export type PODialogState = {
  poRef: string
  supplierName: string
  supplierEmail: string
  lines: CallOffOrderLine[]
  focusRef?: string
}

export type HistoryDialogState = {
  poRef: string
  callOffRef: string
  productDescription: string
  totalQty: number
  unit: string
  unitPrice: string
  history: CallOffHistoryEntry[]
}
