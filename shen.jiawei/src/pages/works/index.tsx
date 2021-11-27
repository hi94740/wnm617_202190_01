import "./style.less"

import {
  mdiFilmstripBoxMultiple,
  mdiMapMarker,
  mdiSortClockAscendingOutline
} from "@mdi/js"
import Icon from "@mdi/react"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Toolbar, ToolbarModal } from "../../bottom-bar"
import { WorkInfo } from "../work/work-info"
import FloatButton, { ModalButton } from "../../components/float-button"
import type WorkData from "../../api/data-tables/WorkData"
import type { PickR } from "../../utils/types"
import { createQueryParameter, useQuery } from "../../api/predefined-query"
import type { ActivityCount } from "../../api/data-tables/variations/work-data-with-activity-count"
import { withUserID } from "../../storage"

const Card = (
  w: PickR<WorkData, "id" | "img" | "name" | "type" | "tags"> & ActivityCount
) => (
  <Link to={"/work/" + w.id}>
    <div className="card-work">
      <img src={w.img} />
      <div>
        <h2>{w.name}</h2>
        <WorkInfo {...w} />
      </div>
    </div>
  </Link>
)

export default withUserID(() => {
  const { data } = useQuery("works", createQueryParameter("works", [{}]))
  return (
    <section id="page-works">
      {data?.map(work => <Card key={"work-card-" + work.id} {...work} />) ||
        "loading..."}
      <ModalButton>
        <div></div>
      </ModalButton>
      <Toolbar>
        <input type="text" placeholder="Search & Filters" />
        <Icon
          path={mdiSortClockAscendingOutline}
          size={"calc(var(--toolbar-height) / 2)"}
          style={{ marginRight: "10px" }}
        />
      </Toolbar>
      <div className="bottom-spacer-with-float-button" />
    </section>
  )
})
