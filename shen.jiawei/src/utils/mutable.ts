import { useForceUpdate } from "observable-hooks"
import { useEffect, useMemo, useRef } from "react"
// import { reactive } from "@vue/reactivity"

export const use2WayBinding = <T extends object>(
  obj: T,
  onSet: <K extends keyof T>(target: T, k: K, v: T[K]) => void = () => {},
  reRenderOnSet = true
) => {
  const forceUpdate = useForceUpdate()
  const createProxy = (newObj: T) =>
    new Proxy(newObj, {
      set: (target, k, v) => {
        target[k as keyof T] = v
        onSet(target, k as keyof T, v)
        reRenderOnSet && forceUpdate()
        return true
      }
    })
  const objRef = useRef(obj)
  const proxyRef = useRef(useMemo(() => createProxy(obj), []))
  useEffect(() => {
    proxyRef.current = createProxy(objRef.current)
  }, [onSet])
  return [
    proxyRef.current,
    (newObj: T) => {
      objRef.current = newObj
      proxyRef.current = createProxy(newObj)
    }
  ] as const
}

// export const use2WayBinding = <T extends object>(
//   obj: T,
//   onSet: <K extends keyof T>(target: T, k: K, v: T[K]) => void = () => {},
//   reRenderOnSet = true
// ) => {
//   const forceUpdate = useForceUpdate()
//   const createProxy = (newObj: T) => {
//     const proxy = reactive(newObj)
//   }
//   const objRef = useRef(obj)
//   const proxyRef = useRef(useMemo(() => createProxy(obj), []))
//   useEffect(() => {
//     proxyRef.current = createProxy(objRef.current)
//   }, [onSet])
//   return [
//     proxyRef.current,
//     (newObj: T) => {
//       objRef.current = newObj
//       proxyRef.current = createProxy(newObj)
//     }
//   ] as const
// }
