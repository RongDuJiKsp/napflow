/*
* 仿照classNames这个库的cn函数 用于在满足多个条件的switch
* 返回第一个满足转为Bool为true的值
* @exemple
* const val=first(
* cond1&&config1
* cond2&&config2
* cond3&&config3
* )
* //当cond1=false 2，3为true时返回config2
* */
export function choose<T>(...args: (T | undefined | null | false | '')[]): T | undefined {
  for(const item of args) {
    if(item)
      return item
  }
  return undefined
}
