export enum AdapterTag {
  napcatWs,
}

// 带一些meta方便create
export type BotAdapter = {
  readonly tag: AdapterTag;
  readonly desc: string;
}
export type BotAdapterClass = {
  readonly meta: BotAdapter;
}
