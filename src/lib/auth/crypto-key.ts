export function getA256Key(): Uint8Array {
  const b64 = process.env.APP_JWE_SECRET!
  const buf = Buffer.from(b64, 'base64')
  if (buf.length !== 32) {
    throw new Error(
      `APP_JWE_SECRET precisa ter 32 bytes (base64). Recebidos: ${buf.length}`
    )
  }
  return new Uint8Array(buf)
}
