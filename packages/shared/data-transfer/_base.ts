import z from 'zod'

export enum Code {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  ServerError = 500,
}
export const defineZodResp = <T>(schema: z.ZodType<T>) =>
  z.object({
    statusCode: z.number(),
    message: z.string().optional(),
    data: schema.optional(),
  })

export type BaseRespType<T> = {
  statusCode: Code;
  message?: string;
  data?: T;
}
export class Resp {
  static ok<T>(data?: T, statusCode = Code.Ok, message = 'Success'): BaseRespType<T> {
    return {
      statusCode,
      message,
      data,
    }
  }

  static error(
    message: string = 'Server Error',
    statusCode: Code = Code.ServerError,
  ): BaseRespType<any> {
    return {
      statusCode,
      message,
    }
  }
}

export const ZodCheckNullResp = defineZodResp(
  z.undefined().optional(),
)
export type NullResp = z.infer<typeof ZodCheckNullResp>
