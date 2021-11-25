import { useObservable } from "observable-hooks"
import { useMemo } from "react"
import { useHistory } from "react-router"
import { distinctUntilChanged, map } from "rxjs"
import { useHistoryObservable } from "./history"

const editingMethods: Array<keyof URLSearchParams> = ["append", "delete", "set"]

export const useURLQuery = () => {
  const { push, replace, location } = useHistory()
  const query = useMemo(
    () =>
      new Proxy(new URLSearchParams(location.search), {
        get(s, p: keyof URLSearchParams) {
          if (editingMethods.includes(p)) {
            setTimeout(() => {
              const update = p === "append" ? push : replace
              location.search = "?" + query.toString()
              update(location)
            })
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
