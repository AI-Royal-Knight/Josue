export type VatOption = {
  label: string
  value: string
  rate: 0 | 5 | 20
}

export type CurrencyOption = {
  label: string
  value: string
  symbol: string
  code: string
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { label: "British Pound (£)", value: "GBP", symbol: "£", code: "GBP" },
  { label: "US Dollar ($)",     value: "USD", symbol: "$", code: "USD" },
  { label: "Euro (€)",          value: "EUR", symbol: "€", code: "EUR" },
]

export const VAT_OPTIONS: VatOption[] = [
  { label: "N (0%)",           value: "N_0",          rate: 0  },
  { label: "No VAT (0%)",      value: "NO_VAT_0",     rate: 0  },
  { label: "0.0% RC (0%)",     value: "RC_0",         rate: 0  },
  { label: "20.0% RC CIS (0%)",value: "RC_CIS_0",     rate: 0  },
  { label: "20.0% S (20%)",    value: "S_20",         rate: 20 },
  { label: "0.0% Z (0%)",      value: "Z_0",          rate: 0  },
  { label: "5.0% R (5%)",      value: "R_5",          rate: 5  },
  { label: "5.0% RC CIS (0%)", value: "RC_CIS_5_0",   rate: 0  },
  { label: "Exempt (0%)",      value: "EXEMPT_0",     rate: 0  },
]

export type ProjectItem = {
  id: string
  projectName: string
  jobCode: string
  /** VAT option value key from VAT_OPTIONS */
  vatRate: string
  address: string
  dateCreated: string
  projectValue: string
  startDate?: string
  completionDate?: string
  overdue?: string
  completed?: string
  materialEstimate?: string
  labourEstimate?: string
  prelimsEstimate?: string
  estimateProfit?: string
  currency?: string
  totalUnclaimed?: number
  totalOverspend?: number
  proformaNr?: number
}

export const projects: ProjectItem[] = [
  {
    id: "1",
    projectName: "Riverside Tower Development",
    jobCode: "RT-2024-001",
    vatRate: "S_20",
    address: "123 Thames Street, London",
    dateCreated: "2026-04-20",
    projectValue: "£54,156,415",
    startDate: "2028-12-10",
    completionDate: "2030-12-24",
    overdue: "",
    completed: "",
    materialEstimate: "£10,000,000",
    labourEstimate: "£20,000,000",
    prelimsEstimate: "£5,000,000",
    estimateProfit: "£15,000,000",
  },
  {
    id: "2",
    projectName: "Riverside Development",
    jobCode: "RT-2024-001",
    vatRate: "S_20",
    address: "123 Thames Street, London",
    dateCreated: "2026-04-20",
    projectValue: "£54,156,415",
    startDate: "2028-12-10",
    completionDate: "2030-12-24",
    overdue: "",
    completed: "",
    materialEstimate: "£10,000,000",
    labourEstimate: "£20,000,000",
    prelimsEstimate: "£5,000,000",
    estimateProfit: "£15,000,000",
  },
  {
    id: "3",
    projectName: "Country site Development",
    jobCode: "RT-2024-001",
    vatRate: "NO_VAT_0",
    address: "123 Thames Street, London",
    dateCreated: "2026-04-20",
    projectValue: "£54,156,415",
    startDate: "2028-12-10",
    completionDate: "2030-12-24",
    overdue: "",
    completed: "",
    materialEstimate: "£10,000,000",
    labourEstimate: "£20,000,000",
    prelimsEstimate: "£5,000,000",
    estimateProfit: "£15,000,000",
  },
  {
    id: "4",
    projectName: "Tower Development",
    jobCode: "RT-2024-001",
    vatRate: "NO_VAT_0",
    address: "123 Thames Street, London",
    dateCreated: "2026-04-20",
    projectValue: "£54,156,415",
    startDate: "2028-12-10",
    completionDate: "2030-12-24",
    overdue: "",
    completed: "",
    materialEstimate: "£10,000,000",
    labourEstimate: "£20,000,000",
    prelimsEstimate: "£5,000,000",
    estimateProfit: "£15,000,000",
  },
]
