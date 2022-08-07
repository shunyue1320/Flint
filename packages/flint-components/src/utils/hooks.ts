import { DependencyList, RefObject, useCallback, useEffect, useRef, useMemo } from "react";
import { computed, IComputedValueOptions, IComputedValue } from "mobx";

export function useIsUnMounted(): RefObject<boolean> {
  const isUnMountRef = useRef(false);
  useEffect(
    () => () => {
      isUnMountRef.current = true;
    },
    [],
  );
  return isUnMountRef;
}

/**
 * Leave promise unresolved when the component is unmounted.
 * @example
 * ```ts
 * const sp = useSafePromise()
 * setLoading(true)
 * try {
 *   const result1 = await sp(fetchData1())
 *   const result2 = await sp(fetchData2(result1))
 *   setData(result2)
 * } catch(e) {
 *   setHasError(true)
 * }
 * setLoading(false)
 * ```
 */
export function useSafePromise(): <T, E = unknown>(
  promise: PromiseLike<T>,
  /** When error occurs after the component is unmounted */
  onUnmountedError?: (error: E) => void,
) => Promise<T> {
  const isUnMountRef = useIsUnMounted();

  function safePromise<T, E = unknown>(
    promise: PromiseLike<T>,
    onUnmountedError?: (error: E) => void,
  ): Promise<T> {
    // the async promise executor is intended
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const result = await promise;
        // 当异步请求成功后，此时组件已经销毁时不返回成功的promise
        if (!isUnMountRef.current) {
          resolve(result);
        }
        // unresolved promises will be garbage collected.
      } catch (error) {
        if (!isUnMountRef.current) {
          reject(error);
        } else if (onUnmountedError) {
          onUnmountedError(error as E);
        } else {
          if (process.env.NODE_ENV === "development") {
            console.error("An error occurs from a promise after a component is unmounted", error);
          }
        }
      }
    });
  }

  return useCallback(safePromise, [isUnMountRef]);
}

/**
 * 计算出的值可用于从其他可观测值中获得信息。
 * @see {@link https://mobx.js.org/computeds.html}
 *
 * @param func 从其他可观测数据中获取信息
 * @param extraDeps 如果使用了不可观测值，则提供额外的相关性以重新计算
 */
export function useComputed<T>(
  func: () => T,
  extraDeps: DependencyList = [],
  opts?: IComputedValueOptions<T>,
): IComputedValue<T> {
  // MobX takes care of the deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => computed(func, opts), extraDeps);
}
