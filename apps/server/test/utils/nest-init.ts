import 'reflect-metadata'
import { vi } from 'vitest'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import type { App } from 'supertest/types'
import { AppModule } from '../../src/app.module'
import { TypeOrmService } from '../../src/apps/db/typeorm.service'
import { JwtService } from '../../src/apps/account/jwt.service'
import { UserRole } from '@shared/common/account/core'

/**
 * E2E 测试启动上下文。
 */
export type E2EContext = {
  app: INestApplication<App>;
  jwtService: JwtService;
  module: TestingModule;
}

/**
 * 创建基础数据库 mock，实现账号链路常用仓库方法。
 */
export function createBaseMockTypeOrmService() {
  return {
    user: {
      findOne: vi.fn().mockResolvedValue(null),
      find: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      softDelete: vi.fn().mockResolvedValue({ affected: 1 }),
    },
    userGroup: {
      find: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    },
  }
}

/**
 * 创建并初始化 E2E Nest 应用，注入指定 TypeOrmService mock。
 */
export async function createE2EApp(
  mockTypeOrmService: Record<string, any>,
): Promise<E2EContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(TypeOrmService)
    .useValue(mockTypeOrmService)
    .compile()

  const app = moduleFixture.createNestApplication()
  await app.init()

  const jwtService = moduleFixture.get<JwtService>(JwtService)

  return { app, jwtService, module: moduleFixture }
}

/**
 * 基于 JwtService 构建 Admin/User 两类测试 token 工厂。
 */
export function createTokenFactory(jwtService: JwtService) {
  return {
    getAdminToken(overrides?: { email?: string; nickname?: string }): string {
      return jwtService.account.jwtSign({
        email: overrides?.email ?? 'admin@test.com',
        nickname: overrides?.nickname ?? 'AdminUser',
        userGroup: [
          { groupType: UserRole.Admin },
          { groupType: UserRole.User },
        ],
      })
    },
    getUserToken(overrides?: { email?: string; nickname?: string }): string {
      return jwtService.account.jwtSign({
        email: overrides?.email ?? 'user@test.com',
        nickname: overrides?.nickname ?? 'TestUser',
        userGroup: [{ groupType: UserRole.User }],
      })
    },
  }
}
