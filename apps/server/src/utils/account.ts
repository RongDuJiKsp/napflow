import { Account } from '@shared/data-transfer/account/account'
import { defineJwtBody, defineJwtHeader } from './jwt'

const { jwtSign: jwtSignAccount, jwtVerify: jwtVerifyAccount } = defineJwtBody(Account)
const { jwtHeaderC: jwtHeaderAccount } = defineJwtHeader(Account)
export { jwtSignAccount, jwtVerifyAccount, jwtHeaderAccount }
