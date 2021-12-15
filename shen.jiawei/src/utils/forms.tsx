import { useObservable } from "observable-hooks"
import React, { useCallback, useContext } from "react"
import {
  FormProvider,
  Path,
  SubmitHandler,
  useForm,
  UseFormProps,
  UseFormReturn
} from "react-hook-form"
import { Observable } from "rxjs"
import { MethodCallEvent, useWatchMethodCall } from "./rx"
import { MapTo } from "./types"

export type FormErrorObject<FormData> = Partial<MapTo<FormData, string>>

type FormMethodCallObservable<T> = Observable<
  MethodCallEvent<UseFormReturn<T, object>>
>
const FormMethodCallObservableContext = React.createContext(
  null as FormMethodCallObservable<any>
)

// export function useFormMethodCallObservable<T, TOutput, TInputs extends any[]>(
//   init?: (o: FormMethodCallObservable<T>, inputs: Observable<TInputs>) => Observable<TOutput>,
//   inputs?: TInputs
// ) {
//   const o = useContext(
//     FormMethodCallObservableContext
//   ) as FormMethodCallObservable<T>
//   return useObservable<TOutput, TInputs>(inputs => init?.(o, inputs) || o, inputs)
// }
export function useFormMethodCallObservable<T>() {
  return useContext(
    FormMethodCallObservableContext
  ) as FormMethodCallObservable<T>
}

export function useAllRequiredForm<T>(props?: UseFormProps<T>) {
  let f = useForm<T>({ mode: "onChange", ...props })
  const { register } = f
  f.register = (name, options = {}) => {
    options = {
      required: true,
      ...options
    }
    return register(name, options)
  }
  const [watchedF, methodCalls$] = useWatchMethodCall(f)
  watchedF.formState = f.formState
  f = watchedF
  const setValidateError = (
    name: Path<T>,
    message: string,
    shouldFocus?: boolean
  ) => f.setError(name, { type: "validate", message }, { shouldFocus })
  return {
    ...f,
    Form: useCallback(
      ({
        handleSubmit,
        ...props
      }: React.DetailedHTMLProps<
        React.FormHTMLAttributes<HTMLFormElement>,
        HTMLFormElement
      > & { handleSubmit?: SubmitHandler<T> }) => (
        <FormProvider {...f}>
          <FormMethodCallObservableContext.Provider value={methodCalls$}>
            <form
              onSubmit={handleSubmit ? f.handleSubmit(handleSubmit) : null}
              {...props}
            ></form>
          </FormMethodCallObservableContext.Provider>
        </FormProvider>
      ),
      [f]
    ),
    setValidateError,
    setValidateErrorObject: (errors: FormErrorObject<T>) => {
      if (typeof errors === "object")
        Object.entries(errors).forEach(([k, v]) =>
          setValidateError(k as Path<T>, v as string)
        )
      else {
        alert("Unknown error")
        console.error(errors)
      }
    }
  }
}
