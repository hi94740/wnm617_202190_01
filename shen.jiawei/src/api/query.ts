import { useObservable, useObservableState } from "observable-hooks"
import { useState } from "react"
import { firstValueFrom, from, mergeMap, switchMap, timer } from "rxjs"
import { useUserID } from "../storage"
import type {
  AllPossibleArray,
  FilterPropertyByArray,
  InterfaceToUnion,
  KVPairWithTypeAssertion,
  OnlyOnePropertyAtATime
} from "../utils/types"
import { DataTableConverter } from "./data-tables/DataTableConverter"
import ActivityData, { ActivityDataTypes } from "./data-tables/ActivityData"
import UserData, { UserDataTypes } from "./data-tables/UserData"
import WorkData, { WorkDataTypes } from "./data-tables/WorkData"

interface TableDataTypes {
  users: UserDataTypes
  works: WorkDataTypes
  activities: ActivityDataTypes
}
const DataClasses: {
  [TableName in keyof TableDataTypes]: TableDataTypes[TableName][0] extends InstanceType<
    TableDataTypes[TableName][2]
  >
    ? TableDataTypes[TableName][0] extends DataTableConverter<
        TableDataTypes[TableName][1]
      >
      ? TableDataTypes[TableName][2]
      : never
    : never
} = {
  users: UserData,
  works: WorkData,
  activities: ActivityData
}
type Tables = {
  [TableName in keyof TableDataTypes]: TableDataTypes[TableName][0]
}
type RawTables = {
  [TableName in keyof TableDataTypes]: TableDataTypes[TableName][1]
}

interface SQLCRUDActions<
  TableName extends keyof Tables,
  ColNames extends Array<keyof Tables[TableName]>
> {
  select: ColNames | "*"
}
type SQLWhereOperators = "=" | ">" | ">=" | "<" | "<=" | "!="
type SQLWhereOperatorConnectors = "AND" | "(" | ")"
type SQLWhereFilters<
  TableName extends keyof Tables,
  Operator extends SQLWhereOperators | SQLWhereOperatorConnectors
> = Operator extends SQLWhereOperatorConnectors
  ? Operator
  : Operator extends ">" | ">=" | "<" | "<="
  ? [Operator, KVPairWithTypeAssertion<Tables[TableName], number>]
  : Operator extends "=" | "!="
  ? [Operator, KVPairWithTypeAssertion<Tables[TableName], number | string>]
  : never
type SQLWhere<TableName extends keyof Tables> = InterfaceToUnion<{
  [P in SQLWhereOperators]: SQLWhereFilters<
    TableName,
    P | SQLWhereOperatorConnectors
  >
}>[]
// interface SQLWhereFilters<TableName extends keyof Tables> {
//   equals: [keyof Tables[TableName], InterfaceToUnion<Tables[TableName]>][]
// }
export interface SQLSortAndFilters<TableName extends keyof Tables> {
  where?: SQLWhere<TableName>
}

// interface SQLJoinQuery<
//   TableNameA extends keyof Tables,
//   TableNameB extends Exclude<keyof Tables, TableNameA>
// > extends SQLSortAndFilters<TableNameA> {
//   select?: {
//     a: Array<keyof Tables[TableNameA]>
//     b: Array<keyof Tables[TableNameB]>
//   }
//   id_col: InterfaceToUnion<{
//     [ColName in keyof Tables[TableNameB] as Tables[TableNameB][ColName] extends Tables[TableNameA]["id"]
//       ? "id"
//       : never]: ColName
//   }>
//   join?: SQLSortAndFilters<TableNameB>
// }

export const query = async <
  TableName extends keyof Tables,
  CRUDColNames extends AllPossibleArray<keyof Tables[TableName]>,
  Action extends OnlyOnePropertyAtATime<SQLCRUDActions<TableName, CRUDColNames>>
>(
  table: TableName,
  q?: Action & SQLSortAndFilters<TableName>
) => {
  const res = (await (
    await firstValueFrom(
      timer(0, 3000).pipe(
        mergeMap(() =>
          from(
            fetch("php/api.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ table, q: q || { select: "*" } })
            })
          )
        )
      )
    )
  ).json()) as Array<RawTables[typeof table]>
  if (q.select)
    return res.map(
      data =>
        new DataClasses[table](data) as FilterPropertyByArray<
          Tables[TableName],
          CRUDColNames
        > &
          DataTableConverter<TableDataTypes[TableName][1]>
    )
}

export const queryUsers = <
  ColNames extends AllPossibleArray<keyof Tables["users"]>
>(
  select: SQLCRUDActions<"users", ColNames>["select"] = "*",
  q?: SQLSortAndFilters<"users">
) =>
  query("users", {
    select,
    ...q
  }) as Promise<FilterPropertyByArray<Tables["users"], ColNames>[]>

export const queryWorks = <
  ColNames extends AllPossibleArray<keyof Tables["works"]>
>(
  select: SQLCRUDActions<"works", ColNames>["select"] = "*",
  q?: SQLSortAndFilters<"works">
) =>
  query("works", {
    select,
    ...q
  }) as Promise<FilterPropertyByArray<Tables["works"], ColNames>[]>

export const useWorksQuery = <
  ColNames extends AllPossibleArray<keyof Tables["works"]>
>(
  select: SQLCRUDActions<"works", ColNames>["select"] = "*",
  q?: SQLSortAndFilters<"works">
) => {
  const [userID] = useUserID()
  const [sel, setSelect] = useState(select)
  const [query, setQuery] = useState(q)
  const dataObservable = useObservable(
    o =>
      o.pipe(
        switchMap(([sel, query = {}]) => {
          query.where = [
            ["=", ["user_id", userID]],
            ...((Array.isArray(query?.where)
              ? ["AND", "(", ...query.where, ")"]
              : []) as typeof query.where)
          ]
          return from(queryWorks(sel, query))
        })
      ),
    [sel, query]
  )
  const data = useObservableState(dataObservable)
  return {
    select: sel,
    setSelect,
    query,
    setQuery,
    data,
    dataObservable
  }
}
