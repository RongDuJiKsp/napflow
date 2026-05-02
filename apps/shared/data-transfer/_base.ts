import z from 'zod'

export enum Code {
  Ok = 200,
  BadRequest = 400,
  Forbidden = 403,
  Unauthorized = 401,
  NotFound = 404,
  ServerError = 500,
  BadGateway = 502,
}
export const defineZodResp = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  z.object({
    statusCode: z.number(),
    message: z.string().optional(),
    data: schema.nullable(),
  })

export type BaseRespType<T> = {
  statusCode: Code;
  message?: string;
  data: T | null;
}
export type ZodBaseRespType<T> = z.ZodObject<{
  statusCode: z.ZodNumber;
  message: z.ZodOptional<z.ZodString>;
  data: z.ZodNullable<z.ZodType<T>>;
}>
export class Resp {
  static ok<T>(
    data: T | null = null,
    statusCode = Code.Ok,
    message = 'Success',
  ): BaseRespType<T> {
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
      data: null,
    }
  }
}

export const ZodCheckNullResp = defineZodResp(z.void())
export type NullResp = z.infer<typeof ZodCheckNullResp>
