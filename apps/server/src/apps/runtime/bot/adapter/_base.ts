export enum AdapterTag {
  napcatWs,
}

// 带一些meta方便create 这玩意对前端透明
export type BotAdapter = {
  readonly adapterDesc: string
  readonly adapterTag: AdapterTag
}
