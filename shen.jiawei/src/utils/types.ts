export type Nominal<ID, Type> = { TypeID: ID } & Type
export type KVPair<T> = keyof T extends infer P
  ? P extends keyof T
    ? [P, T[P]]
    : never
  : never
export type KVPairWithTypeAssertion<
  T1,
  A,
  T2 = T1,
  Prefix extends string = ""
> = keyof T1 extends infer P
  ? P extends keyof T1
    ? T1[P] extends A
      ? P extends keyof T2
        ? P extends string
          ? [`${Prefix}${P}`, T2[P]]
          : never
        : never
      : never
    : never
  : never
export type InterfaceToUnion<T> = keyof T extends infer P
  ? P extends keyof T
    ? T[P]
    : never
  : never
export type OnlyOnePropertyAtATime<T> = InterfaceToUnion<{
  [P in keyof T]: {
    [P1 in keyof T as P1 extends P ? P1 : never]: P1 extends P ? T[P1] : never
  }
}>
export type AllPossibleArray<T extends string | number | symbol> =
  | InterfaceToUnion<{
      [I in T]:
        | Array<
            keyof Omit<
              {
                [I in T]: I
              },
              I
            >
          >
        | AllPossibleArray<
            keyof Omit<
              {
                [I in T]: I
              },
              I
            >
          >
    }>
  | T[]
export type FilterPropertyByArray<T, A> = {
  [P in A extends Array<infer R>
    ? R extends string | number | symbol
      ? {
          [P in R as P extends keyof T ? P : never]: P extends keyof T
            ? T[P]
            : never
        }
      : never
    : never as keyof P]: InterfaceToUnion<{
    [Q in keyof P]: Q extends keyof T ? T[Q] : never
  }>
}
export type Override<
  T,
  O extends {
    [P in keyof T]+?: any
  }
> = {
  [P in keyof T]: P extends keyof O ? O[P] : T[P]
}
export type PickR<T, K extends keyof T> = Required<Pick<T, K>>
export type TupleToUnion<T> = InterfaceToUnion<{
  [I in keyof T as I extends number ? I : never]: T[I]
}>
export type Merge<A, B> = {
  [P in keyof A | keyof B]:
    | (P extends keyof A ? A[P] : never)
    | (P extends keyof B ? B[P] : never)
}
