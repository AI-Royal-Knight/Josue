import InvoiceListClient from "./_components/InvoiceListClient"
import { InvoiceListRow } from "./types/invoice"

async function getInvoices(): Promise<InvoiceListRow[]> {
  return [
    {
      no: "1",
      invoiceNumber: "INV-2024-001",
      date: "2024-01-15",
      project: "Project Alpha",
      userName: "John Smith",
      sortCode: "12-34-56",
      accountNumber: "12345678",
      total: "£2,500",
      paid: true,
      dateScheduled: "2024-01-20",
      releaseDate: "2024-01-22",
      comments: "Approved by manager",
      scheduledBy: "John Smith",
    },
    {
      no: "2",
      invoiceNumber: "INV-2024-002",
      date: "2024-01-16",
      project: "Project Beta",
      userName: "Sarah Johnson",
      sortCode: "23-45-67",
      accountNumber: "23456789",
      total: "£3,750",
      paid: false,
      dateScheduled: "2024-01-25",
      releaseDate: "2024-01-27",
      comments: "Pending review",
      scheduledBy: "Sarah Johnson",
    },
    {
      no: "3",
      invoiceNumber: "INV-2024-003",
      date: "2024-01-17",
      project: "Project Gamma",
      userName: "Michael Brown",
      sortCode: "34-56-78",
      accountNumber: "34567890",
      total: "£1,850",
      paid: true,
      dateScheduled: "2024-01-21",
      releaseDate: "2024-01-23",
      comments: "Completed",
      scheduledBy: "Michael Brown",
    },
    {
      no: "4",
      invoiceNumber: "INV-2024-004",
      date: "2024-01-18",
      project: "Project Delta",
      userName: "Emma Wilson",
      sortCode: "45-67-89",
      accountNumber: "45678901",
      total: "£4,200",
      paid: false,
      dateScheduled: "2024-01-26",
      releaseDate: "2024-01-28",
      comments: "Awaiting approval",
      scheduledBy: "Emma Wilson",
    },
    {
      no: "5",
      invoiceNumber: "INV-2024-005",
      date: "2024-01-19",
      project: "Project Epsilon",
      userName: "James Davis",
      sortCode: "56-78-90",
      accountNumber: "56789012",
      total: "£3,100",
      paid: true,
      dateScheduled: "2024-01-22",
      releaseDate: "2024-01-24",
      comments: "Processed",
      scheduledBy: "James Davis",
    },
  ]
}

async function getSummaryStats() {
  return [
    { label: "Approved Invoices", value: "1000" },
    { label: "Approved Invoices Value", value: "£400" },
    { label: "Invoices Due This Week", value: "200" },
    { label: "Invoices Value Due This Week", value: "£200" },
    { label: "Invoices Paid QTY", value: "200" },
    { label: "Invoices Paid Value", value: "£200" },
  ]
}

export default async function page() {
  const [invoices, summaryRows] = await Promise.all([
    getInvoices(),
    getSummaryStats(),
  ])

  return <InvoiceListClient initialRows={invoices} summaryRows={summaryRows} />
}
