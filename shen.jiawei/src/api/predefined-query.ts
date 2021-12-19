import { useObservableCallback, useObservableState } from "observable-hooks"
import { useState } from "react"
import {
  concat,
  filter,
  first,
  firstValueFrom,
  from,
  mergeMap,
  Observable,
  of,
  switchMap,
  switchMapTo,
  tap,
  timer
} from "rxjs"
import { fromFetch } from "rxjs/fetch"
import { ActivityEditData } from "../pages/activity"
import {
  EditProfileFormData,
  EditProfileFormErrors
} from "../pages/edit-profile"
import { AddUserFormData, AddUserFormErrors } from "../pages/login"
import { ActivityMarkerData } from "../pages/map"
import { useUserID } from "../storage"
import { connectBehaviorSubject } from "../utils/rx"
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
  ActivityRange,
  ActivityRangeByWork,
  ActivityRangeByWorkData,
  RawActivityRange
} from "./data-tables/variations/activity_range_by_work"
import {
  ActivityCountData,
  WorkDataWithActivityCount
} from "./data-tables/variations/work-data-with-activity-count"
import WorkData, { RawWorkData } from "./data-tables/WorkData"
import type { ActivityID, UserID, WorkID } from "./ids"

export type QueryParameters = Override<
  {
    [Action in keyof PredefinedQueries]: PredefinedQueries[Action][0]
  },
  {
    works: [
      SQLSortAndFilters<RawWorkData, WorkData>,
      SQLSortAndFilters<ActivityCountData>?
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

      const wHasOb = w?.orderBy?.length > 0
      const cHasOb = c?.orderBy?.length > 0
      return {
        ...(wHasWhere || cHasWhere
          ? {
              where: [
                ...(wHasWhere ? [...pth1, ...w.where, ...pth2] : []),
                ...(wHasWhere && cHasWhere ? ["AND"] : []),
                ...(cHasWhere ? [...pth1, ...c.where, ...pth2] : [])
              ]
            }
          : {}),
        ...(wHasOb || cHasOb
          ? {
              orderBy: [
                ...(wHasOb ? w.orderBy : []),
                ...(cHasOb ? c.orderBy : [])
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
      SQLSortAndFilters<ActivityCountData>
    >,
    Array<
      PickR<WorkData, "id" | "name" | "tags" | "img" | "type" | "toRawData"> &
        ActivityCountData
    >
  ]
  acitivity_markers_of_work: [WorkID, Array<ActivityMarkerData>]
  one_most_recent_activity_of_each_work: [undefined, Array<ActivityMarkerData>]
  activity_range_by_work: [undefined, Array<ActivityRangeByWorkData>]
  activity: [
    ActivityID,
    Array<
      ActivityWithWorkData<
        "title" | "description" | "images" | "work_id",
        "name" | "type"
      >
    >
  ]
  activity_list: [
    [WorkID, SQLSortAndFiltersConverter<RawActivityData, ActivityData>?],
    Array<PickR<ActivityData, "id" | "title" | "date_create">>
  ]
  add_work: [PickR<RawWorkData, "type" | "name" | "tags">, WorkID]
  user_profile: [undefined, Array<PickR<UserData, "name" | "username" | "img">>]
  edit_profile: [EditProfileFormData, [] | string | EditProfileFormErrors]
  add_user: [AddUserFormData, UserID | AddUserFormErrors]
  edit_work: [
    Pick<RawWorkData, "id" | "img" | "name" | "tags" | "type">,
    [] | string
  ]
  edit_activity: [ActivityEditData, [] | string]
  add_activity: [
    PickR<RawActivityData, "lat" | "lng" | "work_id">,
    ActivityID | string
  ]
  delete_activity: [ActivityID, [] | string]
}

type QueryParams<Action extends keyof PredefinedQueries> =
  PredefinedQueries[Action][0]
type QueryData<Action extends keyof PredefinedQueries> =
  PredefinedQueries[Action][1]
export async function query<Action extends keyof PredefinedQueries>(
  action: Action,
  parameters: QueryParams<Action>,
  uid?: UserID,
  retry = true
): Promise<QueryData<Action>> {
  const req = [
    "php/predefined-query.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        a: action,
        p: parameters,
        ...(uid ? { u: uid } : {})
      })
    }
  ] as const
  const res = await (
    await (retry
      ? firstValueFrom(timer(0, 3000).pipe(mergeMap(() => fromFetch(...req))))
      : fetch(...req))
  ).json()
  switch (action) {
    case "login":
    case "user_profile":
      return res.map((r: RawUserData) => new UserData(r))
    case "works":
      return res.map(
        (r: RawWorkData & ActivityCountData) => new WorkDataWithActivityCount(r)
      )
    case "activity_list":
    case "acitivity_markers_of_work":
    case "one_most_recent_activity_of_each_work":
      return res.map((r: RawActivityData) => new ActivityData(r))
    case "activity_range_by_work":
      return res.map(
        (r: RawWorkData & RawActivityRange) => new ActivityRangeByWork(r)
      )
    case "activity":
      return res.map(
        (r: RawActivityWithWorkData) => new ActivityWithWorkData(r)
      )
    case "add_work":
    case "edit_work":
    case "edit_profile":
    case "edit_activity":
    case "add_user":
    case "add_activity":
    case "delete_activity":
      return res
    default:
      throw new Error("No parsing specified for query action: " + action)
  }
}

const empty0 = { __EMPTY__: 0 } as const
const empty1 = { __EMPTY__: 1 } as const
export const useQuery = <
  Action extends keyof PredefinedQueries,
  Params extends QueryParams<Action>
>(
  action: Action,
  parameters: Params | Observable<Params>,
  config?: {
    onLoading?: () => void
    onLoaded?: (data: QueryData<Action>) => void
    retry?: boolean
  }
) => {
  const [userID] = useUserID()
  const [loading, setLoading] = useState(false)
  const [setQueryParams, data$] = useObservableCallback<
    QueryData<Action>,
    Params | typeof empty1
  >(o => {
    const paramObservable = () =>
      concat(of(parameters), o).pipe(
        switchMap(p => (p instanceof Observable ? p : of(p)))
      )
    const c = connectBehaviorSubject<Params | typeof empty0>(
      paramObservable().pipe(filter(p => p !== empty1)) as Observable<Params>,
      empty0
    ).pipe(filter(p => p !== empty0)) as Observable<Params>
    return paramObservable().pipe(
      switchMap(() => c.pipe(first())),
      tap(() => {
        console.log("loading")
        config?.onLoading?.()
        setLoading(true)
      }),
      switchMap(p =>
        from(query(action, p, userID, config?.retry === false ? false : true))
      ),
      tap(data => {
        config?.onLoaded?.(data)
        setLoading(false)
      })
    )
  })
  const data = useObservableState(data$)
  return {
    setQueryParams,
    data,
    loading,
    refresh: () => setQueryParams(empty1)
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
  | "OR"
  | "("
  | ")"
  | [">" | ">=" | "<" | "<=", KVPairWithTypeAssertion<T1, number, T2, Prefix>]
  | ["=" | "!=", KVPairWithTypeAssertion<T1, number | string, T2, Prefix>]
  | ["LIKE", KVPairWithTypeAssertion<T1, string | Set<any>, T2, Prefix>]
  | KVPairWithTypeAssertion<T1, number | string, T2, Prefix>
>
export type SQLOrderByDirection = "ASC" | "DESC"
type SQLOrderBy<T, Prefix extends string = ""> = keyof T extends string
  ? Array<[`${Prefix}${keyof T}`, SQLOrderByDirection]>
  : never
interface SQLSortAndFilters<T1, T2 = T1, Prefix extends string = ""> {
  where?: SQLWhere<T1, T2, Prefix>
  orderBy?: SQLOrderBy<T1, Prefix>
}

export class SQLSortAndFiltersConverter<
  T1,
  T2 extends DataTableConverter<T1>,
  Prefix extends string = ""
> implements SQLSortAndFilters<T1, T1, Prefix>
{
  where?: SQLWhere<T1, T2, Prefix>
  orderBy?: SQLOrderBy<T1, Prefix>
  constructor(
    converter: new (rawData?: T1) => T2,
    data: SQLSortAndFilters<T1, T2>,
    prefix: Prefix
  ) {
    const convert = (p: KVPairWithTypeAssertion<T1, T2>) => {
      const c = new converter()
      c[p[0]] = p[1]
      return [prefix + p[0], c.toRawData()[p[0]]]
    }
    if (data.where)
      this.where = data.where.map(o => {
        if (Array.isArray(o)) {
          if (Array.isArray(o[1])) return [o[0], convert(o[1])]
          else return convert(o as KVPairWithTypeAssertion<T1, T2>)
        } else return o
      }) as SQLWhere<T1, T2, Prefix>
    if (data.orderBy)
      this.orderBy = data.orderBy.map(([c, d]) => [
        prefix + c,
        d
      ]) as SQLOrderBy<T1, Prefix>
  }
}

type SQLColAlias<T, Alias extends string> = {
  [ColName in keyof T as ColName extends string
    ? `${Alias}.${ColName}`
    : never]: T[ColName]
}
