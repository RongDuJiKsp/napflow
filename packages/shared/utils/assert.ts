// 预定义 assertError
export class EnvAssertError extends Error {
  constructor(envName: string, message?: string) {
    super(`EnvAssertError: env ${envName} is not valid  ${message}`)
    this.name = 'EnvAssertError'
  }
}
export class ValueAssertError extends Error {
  constructor(value: any) {
    super(`ValueAssertError: value ${value} is not valid`)
    this.name = 'ValueAssertError'
  }
}
export class ValueNotFoundError extends Error {
  constructor(name: string) {
    super(`ValueNotFoundError: value ${name} is not found`)
    this.name = 'ValueNotFoundError'
  }
}
/**
 * 断言 value 是否有效
 * @param value 要断言的值
 * @param valid 断言函数, 如果不存在，那么断言value不为 undefined|null (NonNullable)
 * @param errorFac 错误工厂函数, 如果不存在，那么抛出 ValueAssertError
 * @returns 断言后的值
 */
export const assertValue = <Value, Vaild extends ((val: Value) => boolean) | undefined = undefined, ErrFac extends ((val: Value) => Error) | undefined = undefined>(value: Value, valid?: Vaild, errorFac?: ErrFac): Vaild extends undefined ? NonNullable<Value> : Value => {
  // 如果 valid 不存在，那么 断言value不为 undefined|null
  const hasError = valid ? !valid(value) : [null, undefined].includes(value as any)
  if (hasError)
    throw errorFac ? errorFac(value) : new ValueAssertError(value)
  return value as Vaild extends undefined ? NonNullable<Value> : Value
}

export const assertExist = <Value>(value: Value, valueName?: string): NonNullable<Value> => {
  return assertValue(value, undefined, () => valueName ? new ValueNotFoundError(valueName) : new ValueAssertError(value))
}
