export default class Piscina<Params = any, Result = any> {
  static readonly isPiscina = true

  constructor(_options?: Record<string, any>) {}

  async run(_params?: Params): Promise<Result> {
    return JSON.stringify('mocked') as Result
  }
}
