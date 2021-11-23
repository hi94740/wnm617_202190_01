import React, { useContext } from "react"
import { useObservableCallback } from "observable-hooks"
import { createContext, ReactNode, useEffect } from "react"
import { useHistory } from "react-router"
import {
  BehaviorSubject,
  bufferCount,
  concat,
  connectable,
  from,
  map,
  Observable
} from "rxjs"

type HistoryEventProps = Parameters<
  Parameters<ReturnType<typeof useHistory>["listen"]>[0]
>
type HistoryEvent = {
  location: HistoryEventProps[0]
  action: HistoryEventProps[1]
}
const HistoryObservableContext = createContext(
  null as Observable<HistoryEvent[]>
)

const bufferSize = 2

export const HistoryObservableContextProvider = ({
  children
}: {
  children: ReactNode
}) => {
  const { listen, location } = useHistory()
  const [historyListner, historyObservable] = useObservableCallback<
    HistoryEvent[],
    HistoryEvent
  >(e => {
    const c = connectable(
      concat(
        from(
          Array(bufferSize).fill({
            location,
            action: "REPLACE" as HistoryEventProps[1]
          })
        ),
        e
      ).pipe(
        bufferCount(bufferSize, 1),
        map(b => b.reverse())
      ),
      {
        connector: () => new BehaviorSubject([]),
        resetOnDisconnect: false
      }
    )
    c.connect()
    return c
  })
  useEffect(
    () => listen((location, action) => historyListner({ location, action })),
    []
  )
  return (
    <HistoryObservableContext.Provider value={historyObservable}>
      {children}
    </HistoryObservableContext.Provider>
  )
}

export const useHistoryObservable = () => useContext(HistoryObservableContext)
