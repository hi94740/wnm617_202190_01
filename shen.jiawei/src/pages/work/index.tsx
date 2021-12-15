import "./style.less"

import React from "react"
import { WorkInfo } from "./components/work-info"
import { Link, useHistory, useParams } from "react-router-dom"
import FloatButton from "../../components/float-button"
import { withUserID } from "../../storage"
import { createQueryParameter, useQuery } from "../../api/predefined-query"
import type { WorkID } from "../../api/ids"
import ActivityData from "../../api/data-tables/ActivityData"
import { PickR } from "../../utils/types"
import WorkTags from "./components/tags"
import { Toolbar } from "../../bottom-bar"
import Button from "../../components/button"
import { mdiPencilBoxMultiple } from "@mdi/js"
import LoaderRadial from "../../components/loader-radial"

const Activity = (a: PickR<ActivityData, "id" | "title" | "date_create" | "work_id">) => {
  return (
    <Link to={`/map?work=${a.work_id}&activity=${a.id}`}>
      <h3>{a.title}</h3>
      <p>{a.date_create.toLocaleString()}</p>
    </Link>
  )
}

export default withUserID(() => {
  const { push } = useHistory()

  const workID = parseInt(useParams<{ work_id: string }>().work_id) as WorkID
  const { data: [w] = [null], loading } = useQuery(
    "works",
    createQueryParameter("works", [
      {
        where: [["id", workID]]
      }
    ])
  )
  const { data: activities } = useQuery("activity_list", [workID])
  const img = w?.img ||
  (loading
    ? "https://via.placeholder.com/360x510?text=Loading"
    : "https://via.placeholder.com/360x510?text=Add")
  return (
    <section id="page-work">
      <header
        style={{
          backgroundImage: `url('${img}')`
        }}
      >
        <div className="dimmer">
          <img src={img} className="work-img" />
          <div className="header">
            <WorkInfo {...w} />
            <WorkTags {...w} />
            <h1>{w?.name || "Loading..."}</h1>
          </div>
        </div>
      </header>
      {activities?.length === 0 ? <p>Add some stuff!</p> : activities?.map(
        a =>
          <Activity key={"activity-list-item-" + a.id} {...a} work_id={workID} />
      ) || <LoaderRadial />}
      <FloatButton onClick={() => push(`/map?work=${w.id}&add=activity`)} />
      <div className="bottom-spacer-with-float-button" />
      <Toolbar classNames="work">
        <Button icon={mdiPencilBoxMultiple} onClick={() => push("/edit-work/" + workID)}>
          Edit
        </Button>
      </Toolbar>
    </section>
  )
})
