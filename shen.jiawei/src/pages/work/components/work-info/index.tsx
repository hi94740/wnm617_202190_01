import "./style.less"

import {
  mdiFilmstripBox,
  mdiFilmstripBoxMultiple,
  mdiMapMarkerMultiple
} from "@mdi/js"
import Icon from "@mdi/react"
import React from "react"
import type WorkData from "../../../../api/data-tables/WorkData"
import { capitalize } from "lodash"
import type { PickR } from "../../../../utils/types"
import type { ActivityCountData } from "../../../../api/data-tables/variations/work-data-with-activity-count"
import { IconProps } from "@mdi/react/dist/IconProps"

const bottomIconSize = "1.3em"

type WorkTypeIconProps = Pick<WorkData, "type"> & Partial<IconProps>

export const WorkTypeIcon = ({ type, ...props }: WorkTypeIconProps) => (
  <Icon
    path={type === "series" ? mdiFilmstripBoxMultiple : mdiFilmstripBox}
    size={bottomIconSize}
    {...props}
  />
)

export const WorkTypeTag = ({
  type,
  name,
  showName,
  ...props
}: Pick<WorkData, "type" | "name"> & {
  showName?: boolean
} & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >) => {
  const title = showName ? name || "" : capitalize(type || "")
  return (
    <div
      className="work-type-tag"
      style={
        {
          "--color":
            type === "series"
              ? "var(--color-primary)"
              : "var(--color-secondary)"
        } as React.CSSProperties
      }
      {...props}
    >
      <WorkTypeIcon type={type} />
      <div title={title}>{title}</div>
    </div>
  )
}

export const ActivityCount = ({ activity_count }: ActivityCountData) => (
  <div className="activity-count">
    <Icon path={mdiMapMarkerMultiple} size={bottomIconSize} />
    <div>{activity_count || "Loading..."}</div>
  </div>
)

export const WorkInfo = (
  w: (PickR<WorkData, "type"> & ActivityCountData) | null
) => {
  return (
    <div className="work-info">
      <WorkTypeTag {...w} />
      {w.activity_count ? <ActivityCount {...w} /> : null}
    </div>
  )
}
