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
import type { PickR } from "../utils/types"
import ActivityData, { RawActivityData } from "./data-tables/ActivityData"
import UserData, { RawUserData } from "./data-tables/UserData"
import ActivityWithWorkData, {
  RawActivityWithWorkData
} from "./data-tables/variations/activity-with-work"
import {
  ActivityCount,
  WorkDataWithActivityCount
} from "./data-tables/variations/work-data-with-activity-count"
import WorkData, { RawWorkData } from "./data-tables/WorkData"
import type { ActivityID, UserID } from "./ids"
import type { SQLSortAndFilters } from "./query"

interface PredefinedQueries {
  login: [[UserData["username"], UserData["password"]], PickR<UserData, "id">]
  works: [
    SQLSortAndFilters<"works">,
    PickR<WorkData, "id" | "name" | "tags" | "img" | "type"> & ActivityCount
  ]
  one_most_recent_activity_of_each_work: [
    undefined,
    PickR<ActivityData, "id" | "lat" | "lng">
  ]
  activity: [
    ActivityID,
    ActivityWithWorkData<"title" | "description" | "images", "name" | "type">
  ]
}

type QueryParams<Action extends keyof PredefinedQueries> =
  PredefinedQueries[Action][0]
type QueryData<Action extends keyof PredefinedQueries> =
  PredefinedQueries[Action][1] extends number
    ? number
    : Array<PredefinedQueries[Action][1]>
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
