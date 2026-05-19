export type InvoiceListRow = {
  no: string
  invoiceNumber: string
  date: string
  project: string
  userName: string
  sortCode: string
  accountNumber: string
  total: string
  paid: boolean
  dateScheduled: string
  releaseDate: string
  comments: string
  scheduledBy: string
}

export type SummaryRow = {
  label: string
  value: string
}
