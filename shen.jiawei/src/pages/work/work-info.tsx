import "./work-info.less"

import { mdiFilmstripBox, mdiFilmstripBoxMultiple, mdiMapMarkerMultiple } from "@mdi/js"
import Icon from "@mdi/react"
import React from "react"
import type WorkData from "../../api/data-tables/WorkData"
import { capitalize } from "lodash"
import type { PickR } from "../../utils/types"
import type { ActivityCount } from "../../api/data-tables/variations/work-data-with-activity-count"

export const WorkInfo = (w: PickR<WorkData, "type"> & ActivityCount) => {
  const bottomIconSize = "1.3em"
  return (
    <div className="work-info">
      <div className="category">
        <Icon
          path={w.type === "series" ? mdiFilmstripBoxMultiple : mdiFilmstripBox}
          size={bottomIconSize}
        />
        <div>{capitalize(w.type)}</div>
      </div>
      <div className="activity-count">
        <Icon path={mdiMapMarkerMultiple} size={bottomIconSize} />
        <div>{w.activity_count}</div>
      </div>
    </div>
  )
}
