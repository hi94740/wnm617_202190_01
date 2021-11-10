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
import { useWorksQuery } from "../../api/query"
import type WorkData from "../../api/data-tables/WorkData"

const Card = (w: WorkData) => {
  return (
    <Link to="/work">
      <div className="card-work">
        <img src={w.img} />
        <div>
          <h2>{w.name}</h2>
          <WorkInfo {...w} />
        </div>
      </div>
    </Link>
  )
}

export default () => {
  const { data } = useWorksQuery()
  return (
    <section id="page-works">
      {data?.map(work => <Card key={"work-card-" + work.id} {...work} />) || "loading..."}
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
}
