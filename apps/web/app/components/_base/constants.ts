import { EnvAssertError, assertValue } from '@shared/utils/assert'
export const STRENGTH_PASSWORD_LENGTH = assertValue(Number(process.env.STRENGTH_PASSWORD_LENGTH ?? '8'), val => !Number.isNaN(val) && val > 0, val => new EnvAssertError('STRENGTH_PASSWORD_LENGTH', `${val} must be number and greater than 0`))
