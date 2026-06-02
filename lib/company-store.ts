/**
 * Shared in-memory store for Super Admin company settings.
 *
 * Note: This is intentionally lightweight (no database). It persists in
 * localStorage on the client so edits survive refreshes during development.
 */

export type CompanyStatus = "Active" | "Suspended"

export type CompanyRecord = {
  id: string
  name: string
  adminFirstName: string
  adminSurname: string
  email: string
  phoneNumber: string
  users: number
  projects: number
  /** Whether the company is activated for invoicing */
  activated: boolean
  /** Monthly subscription amount in GBP */
  monthlySubscriptionGbp: number | null
  /** Per-user rate amount in GBP */
  perUserRateGbp: number | null
  /** Whether monthly invoices are automatically generated */
  automaticMonthlyInvoices: boolean
  status: CompanyStatus
}

const storageKey = "tresta:superAdminCompanies"

const seedCompanies: CompanyRecord[] = [
  {
    id: "buildco",
    name: "BuildCo Ltd",
    adminFirstName: "John",
    adminSurname: "Matthews",
    email: "john@buildco.com",
    phoneNumber: "+44 7700 900001",
    users: 156,
    projects: 12,
    activated: true,
    monthlySubscriptionGbp: 234,
    perUserRateGbp: 2,
    automaticMonthlyInvoices: true,
    status: "Active",
  },
  {
    id: "urbandev",
    name: "UrbanDev Inc",
    adminFirstName: "Sarah",
    adminSurname: "Johnson",
    email: "sarah@urbandev.com",
    phoneNumber: "+44 7700 900002",
    users: 92,
    projects: 8,
    activated: true,
    monthlySubscriptionGbp: 150,
    perUserRateGbp: 1.5,
    automaticMonthlyInvoices: false,
    status: "Active",
  },
  {
    id: "skyconstruct",
    name: "SkyConstruct",
    adminFirstName: "Michael",
    adminSurname: "Chen",
    email: "michael@skyconstruct.com",
    phoneNumber: "+44 7700 900003",
    users: 234,
    projects: 15,
    activated: true,
    monthlySubscriptionGbp: 234,
    perUserRateGbp: 2,
    automaticMonthlyInvoices: true,
    status: "Active",
  },
  {
    id: "metrobuild",
    name: "MetroBuild",
    adminFirstName: "Emily",
    adminSurname: "Rodriguez",
    email: "emily@metrobuild.com",
    phoneNumber: "+44 7700 900004",
    users: 78,
    projects: 6,
    activated: false,
    monthlySubscriptionGbp: 78,
    perUserRateGbp: 1,
    automaticMonthlyInvoices: false,
    status: "Suspended",
  },
]

let _companies: CompanyRecord[] = [...seedCompanies]
let _loadedFromStorage = false

type Listener = () => void
const _listeners = new Set<Listener>()

function notify() {
  _listeners.forEach((fn) => fn())
}

function safeParseCompanies(value: unknown): CompanyRecord[] | null {
  if (!Array.isArray(value)) return null
  const isStatus = (s: unknown): s is CompanyStatus =>
    s === "Active" || s === "Suspended"

  const parsed = value
    .map((row) => {
      if (!row || typeof row !== "object") return null
      const r = row as Record<string, unknown>
      if (typeof r.id !== "string" || typeof r.name !== "string") return null

      const status = isStatus(r.status) ? r.status : "Suspended"

      return {
        id: r.id,
        name: r.name,
        adminFirstName:
          typeof r.adminFirstName === "string" ? r.adminFirstName : "",
        adminSurname: typeof r.adminSurname === "string" ? r.adminSurname : "",
        email: typeof r.email === "string" ? r.email : "",
        phoneNumber: typeof r.phoneNumber === "string" ? r.phoneNumber : "",
        users: typeof r.users === "number" ? r.users : 0,
        projects: typeof r.projects === "number" ? r.projects : 0,
        activated: typeof r.activated === "boolean" ? r.activated : false,
        monthlySubscriptionGbp:
          typeof r.monthlySubscriptionGbp === "number"
            ? r.monthlySubscriptionGbp
            : null,
        perUserRateGbp:
          typeof r.perUserRateGbp === "number" ? r.perUserRateGbp : null,
        automaticMonthlyInvoices:
          typeof r.automaticMonthlyInvoices === "boolean"
            ? r.automaticMonthlyInvoices
            : false,
        status,
      } satisfies CompanyRecord
    })
    .filter(Boolean) as CompanyRecord[]

  return parsed.length ? parsed : null
}

function loadFromStorageOnce() {
  if (_loadedFromStorage) return
  _loadedFromStorage = true
  if (typeof window === "undefined") return

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return
    const parsed = safeParseCompanies(JSON.parse(raw))
    if (parsed) _companies = parsed
  } catch {
    // ignore storage errors
  }
}

function persistToStorage() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(_companies))
  } catch {
    // ignore storage errors
  }
}

export function getCompanies(): CompanyRecord[] {
  loadFromStorageOnce()
  return [..._companies]
}

export function updateCompany(id: string, patch: Partial<CompanyRecord>) {
  loadFromStorageOnce()
  const idx = _companies.findIndex((c) => c.id === id)
  if (idx === -1) return

  _companies[idx] = { ..._companies[idx], ...patch }
  persistToStorage()
  notify()
}

export function subscribeCompanies(fn: Listener): () => void {
  loadFromStorageOnce()
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

export const companyStoreStorageKey = storageKey
