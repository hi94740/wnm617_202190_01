import { mdiFilmstripBoxMultiple } from "@mdi/js"
import Icon from "@mdi/react"
import { useObservable } from "observable-hooks"
import React, { useEffect, useLayoutEffect } from "react"
import { useHistory, useLocation } from "react-router"
import { filter, firstValueFrom, map, skipWhile } from "rxjs"
import { ActivityID } from "../../api/ids"
import { useQuery } from "../../api/predefined-query"
import { useGoBackHandler } from "../../bottom-bar"
import { useLog } from "../../utils/dev"
import { pageScrollObservable } from "../../utils/scroll"
import { useURLQuery, useURLQueryObservable } from "../../utils/url-query"
import { WorkTypeIcon, WorkTypeTag } from "../work/components/work-info"
import "./style.less"

export default () => {
  const urlQuery = useURLQuery()
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

  const id$ = useURLQueryObservable("activity")

  const { data = [null], loading } = useQuery(
    "activity",
    // parseInt(urlQuery.get("activity")) as ActivityID
    useObservable(() =>
      id$.pipe(
        map(id => parseInt(id) as ActivityID),
        filter(id => !!id)
      )
    )
  )
  const [a] = loading ? [null] : data

  return (
    <section id="page-activity">
      <header>
        <h1>{a?.activity?.title || "Loading..."}</h1>
        <div
          className="work-info"
          style={{ marginLeft: "var(--toolbar-margin)" }}
        >
          <WorkTypeTag
            type={a?.work?.type || "single"}
            name={a?.work?.name || "Probably good work..."}
            showName
          />
        </div>
      </header>
      <div>
        <div>
          <p>{a?.activity?.description || "Loading..."}</p>
        </div>
      </div>
    </section>
  )
}
