import { useObservable, useObservableState } from "observable-hooks"
import { useState } from "react"
import { firstValueFrom, from, mergeMap, switchMap, timer } from "rxjs"
import { useUserID } from "../storage"
import type { PickR } from "../utils/types"
import ActivityData, { RawActivityData } from "./data-tables/ActivityData"
import UserData, { RawUserData } from "./data-tables/UserData"
import {
  ActivityCount,
  WorkDataWithActivityCount
} from "./data-tables/variations/work-data-with-activity-count"
import WorkData, { RawWorkData } from "./data-tables/WorkData"
import type { UserID } from "./ids"
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
}

export async function query<Action extends keyof PredefinedQueries>(
  action: Action,
  parameters: PredefinedQueries[Action][0],
  uid?: UserID
): Promise<
  PredefinedQueries[Action][1] extends number
    ? number
    : Array<PredefinedQueries[Action][1]>
> {
  const res = await (
    await firstValueFrom(
      timer(0, 3000).pipe(
        mergeMap(() =>
          from(
            fetch("php/predefined-query.php", {
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
    default:
      throw new Error("no parsing specified for query action: " + action)
  }
}

export const useQuery = <Action extends keyof PredefinedQueries>(
  action: Action,
  parameters: PredefinedQueries[Action][0],
  dependencies: any[] = []
) => {
  const [userID] = useUserID()
  const [params, setParams] = useState(parameters)
  const dataObservable = useObservable(
    o => o.pipe(switchMap(([p]) => from(query(action, p, userID)))),
    [params, ...dependencies]
  )
  const data = useObservableState(dataObservable)
  return {
    params,
    setParams,
    data,
    dataObservable
  }
}
