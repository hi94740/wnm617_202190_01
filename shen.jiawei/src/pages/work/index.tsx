import "./style.less"

import React from "react"
import { WorkInfo } from "./work-info"
import { Link, useParams } from "react-router-dom"
import FloatButton from "../../components/float-button"
import { withUserID } from "../../storage"
import { createQueryParameter, useQuery } from "../../api/predefined-query"
import type { WorkID } from "../../api/ids"
import ActivityData from "../../api/data-tables/ActivityData"
import { PickR } from "../../utils/types"

const Activity = (a: PickR<ActivityData, "id" | "title" | "date_create">) => {
  return (
    <Link to={"/map?activity=" + a.id}>
      <h3>{a.title}</h3>
      <p>{a.date_create.toLocaleString()}</p>
    </Link>
  )
}

export default withUserID(() => {
  const workID = parseInt(useParams<{ work_id: string }>().work_id) as WorkID
  const { data: [w] = [null] } = useQuery(
    "works",
    createQueryParameter("works", [
      {
        where: [["id", workID]]
      }
    ])
  )
  const { data: activities } = useQuery("activityList", [workID])
  return (
    <section id="page-work">
      <header
        style={{
          backgroundImage: "url('img/demo/machikado_mazoku_header.jpg')"
        }}
      >
        <div className="dimmer">
          <img
            src={w?.img || "https://via.placeholder.com/360x510?text=Loading"}
          />
          <div className="header">
            <WorkInfo {...w} />
            <h1 contentEditable>{w?.name || "Loading..."}</h1>
          </div>
        </div>
      </header>
      {activities?.map(
        a =>
          <Activity key={"activity-list-item-" + a.id} {...a} /> || "Loading..."
      )}
      <FloatButton />
      <div className="bottom-spacer-with-float-button" />
    </section>
  )
})
