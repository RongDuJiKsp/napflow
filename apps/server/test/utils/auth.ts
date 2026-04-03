import { expect, it } from 'vitest'
import request from 'supertest'
import type { INestApplication } from '@nestjs/common'
import type { App } from 'supertest/types'
import type TestAgent from 'supertest/lib/agent'
import type Test from 'supertest/lib/test'

/**
 * 存在 jwt 三段格式，但内容不可解码。
 */
export const INVALID_BEARER_TOKEN = 'invalid.jwt.token'

/**
 * 完全无法解码的 token（不符合 jwt 三段格式）。
 */
export const INVALID_JWT_UNDECODEABLE_TOKEN = 'invalid-jwt-token'

/**
 * 头部合法，但 payload JSON 损坏的 token。
 */
export const INVALID_JWT_BROKEN_JSON_TOKEN
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0Ig.invalid-signature'

/**
 * 头部与 payload 都合法，但签名损坏的 token。
 */
export const INVALID_JWT_BROKEN_SIGNATURE_TOKEN
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.broken-signature'

export const withAuthHeader = <T extends Test = Test>(req: T, token: string) => {
  req.set('Authorization', `Bearer ${token}`)
}

type AuthLinkCase = {
  caseName: string;
  token?: string;
}

/**
 * 为需要鉴权的端点生成完整鉴权链路测试。
 *
 * 会自动覆盖：
 * 1) 缺失 Authorization 头
 * 2) 完全不可解码 token
 * 3) 三段格式但不可解码 token
 * 4) 头部合法但 JSON 损坏 token
 * 5) 头部和 payload 合法但签名损坏 token
 */

export function itAuthLink<A extends App, Res extends Test>(
  title: string,
  getEndpoint: (agent: TestAgent) => Res,
  getApp: () => INestApplication<A>,
) {
  const cases: AuthLinkCase[] = [
    {
      caseName: '缺失 Authorization 头',
      token: undefined,
    },
    {
      caseName: '完全无法解码的 jwt token',
      token: INVALID_JWT_UNDECODEABLE_TOKEN,
    },
    {
      caseName: '存在格式但内容无法解码的 jwt token',
      token: INVALID_BEARER_TOKEN,
    },
    {
      caseName: '头部合法但 json 损坏的 jwt token',
      token: INVALID_JWT_BROKEN_JSON_TOKEN,
    },
    {
      caseName: '头部和 json 合法但签名损坏的 jwt token',
      token: INVALID_JWT_BROKEN_SIGNATURE_TOKEN,
    },
  ]

  for (const { caseName, token } of cases) {
    it(`${title} - ${caseName}`, async () => {
      const app = getApp()
      const req = getEndpoint(request(app.getHttpServer()))
      if (token) withAuthHeader(req, token)
      const res = await req
      expect(res.status).toBe(401)
    })
  }
}
