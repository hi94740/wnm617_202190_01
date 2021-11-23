import { useObservable, useSubscription } from "observable-hooks"
import { useLayoutEffect } from "react"
import {
  animationFrames,
  animationFrameScheduler,
  debounceTime,
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

export const pageScrollObservable = () =>
  fromEvent(window, "scroll").pipe(map(() => window.scrollY))
export const usePageScrollObservable = <T>(
  init = (o: Observable<number>) => o as Observable<unknown> as Observable<T>,
  inputs?: Parameters<typeof useObservable>[1]
) => useObservable(() => init(pageScrollObservable()), inputs)

export const usePreventPageHorizontalScrolling = () =>
  useSubscription(
    usePageScrollObservable(o => o.pipe(debounceTime(50))),
    () => window.scrollX !== 0 && window.scroll({ left: 0 })
  )

export const usePageScrollAnimation = (callback: (scrollY: number) => void) =>
  useSubscription(
    usePageScrollObservable(o =>
      o.pipe(
        exhaustMap(() =>
          animationFrames().pipe(
            map(() => window.scrollY),
            distinctUntilChanged(),
            timeout({
              each: 50,
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

// addEventListener("scroll", () => console.log(scrollX))
