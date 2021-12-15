import "./style.less"

import React from "react"
import { capitalize, words } from "lodash"
import { FieldError, useFormContext } from "react-hook-form"
import { classNames } from "../../utils/classNames"
import {
  useObservable,
  useObservableCallback,
  useObservableState,
  useSubscription
} from "observable-hooks"
import {
  concat,
  distinctUntilChanged,
  filter,
  first,
  map,
  mapTo,
  merge,
  of,
  sample,
  switchMap,
  switchMapTo,
  takeUntil,
  takeWhile,
  tap
} from "rxjs"
import { connectBehaviorSubject } from "../../utils/rx"
import { useFormMethodCallObservable } from "../../utils/forms"

const InputMaterial = React.forwardRef<
  HTMLInputElement,
  {
    label?: string
    deferErrorUntilBlur?: boolean
    clearErrorOnChange?: boolean
  } & React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
>(
  (
    { label = "", deferErrorUntilBlur = true, clearErrorOnChange, ...props },
    ref
  ) => {
    type FormData = {
      [P in typeof props.name]: string
    }
    const { formState } = useFormContext<FormData>()
    const [focused, onFocus$] = useObservableCallback(focused$ => focused$)
    const [changed, onChange$] = useObservableCallback(changed$ => changed$)
    // const [formChanged, onChange$] = useObservableCallback<string, FormData>(
    //   changed$ =>
    //     changed$.pipe(
    //       map(data => data[props.name]),
    //       tap(console.log),
    //       distinctUntilChanged()
    //     )
    // )
    // watch(formChanged)
    const [blured, onBlur$] = useObservableCallback(blured$ => blured$)
    // const formState$ = useObservable(
    //   formState$ =>
    //     formState$.pipe(
    //       map(d => d[0]),
    //       map(
    //         s =>
    //           "" +
    //           s.dirtyFields[props.name] +
    //           s.errors[props.name]?.type +
    //           s.errors[props.name]?.message
    //       ),
    //       distinctUntilChanged()
    //     ),
    //   [formState]
    // )
    // useSubscription(formState$, console.log)
    // const formMethodCalls$ = useFormMethodCallObservable<FormData>()
    // const formEvents$ = useObservable(() =>
    //   formMethodCalls$.pipe(
    //     filter(e => {
    //       if (e.name === "setError") return e.args[0] === props.name
    //       if (e.name === "reset") return true
    //       return false
    //     })
    //   )
    // )
    const error$ = useObservable(
      formState$ =>
        connectBehaviorSubject(
          formState$.pipe(
            map(([formState]) => formState.errors[props.name] as FieldError),
            distinctUntilChanged()
          ),
          null
        ),
      [formState]
    )
    const [error] = useObservableState(() =>
      deferErrorUntilBlur
        ? merge(
            // error$.pipe(sample(onBlur$)),
            clearErrorOnChange
              ? onFocus$.pipe(
                  switchMap(() => onChange$.pipe(first())),
                  mapTo(null)
                )
              : onFocus$.pipe(
                  switchMap(() =>
                    concat(error$.pipe(takeWhile(error => !!error)), of(null))
                  )
                ),
            onBlur$.pipe(switchMapTo(error$.pipe(takeUntil(onFocus$))))
            // formEvents$.pipe(switchMapTo(error$.pipe(takeUntil(onFocus$))))
            // error$.pipe(filter(error => !error))
          )
        : error$
    )
    // console.log(props.name, error)
    return (
      <div className={classNames("material-input", error && "error")}>
        <div>
          {error
            ? error.type === "validate"
              ? error.message
              : capitalize(error.type)
            : ""}
        </div>
        <input
          placeholder=" "
          type={props.name === "password" ? "password" : "text"}
          readOnly={formState.isSubmitting}
          ref={ref}
          {...props}
          onFocus={event => {
            props?.onFocus?.(event)
            focused(event)
          }}
          onChange={event => {
            props?.onChange?.(event)
            changed(event)
          }}
          onBlur={event => {
            props?.onBlur?.(event)
            blured(event)
          }}
        />
        <label>
          {label ||
            words(props.name)
              .map(w => capitalize(w))
              .join(" ")}
        </label>
      </div>
    )
  }
)

export default InputMaterial
