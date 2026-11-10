/**
 * Central API client.
 * - Reads the token from localStorage on every request (SSR-safe).
 * - Throws ApiError on non-2xx responses, with the parsed JSON body attached.
 */

/**
 * Resolves the API base URL.
 * - In the browser on tresta.cloud, safely defaults to https://api.tresta.cloud/api/v1
 *   (preventing accidental localhost calls if built without production environment variables).
 * - Otherwise reads NEXT_PUBLIC_API_URL, falling back to http://localhost:8000/api/v1.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.endsWith("tresta.cloud")) {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return "https://api.tresta.cloud/api/v1";
      }
      return envUrl;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
}

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const apiBase = getApiBaseUrl();
  const hostUrl = apiBase.replace(/\/api\/v1\/?$/, ""); // strip /api/v1

  if (
    path.startsWith("http://localhost:8000") ||
    path.startsWith("http://127.0.0.1:8000") ||
    path.startsWith("http://backend:8000") ||
    path.startsWith("http://testserver")
  ) {
    const relativePart = path.replace(/^https?:\/\/[^\/]+/, "");
    return `${hostUrl}${relativePart.startsWith("/") ? "" : "/"}${relativePart}`;
  }

  if (path.startsWith("http")) {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      path.startsWith("http://") &&
      !path.includes("localhost") &&
      !path.includes("127.0.0.1")
    ) {
      return path.replace(/^http:\/\//, "https://");
    }
    return path;
  }
  
  return `${hostUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    let message = status === 413
      ? "The attached file is too large. Please select a smaller file (under 100MB) or compress it."
      : `API Error: ${status}`
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>
      if ("error" in record && typeof record.error === "string") {
        message = record.error
      } else if ("detail" in record && typeof record.detail === "string") {
        message = record.detail
      }
    }
    super(message)
    this.status = status
    this.data = data
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("tresta:accessToken")
}

function getActiveRole(): string | null {
  if (typeof window === "undefined") return null
  const role = localStorage.getItem("tresta:activeRole")
  if (role) return role
  try {
    const raw = localStorage.getItem("tresta:selectedRole")
    if (raw) {
      if (!raw.startsWith("{")) return raw.trim()
      const parsed = JSON.parse(raw)
      if (parsed?.state?.role) return parsed.state.role
    }
  } catch {}
  return null
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
  const activeRole = getActiveRole()
  const isFormData = body instanceof FormData

  const apiBase = getApiBaseUrl()
  const response = await fetch(`${apiBase}${endpoint}`, {
    method: rest.method ?? (body ? "POST" : "GET"),
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token && !isPublic ? { Authorization: `Bearer ${token}` } : {}),
      ...(activeRole && !isPublic ? { "X-Active-Role": activeRole } : {}),
      ...headers,
    },
    body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
    ...rest,
  })

  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    if (response.status === 413 && !data) {
      data = { error: "The attached file is too large. Please select a smaller file (under 25MB) or compress it." }
    }
    if (response.status === 401 && !isPublic) {
      if (typeof window !== "undefined") {
        // Clear token directly to ensure it's removed immediately
        localStorage.removeItem("tresta:accessToken")
        localStorage.removeItem("tresta:refreshToken")

        // Dynamically import to avoid circular dependency or SSR issues
        import("@/lib/auth-store").then(({ useAuthStore }) => {
          useAuthStore.getState().logout()
        }).catch(() => { })

        window.location.href = "/sign-in"
      }
    }
    throw new ApiError(response.status, data)
  }

  return data as T
}
