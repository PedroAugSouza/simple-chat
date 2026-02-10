interface HttpRequestOptions {
  params?: Record<string, string>
  body?: Record<string, number | string | object | boolean>
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  moreOptions?: RequestInit & { dispatcher?: unknown }
}

export interface HttpResponse<L, R> {
  data?: L
  error?: R
  options?: HttpRequestOptions
  status?: number
  ok?: boolean
}

export const httpRequest = async <R = any, E = any>(
  url: string,
  options?: HttpRequestOptions
): Promise<HttpResponse<R, E>> => {
  const params = new URLSearchParams({
    ...options?.params,
  })
  const method = options?.method?.toUpperCase() || 'GET'
  const hasBody = options?.body !== undefined && method !== 'GET' && method !== 'HEAD'

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: options?.method,
      body: hasBody ? JSON.stringify(options?.body) : undefined,
      headers: {
        ...options?.headers,
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        accept: 'application/json',
      },
      ...options?.moreOptions,
    })

    const contentType = response.headers.get('content-type') || ''
    const raw = await response.text()
    let parsed: unknown = undefined
    if (raw) {
      if (contentType.includes('application/json')) {
        try {
          parsed = JSON.parse(raw)
        } catch {
          parsed = raw
        }
      } else {
        parsed = raw
      }
    }

    if (!response.ok) {
      return {
        options,
        data: undefined,
        error: parsed as E,
        status: response.status,
        ok: false,
      }
    }

    return {
      options,
      data: parsed as R,
      error: undefined as E,
      status: response.status,
      ok: true,
    }
  } catch (error) {
    return {
      options,
      data: undefined,
      error: error as E,
      status: 0,
      ok: false,
    }
  }
}
