// import { useObservableCallback, useSubscription } from "observable-hooks"
import { useObservable, useObservableState } from "observable-hooks"
import {
  BehaviorSubject,
  connectable,
  filter,
  map,
  Observable,
  share,
  Subject,
  switchMap,
  tap
  // OperatorFunction
} from "rxjs"
import { FilterKeyByValueType, InterfaceToUnion } from "./types"

// export const useObservableCallbackSubscription = (props: {
//   pipe: Array<OperatorFunction<unknown, unknown>>
//   next: Parameters<typeof useSubscription>[1]
//   error?: Parameters<typeof useSubscription>[2]
//   complete?: Parameters<typeof useSubscription>[3]
// }) => {
//   const [handler, observable] = useObservableCallback(ob =>
//     ob.pipe(
//       ...(props.pipe as Parameters<InstanceType<typeof Observable>["pipe"]>)
//     )
//   )
//   useSubscription(observable, props.next, props.error, props.complete)
//   return handler
// }

export const connectBehaviorSubject = <T>(
  observable: Observable<T>,
  initialValue: T
) => {
  const o = connectable(observable, {
    connector: () => new BehaviorSubject(initialValue),
    resetOnDisconnect: false
  })
  o.connect()
  return o
}

export type MethodCallEvent<T> = InterfaceToUnion<{
  [P in keyof T as T[P] extends (...args: any) => any ? P : never]: {
    name: P
    args: Parameters<T[P] extends (...args: any) => any ? T[P] : never>
  }
}>
export const watchMethodCall = <T extends object>(obj: T) => {
  // type MethodNames = FilterKeyByValueType<T, (...args: any) => any>
  // type Methods = T[MethodNames extends keyof T ? MethodNames : never]
  // type Args = Methods extends (...args: infer A) => any ? A : never
  // type Args = InterfaceToUnion<{
  //   [P in keyof T as T[P] extends (...args: any) => any
  //     ? P
  //     : never]: Parameters<T[P] extends (...args: any) => any ? T[P] : never>
  // }>
  const subject = new Subject<MethodCallEvent<T>>()
  return [
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === "function"
          ? (...args: unknown[]) => {
              subject.next({
                name: k,
                args
              } as MethodCallEvent<T>)
              return v(...args)
            }
          : v
      ])
    ) as T,
    subject
  ] as const
}

export const useWatchMethodCall = <T extends object>(obj: T) => {
  const watched$ = useObservable(
    obj$ =>
      connectBehaviorSubject(
        obj$.pipe(map(([obj]) => watchMethodCall(obj))),
        null
      ).pipe(filter(w => w !== null)),
    [obj]
  )
  const [wrappedObj] = useObservableState(
    () => watched$.pipe(map(([obj]) => obj)),
    obj
  )
  const subject = useObservable(
    () => watched$.pipe(switchMap(([, subject]) => subject)),
    [watched$]
  )
  return [wrappedObj, subject] as const
}
