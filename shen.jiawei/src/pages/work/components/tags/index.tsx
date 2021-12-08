import "./style.less"

import React from "react"
import type WorkData from "../../../../api/data-tables/WorkData"
import Icon from "@mdi/react"
import { WorkTag } from "../../../../api/data-tables/WorkData"
import { classNames } from "../../../../utils/classNames"

const WorkTags = (
  props: Pick<WorkData, "tags"> & {
    icon?: string
    iconRight?: string
    scroll?: boolean
    onClick?: (tag: WorkTag) => void
  }
) =>
  props.tags ? (
    <div className={classNames("work-tags", props.scroll && "scroll")}>
      {[...props.tags].map(t => (
        <div
          className={t}
          onClick={props.onClick ? () => props.onClick(t) : null}
        >
          {props.icon ? <Icon path={props.icon} /> : null}
          {<span>{t}</span>}
          {props.iconRight ? <Icon path={props.iconRight} /> : null}
        </div>
      ))}
    </div>
  ) : null

export default WorkTags
