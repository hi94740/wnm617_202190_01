import { useObservableCallback, useObservableState } from "observable-hooks"
import { useState } from "react"
import {
  concat,
  firstValueFrom,
  from,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
  timer
} from "rxjs"
import { fromFetch } from "rxjs/fetch"
import { useUserID } from "../storage"
import type {
  KVPairWithTypeAssertion,
  Merge,
  Override,
  PickR
} from "../utils/types"
import ActivityData, { RawActivityData } from "./data-tables/ActivityData"
import { DataTableConverter } from "./data-tables/DataTableConverter"
import UserData, { RawUserData } from "./data-tables/UserData"
import ActivityWithWorkData, {
  RawActivityWithWorkData
} from "./data-tables/variations/activity-with-work"
import {
  ActivityCount,
  WorkDataWithActivityCount
} from "./data-tables/variations/work-data-with-activity-count"
import WorkData, { RawWorkData } from "./data-tables/WorkData"
import type { ActivityID, UserID, WorkID } from "./ids"

type QueryParameters = Override<
  {
    [Action in keyof PredefinedQueries]: PredefinedQueries[Action][0]
  },
  {
    works: [
      SQLSortAndFilters<RawWorkData, WorkData>,
      SQLSortAndFilters<ActivityCount>?
    ]
  }
>

export function createQueryParameter<Action extends keyof PredefinedQueries>(
  action: Action,
  params: QueryParameters[Action]
): PredefinedQueries[Action][0] {
  switch (action) {
    case "works":
      const [W, c] = params as QueryParameters["works"]
      const w = new SQLSortAndFiltersConverter(WorkData, W, "w.")
      const wHasWhere = w?.where?.length > 0
      const cHasWhere = c?.where?.length > 0
      const pth1 = wHasWhere && cHasWhere ? ["("] : []
      const pth2 = wHasWhere && cHasWhere ? [")"] : []
      return {
        ...(wHasWhere || cHasWhere
          ? {
              where: [
                ...(wHasWhere ? [...pth1, ...w.where, ...pth2] : []),
                ...(wHasWhere && cHasWhere ? ["AND"] : []),
                ...(cHasWhere ? [...pth1, ...c.where, ...pth2] : [])
              ]
            }
          : {})
      } as PredefinedQueries["works"][0]
    default:
      return params as PredefinedQueries[Action][0]
  }
}

interface PredefinedQueries {
  login: [
    [UserData["username"], UserData["password"]],
    Array<PickR<UserData, "id">>
  ]
  works: [
    Merge<
      SQLSortAndFiltersConverter<RawWorkData, WorkData, "w.">,
      SQLSortAndFilters<ActivityCount>
    >,
    Array<
      PickR<WorkData, "id" | "name" | "tags" | "img" | "type"> & ActivityCount
    >
  ]
  one_most_recent_activity_of_each_work: [
    undefined,
    Array<PickR<ActivityData, "id" | "lat" | "lng">>
  ]
  activity: [
    ActivityID,
    Array<
      ActivityWithWorkData<"title" | "description" | "images", "name" | "type">
    >
  ]
  activityList: [
    [WorkID, SQLSortAndFiltersConverter<RawActivityData, ActivityData>?],
    Array<PickR<ActivityData, "id" | "title" | "date_create">>
  ]
}

type QueryParams<Action extends keyof PredefinedQueries> =
  PredefinedQueries[Action][0]
type QueryData<Action extends keyof PredefinedQueries> =
  PredefinedQueries[Action][1]
export async function query<Action extends keyof PredefinedQueries>(
  action: Action,
  parameters: QueryParams<Action>,
  uid?: UserID
): Promise<QueryData<Action>> {
  const res = await (
    await firstValueFrom(
      timer(0, 3000).pipe(
        mergeMap(() =>
          fromFetch("php/predefined-query.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              a: action,
              p: parameters,
              ...(uid ? { u: uid } : {})
            })
          })
        )
      )
    )
  ).json()
  switch (action) {
    case "login":
      return res.map((r: RawUserData) => new UserData(r))
    case "works":
      return res.map(
        (r: RawWorkData & ActivityCount) => new WorkDataWithActivityCount(r)
      )
    case "activityList":
    case "one_most_recent_activity_of_each_work":
      return res.map((r: RawActivityData) => new ActivityData(r))
    case "activity":
      return res.map(
        (r: RawActivityWithWorkData) => new ActivityWithWorkData(r)
      )
    default:
      throw new Error("no parsing specified for query action: " + action)
  }
}

export const useQuery = <
  Action extends keyof PredefinedQueries,
  Params extends QueryParams<Action>
>(
  action: Action,
  parameters: Params | Observable<Params>,
  config?: {
    onLoading?: () => void
    onLoaded?: () => void
  }
) => {
  const [userID] = useUserID()
  const [loading, setLoading] = useState(true)
  const [setQueryParams, data$] = useObservableCallback<
    QueryData<Action>,
    Params
  >(o =>
    concat(of(parameters), o).pipe(
      switchMap(p => (p instanceof Observable ? p : of(p))),
      tap(() => {
        config?.onLoading?.()
        setLoading(true)
      }),
      switchMap(p => from(query(action, p, userID))),
      tap(() => {
        config?.onLoaded?.()
        setLoading(false)
      })
    )
  )
  const data = useObservableState(data$)
  return {
    setQueryParams,
    data,
    loading
  }
}

// export const useQueryWithLoadingState = <
//   Action extends keyof PredefinedQueries,
//   Params extends QueryParams<Action>
// >(
//   action: Action,
//   parameters: Params
// ) => {
//   const [loading, setLoading] = useState(true)
//   const query = useQuery(action, parameters, {
//     onLoading: () => setLoading(true),
//     onLoaded: () => setLoading(false)
//   })
//   return {
//     ...query,
//     loading
//   }
// }

type SQLWhere<T1, T2 = T1, Prefix extends string = ""> = Array<
  | "AND"
  | "("
  | ")"
  | [">" | ">=" | "<" | "<=", KVPairWithTypeAssertion<T1, number, T2, Prefix>]
  | ["=" | "!=", KVPairWithTypeAssertion<T1, number | string, T2, Prefix>]
  | KVPairWithTypeAssertion<T1, number | string, T2, Prefix>
>
interface SQLSortAndFilters<T1, T2 = T1, Prefix extends string = ""> {
  where?: SQLWhere<T1, T2, Prefix>
}

export class SQLSortAndFiltersConverter<
  T1,
  T2 extends DataTableConverter<T1>,
  Prefix extends string = ""
> implements SQLSortAndFilters<T1, T1, Prefix>
{
  where?: SQLWhere<T1, T2>
  constructor(
    converter: new (rawData: T1) => T2,
    data: SQLSortAndFilters<T1, T2>,
    prefix: Prefix
  ) {
    const convert = (p: KVPairWithTypeAssertion<T1, T2>) => {
      const c = new converter({} as T1)
      c[p[0]] = p[1]
      return [prefix + p[0], c.toRawData()[p[0]]]
    }
    if (data.where)
      this.where = data.where.map(o => {
        if (Array.isArray(o)) {
          if (Array.isArray(o[1])) return [o[0], convert(o[1])]
          else return convert(o as KVPairWithTypeAssertion<T1, T2>)
        } else return o
      }) as SQLWhere<T1, T2>
  }
}

type SQLColAlias<T, Alias extends string> = {
  [ColName in keyof T as ColName extends string
    ? `${Alias}.${ColName}`
    : never]: T[ColName]
}
