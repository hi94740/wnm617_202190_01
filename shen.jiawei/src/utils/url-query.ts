import { useObservable } from "observable-hooks"
import { useMemo } from "react"
import { useHistory } from "react-router"
import { distinctUntilChanged, map } from "rxjs"
import { useHistoryObservable } from "./history"
import { TupleToUnion } from "./types"

const editingMethods = ["append", "delete", "set"] as const
type EditingMethods = TupleToUnion<typeof editingMethods>

export const useURLQuery = () => {
  const { push, replace, location } = useHistory()
  const query = useMemo(
    () =>
      new Proxy(new URLSearchParams(location.search), {
        get<P extends keyof URLSearchParams>(s: URLSearchParams, p: P) {
          if (editingMethods.includes(p as EditingMethods)) {
            const m: URLSearchParams[EditingMethods] = (
              ...args: [string, string?]
            ) => {
              s[p].bind(s)(...args)
              const update = p === "append" ? push : replace
              location.search = "?" + s.toString()
              update(location)
            }
            return m as URLSearchParams[P]
          }
          return s[p].bind(s)
        }
      }),
    [location]
  )
  return query
}

export const useURLQueryObservable = (key: string) => {
  const history$ = useHistoryObservable()
  return useObservable(() =>
    history$.pipe(
      map(h => new URLSearchParams(h[0].location.search).get(key)),
      distinctUntilChanged()
    )
  )
}
