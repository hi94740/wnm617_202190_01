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

const Card = () => {
  return (
    <Link to="/work">
      <div className="card-work">
        <img src="img/demo/machikado_mazoku_cover.jpg" />
        <div>
          <h2>Machikado Mazoku</h2>
          <WorkInfo />
        </div>
      </div>
    </Link>
  )
}

export default () => {
  const [showModal, setShowModal] = useState(false)
  return (
    <section id="page-works">
      {Array(6).fill(<Card />)}
      <Toolbar>
        <input type="text" placeholder="Search & Filters" />
        <Icon
          path={mdiSortClockAscendingOutline}
          size={"calc(var(--toolbar-height) / 2)"}
          style={{ marginRight: "10px" }}
        />
      </Toolbar>
      <ToolbarModal show={showModal}>Test</ToolbarModal>
    </section>
  )
}
