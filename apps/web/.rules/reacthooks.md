## React hooks规则

当原生钩子不能满足时优先使用ahooks内的钩子 不要重复造太多轮子

## zusland定义规则

使用createStore的二阶函数定义storeCreator 使用 useCreation实现单例 使用createContext 实现透传

```tsx
import { createStore } from "zustand";
import { useCreation } from "ahooks";
const createBearStore = () => {
  return createStore((set) => ({
    bear: 0,
    fish: 0,
    addBear() {
      set((state) => ({
        bear: state.bear + 1,
      }));
    },
    addFish() {
      set((state) => ({
        fish: state.fish + 1,
      }));
    },
  }));
};
const BearContext = createContext(null);
const useBearStore = () => useContext(BearContext);
const BearPovider = ({ children }: PropsWithChildren) => {
  const store = useCreation(() => createBearStore(), []);
  return <BearContext.Provider value={store}>{children}</BearContext.Provider>;
};
```
