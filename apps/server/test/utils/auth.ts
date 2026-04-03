import { expect, it } from 'vitest'

export const INVALID_BEARER_TOKEN = 'invalid.jwt.token'

export function withBearerToken(token: string): string {
  return `Bearer ${token}`
}

export function itUnauthorized<T extends { status: number }>(
  title: string,
  sendRequest: () => Promise<T>,
  assertAfter?: (res: T) => void | Promise<void>,
) {
  it(title, async () => {
    const res = await sendRequest()
    expect(res.status).toBe(401)
    if (assertAfter) await assertAfter(res)
  })
}

export function itForbidden<T extends { status: number }>(
  title: string,
  sendRequest: () => Promise<T>,
  assertAfter?: (res: T) => void | Promise<void>,
) {
  it(title, async () => {
    const res = await sendRequest()
    expect(res.status).toBe(403)
    if (assertAfter) await assertAfter(res)
  })
}
