// component nodes
export enum ComponentNodesEnum {
  Trigger = 'trigger',
  Reply = 'reply',
}
// node env
export enum VarTypes {
  String = 'string',
  Number = 'number',
  StringArray = 'Array<string>',
  NumberArray = 'Array<number>',
}
export type Var = {
  name: string;
  type: VarTypes;
}
export type ComponentNodeMeta = {
  type: ComponentNodesEnum;
  vars: Var[];
}
