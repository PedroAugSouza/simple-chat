export function base64url(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  const str = Buffer.from(bytes).toString('base64')
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function randomString(bytes = 32) {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return base64url(arr)
}

export async function sha256(input: string) {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64url(digest)
}
