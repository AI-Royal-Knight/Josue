/**
 * Central API client.
 * - Reads the token from localStorage on every request (SSR-safe).
 * - Throws ApiError on non-2xx responses, with the parsed JSON body attached.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as Record<string, unknown>).error)
        : `API Error: ${status}`
    super(message)
    this.status = status
    this.data = data
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("tresta:accessToken")
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** If true, do NOT attach the Authorization header */
  public?: boolean
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, headers, public: isPublic, ...rest } = options

  const token = getToken()

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: rest.method ?? (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(token && !isPublic ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  })

  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data as T
}
