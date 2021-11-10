export type Nominal<ID, Type> = { TypeID: ID } & Type
export type KVPair<T> = keyof T extends infer P
  ? P extends keyof T
    ? [P, T[P]]
    : never
  : never
export type KVPairWithTypeAssertion<T, A> = keyof T extends infer P
  ? P extends keyof T
    ? T[P] extends A
      ? [P, T[P]]
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
