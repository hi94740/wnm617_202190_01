import "./work-info.less"

import { mdiFilmstripBoxMultiple, mdiMapMarker } from "@mdi/js"
import Icon from "@mdi/react"
import React from "react"

export const WorkInfo = () => {
  const bottomIconSize = "1.3em"
  return (
    <div className="work-info">
      <div className="category">
        <Icon path={mdiFilmstripBoxMultiple} size={bottomIconSize} />
        <div>Series</div>
      </div>
      <div className="activity-count">
        <Icon path={mdiMapMarker} size={bottomIconSize} />
        <div>18</div>
      </div>
    </div>
  )
}
