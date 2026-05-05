/**
 * @description 确保全局map的的形式是 Record<K, V> 但是又需要保留原始类型 因此使用泛型约束并返回原值
 */
export const defineTypedRecord = <Rec extends Record<string, unknown>>(obj: Rec): Rec => obj
