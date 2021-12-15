import "./style.less"

import { mdiFilmstripBoxMultiple } from "@mdi/js"
import Icon from "@mdi/react"
import { useObservable, useObservableState } from "observable-hooks"
import React, { useEffect, useLayoutEffect } from "react"
import { useHistory, useLocation } from "react-router"
import { EMPTY, filter, firstValueFrom, map, Observable, skipWhile } from "rxjs"
import { ActivityID } from "../../api/ids"
import { useQuery } from "../../api/predefined-query"
import { useGoBackHandler } from "../../bottom-bar"
import { useLog } from "../../utils/dev"
import { pageScrollObservable } from "../../utils/scroll"
import { useURLQuery, useURLQueryObservable } from "../../utils/url-query"
import { WorkTypeIcon, WorkTypeTag } from "../work/components/work-info"
import { useAllRequiredForm } from "../../utils/forms"
import ActivityData, {
  RawActivityData
} from "../../api/data-tables/ActivityData"
import { PickR } from "../../utils/types"
import { Link } from "react-router-dom"

type ActivityFormData = PickR<ActivityData, "title" | "description">
export type ActivityEditData = PickR<
  RawActivityData,
  "title" | "description" | "work_id" | "id"
>

export default () => {
  useEffect(() => {
    window.scroll({ top: visualViewport.height * 0.2, behavior: "smooth" })
  }, [])

  const { goBack } = useHistory()
  useGoBackHandler(async () => {
    const startingY = window.scrollY
    const minimumScroll = startingY * 0.25
    // console.log("handling!")
    window.scroll({ top: 0, behavior: "smooth" })
    if (window.scrollY > minimumScroll)
      await firstValueFrom(
        pageScrollObservable().pipe(skipWhile(y => y > minimumScroll))
      )
    // console.log("go back!")
    goBack()
  })

  // useLog(useHistory())
  const [rawId$] = useURLQueryObservable("activity")
  const id$ = useObservable(() =>
    rawId$.pipe(map(id => parseInt(id) as ActivityID))
  )
  const id = useObservableState(id$)

  const { data = [null], loading } = useQuery(
    "activity",
    // parseInt(urlQuery.get("activity")) as ActivityID
    useObservable(() => id$.pipe(filter(id => !!id)))
  )
  const [aw] = loading ? [null] : data

  const { Form, register, resetField, handleSubmit } =
    useAllRequiredForm<ActivityFormData>()
  useEffect(() => {
    if (aw) {
      resetField("title", {
        defaultValue: aw.activity.title
      })
      resetField("description", {
        defaultValue: aw.activity.description
      })
    }
  }, [aw])
  const { setQueryParams } = useQuery(
    "edit_activity",
    EMPTY as Observable<ActivityEditData>,
    { retry: false }
  )
  const submit = handleSubmit(data => {
    console.log(data)
    const a = new ActivityData()
    a.title = data.title
    a.description = data.description
    a.id = id
    a.work_id = aw.activity.work_id
    setQueryParams(a.toRawData() as ActivityEditData)
  })

  return (
    <section id="page-activity">
      <Form onSubmit={submit} onBlur={submit}>
        <header>
          {/* <h1>{a?.activity?.title || "Loading..."}</h1> */}
          {aw ? (
            <input
              placeholder="Untitled Activity"
              {...register("title", { required: false })}
            />
          ) : (
            <h1>Loading...</h1>
          )}
          <Link
            className="work-info"
            style={{ marginLeft: "var(--toolbar-margin)" }}
            to={aw ? "/work/" + aw.activity.work_id : "/works"}
          >
            <WorkTypeTag
              type={aw?.work?.type || "single"}
              name={aw?.work?.name || "Probably good work..."}
              showName
            />
          </Link>
        </header>
        <div>
          {/* <p>{a?.activity?.description || "Loading..."}</p> */}
          <textarea
            placeholder="Add some notes..."
            {...register("description", { required: false })}
          />
        </div>
      </Form>
    </section>
  )
}
