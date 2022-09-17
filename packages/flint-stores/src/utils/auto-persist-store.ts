import { autorun, makeAutoObservable, toJS } from "mobx";

type LSPersistStore<TStore> = [number, TStore];

/** 数据持久化存储 */
export function autoPersistStore<TStore extends object>({
  storeLSName,
  store,
  version = 1,
}: {
  storeLSName: string;
  store: TStore;
  version?: number;
}): void {
  const config = getLSStore<TStore>(storeLSName, version);
  if (config) {
    const keys = Object.keys(config) as unknown as Array<keyof TStore>;
    for (const key of keys) {
      if (typeof store[key] !== "function") {
        store[key] = config[key];
      }
    }
  }

  // 使得 store 响应式
  makeAutoObservable(store);
  // store 的响应属性发生修改时出发
  autorun(() => setLSStore(storeLSName, toJS(store), version));
}

// 获取 localStorage 的数据，数据版本不对则清除数据
function getLSStore<TStore>(storeLSName: string, lsVersion: number): null | TStore {
  try {
    const str = localStorage.getItem(storeLSName);
    if (!str) {
      return null;
    }

    const [version, store]: LSPersistStore<TStore> = JSON.parse(str);
    if (version !== lsVersion) {
      setLSStore(storeLSName, null, lsVersion);
      return null;
    }

    return store;
  } catch (e) {
    return null;
  }
}

function setLSStore<TStore>(storeLSName: string, configStore: TStore, lsVersion: number): void {
  localStorage.setItem(storeLSName, JSON.stringify([lsVersion, configStore]));
}
