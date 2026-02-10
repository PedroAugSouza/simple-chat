import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { CompactEncrypt, compactDecrypt } from 'jose'
import { createSecretKey } from 'crypto'
import { getA256Key } from './crypto-key'

const secretB64 = 'asdsadawds'
const key = createSecretKey(Buffer.from(secretB64, 'base64'))

export async function setEncryptedCookie(
  res: NextResponse,
  name: string,
  payload: unknown,
  maxAgeSec: number,
  path = '/'
) {
  const jwe = new CompactEncrypt(
    new TextEncoder().encode(JSON.stringify(payload))
  )
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(getA256Key())

  res.cookies.set({
    name,
    value: await jwe,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path,
    maxAge: maxAgeSec,
  })
}

export async function getEncryptedCookie<T = unknown>(
  name: string
): Promise<T | null> {
  const jar = await cookies()
  const v = jar.get(name)?.value

  
  if (!v) return null
  try {
    const { plaintext } = await compactDecrypt(v, getA256Key())
    return JSON.parse(new TextDecoder().decode(plaintext))
  } catch {
    return null
  }
}
