import "./work-info.less"

import {
  mdiFilmstripBox,
  mdiFilmstripBoxMultiple,
  mdiMapMarkerMultiple
} from "@mdi/js"
import Icon from "@mdi/react"
import React from "react"
import type WorkData from "../../api/data-tables/WorkData"
import { capitalize } from "lodash"
import type { PickR } from "../../utils/types"
import type { ActivityCount } from "../../api/data-tables/variations/work-data-with-activity-count"
import { IconProps } from "@mdi/react/dist/IconProps"

const bottomIconSize = "1.3em"

export const WorkTypeIcon = ({
  type,
  ...props
}: { type: WorkData["type"] | undefined } & Partial<IconProps>) => (
  <Icon
    path={type === "series" ? mdiFilmstripBoxMultiple : mdiFilmstripBox}
    size={bottomIconSize}
    {...props}
  />
)

export const WorkInfo = (
  w: (PickR<WorkData, "type"> & ActivityCount) | null
) => {
  return (
    <div className="work-info">
      <div className="category">
        <WorkTypeIcon type={w?.type} />
        <div>{capitalize(w?.type || "")}</div>
      </div>
      <div className="activity-count">
        <Icon path={mdiMapMarkerMultiple} size={bottomIconSize} />
        <div>{w?.activity_count || ""}</div>
      </div>
    </div>
  )
}
