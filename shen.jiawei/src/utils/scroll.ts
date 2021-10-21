import { useObservable, useSubscription } from "observable-hooks"
import { useLayoutEffect } from "react"
import {
  animationFrames,
  animationFrameScheduler,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  fromEvent,
  map,
  Observable,
  observeOn,
  tap,
  timeout
} from "rxjs"

export const usePageScrollObservable = (
  init = (o: Observable<Event>) => o as Observable<unknown>,
  inputs?: Parameters<typeof useObservable>[1]
) => useObservable(() => init(fromEvent(window, "scroll")), inputs)

export const usePageScrollAnimation = (callback: (scrollY: number) => void) =>
  useSubscription(
    usePageScrollObservable(o =>
      o.pipe(
        exhaustMap(() =>
          animationFrames().pipe(
            map(() => window.scrollY),
            distinctUntilChanged(),
            timeout({
              each: 100,
              with: () => EMPTY
            }),
            tap(callback)
          )
        ),
        observeOn(animationFrameScheduler)
      )
    )
  )

export const usePageScrollable = (state: boolean) => {
  const page = document.scrollingElement as HTMLElement
  useLayoutEffect(() => {
    page.style.overflowY = state ? "scroll" : "hidden"
    return () => {
      page.style.overflowY = "scroll"
    }
  }, [state])
}
