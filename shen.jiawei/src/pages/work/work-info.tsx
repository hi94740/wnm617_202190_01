import "./work-info.less"

import { mdiFilmstripBoxMultiple, mdiMapMarker } from "@mdi/js"
import Icon from "@mdi/react"
import React from "react"
import type WorkData from "../../api/data-tables/WorkData"
import { capitalize } from "lodash"

export const WorkInfo = (w: WorkData) => {
  const bottomIconSize = "1.3em"
  return (
    <div className="work-info">
      <div className="category">
        <Icon path={mdiFilmstripBoxMultiple} size={bottomIconSize} />
        <div>{capitalize(w.type)}</div>
      </div>
      <div className="activity-count">
        <Icon path={mdiMapMarker} size={bottomIconSize} />
        <div>18</div>
      </div>
    </div>
  )
}
