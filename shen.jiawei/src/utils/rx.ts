import { useObservableCallback, useSubscription } from "observable-hooks"
import type { Observable, OperatorFunction } from "rxjs"

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
