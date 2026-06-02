/**
 * Local billing state for the Super Admin "Accounts Overview" grid.
 * Tracks which company-months have had an invoice submitted (manual mode).
 */

export type BillingMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type AccountsOverviewState = {
  // companyId -> year -> month -> sent
  sent: Record<string, Record<string, Partial<Record<BillingMonth, boolean>>>>
}

const storageKey = "tresta:accountsOverview"

let _loaded = false
let _state: AccountsOverviewState = { sent: {} }

type Listener = () => void
const _listeners = new Set<Listener>()

function notify() {
  _listeners.forEach((fn) => fn())
}

function isMonth(value: unknown): value is BillingMonth {
  return (
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7 ||
    value === 8 ||
    value === 9 ||
    value === 10 ||
    value === 11 ||
    value === 12
  )
}

function safeParseState(value: unknown): AccountsOverviewState | null {
  if (!value || typeof value !== "object") return null
  const v = value as Record<string, unknown>
  if (!v.sent || typeof v.sent !== "object") return null

  const sentOut: AccountsOverviewState["sent"] = {}
  for (const [companyId, years] of Object.entries(v.sent as object)) {
    if (!years || typeof years !== "object") continue
    const yearsOut: Record<string, Partial<Record<BillingMonth, boolean>>> = {}

    for (const [year, months] of Object.entries(years as object)) {
      if (!months || typeof months !== "object") continue
      const monthsOut: Partial<Record<BillingMonth, boolean>> = {}
      for (const [monthKey, sent] of Object.entries(months as object)) {
        const monthNum = Number(monthKey)
        if (!isMonth(monthNum)) continue
        if (typeof sent !== "boolean") continue
        monthsOut[monthNum] = sent
      }
      yearsOut[year] = monthsOut
    }

    sentOut[companyId] = yearsOut
  }

  return { sent: sentOut }
}

function loadOnce() {
  if (_loaded) return
  _loaded = true
  if (typeof window === "undefined") return

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return
    const parsed = safeParseState(JSON.parse(raw))
    if (parsed) _state = parsed
  } catch {
    // ignore
  }
}

function persist() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(_state))
  } catch {
    // ignore
  }
}

export function isMonthSent(
  companyId: string,
  year: number,
  month: BillingMonth
): boolean {
  loadOnce()
  return Boolean(_state.sent[companyId]?.[String(year)]?.[month])
}

export function setMonthSent(
  companyId: string,
  year: number,
  month: BillingMonth,
  sent: boolean
) {
  loadOnce()
  const yearKey = String(year)
  const company = (_state.sent[companyId] ??= {})
  const months = (company[yearKey] ??= {})
  months[month] = sent
  persist()
  notify()
}

export function subscribeAccountsOverview(fn: Listener): () => void {
  loadOnce()
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

export const accountsOverviewStorageKey = storageKey
