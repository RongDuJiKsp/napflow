import z from 'zod'

export enum Code {
  Ok = 200,
  NotFound = 404,
  ServerError = 500,
}
export const defineZodResp = <T>(schema: z.ZodType<T>) =>
  z.object({
    code: z.number(),
    msg: z.string().optional(),
    data: schema.optional(),
  })

export type BaseRespType<T> = {
  code: Code;
  msg?: string;
  data?: T;
}
export class Resp {
  static ok<T>(data: T, code = Code.Ok, msg = 'Success'): BaseRespType<T> {
    return {
      code,
      msg,
      data,
    }
  }

  static error(
    msg: string = 'Server Error',
    code: Code = Code.ServerError,
  ): BaseRespType<any> {
    return {
      code,
      msg,
    }
  }
}
