import { useObservableCallback, useSubscription } from "observable-hooks"
import { filter, Observable, switchMap } from "rxjs"

export const useMutationObserver = <T extends Node>(
  callback: MutationCallback,
  options?: MutationObserverInit
) => {
  const [ref, observer$] = useObservableCallback<unknown, T>(node$ =>
    node$.pipe(
      filter(node => node instanceof Node),
      switchMap(node => {
        const observer = new MutationObserver(callback)
        observer.observe(node, options)
        return new Observable(() => () => observer.disconnect())
      })
    )
  )
  useSubscription(observer$)
  return ref
}
