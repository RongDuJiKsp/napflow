##### 代码规范建议
base 依赖entity entity依赖core core只依赖库/其他地方的utils
base 负责各种dto 从entity里面派生
注意 定义POJO时 使用nullable而不是optional
