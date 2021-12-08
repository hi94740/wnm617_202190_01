import "./style.less"

import { mdiSortClockAscendingOutline } from "@mdi/js"
import Icon from "@mdi/react"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Toolbar, ToolbarModal } from "../../bottom-bar"
import { WorkInfo } from "../work/components/work-info"
import { ModalButton } from "../../components/float-button"
import AddWork from "./add-work"
import WorkData from "../../api/data-tables/WorkData"
import type { PickR } from "../../utils/types"
import { createQueryParameter, useQuery } from "../../api/predefined-query"
import type { ActivityCount } from "../../api/data-tables/variations/work-data-with-activity-count"
import { withUserID } from "../../storage"
import WorkTags from "../work/components/tags"
import Button from "../../components/button"
import LoaderRadial from "../../components/loader-radial"

const Card = (
  w: PickR<WorkData, "id" | "img" | "name" | "type" | "tags"> & ActivityCount
) => (
  <Link to={"/work/" + w.id}>
    <div className="card-work">
      <img src={w.img || "https://via.placeholder.com/360x510?text=Add"} />
      <div>
        <h2>{w.name}</h2>
        <WorkTags {...w} />
        <WorkInfo {...w} />
      </div>
    </div>
  </Link>
)

export default withUserID(() => {
  const { data } = useQuery("works", createQueryParameter("works", [{}]))
  const [showAddWorkModal, setShowAddWorkModal] = useState(false)
  return (
    <section id="page-works">
      {data?.map(work => <Card key={"work-card-" + work.id} {...work} />) || (
        <LoaderRadial />
      )}
      <ModalButton show={showAddWorkModal} setShow={setShowAddWorkModal}>
        <AddWork show={showAddWorkModal} setShow={setShowAddWorkModal} />
      </ModalButton>
      <Toolbar>
        <input type="text" placeholder="Search & Filters" />
        <Button icon={mdiSortClockAscendingOutline} />
      </Toolbar>
      <div className="bottom-spacer-with-float-button" />
    </section>
  )
})
