/**
 * @description 插件服务是一个具有挂载和卸载功能的服务接口。它允许定义一个插件服务，该服务可以在需要时被挂载到系统中，并且在不需要时被卸载。
 * @template Dependencies - 插件服务所需的依赖项类型，可以是任何类型的数组。挂载函数将接受这些依赖项作为参数，以便在挂载过程中使用。
 * @property {function} mount - 挂载函数，接受依赖项作为参数。当调用该函数时，插件服务将被挂载到系统中，并且可以使用提供的依赖项进行初始化或配置。
 * @property {function} unmount - 卸载函数，当调用该函数时，插件服务将从系统中卸载，并且可以执行任何必要的清理操作。卸载的插件保证能被重新挂载
 */
export type PluginService<Dependencies extends any[] = any> = {
  mount: (...args: Dependencies) => void
  unmount: () => void
}
