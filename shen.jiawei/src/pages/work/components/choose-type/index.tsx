import "./style.less"

import React from "react"
import type WorkData from "../../../../api/data-tables/WorkData"
import { WorkTypeTag } from "../../../work/components/work-info"
import { WorkTypes } from "../../../../api/data-tables/WorkData"
import { view } from "@risingstack/react-easy-state"

const ChooseType = view(({ w }: { w: Pick<WorkData, "type"> }) => (
  <div className="choose-work-type">
    {WorkTypes.map(t => (
      <WorkTypeTag
        type={t}
        onClick={() => (w.type = t)}
        className={w.type === t ? "selected" : ""}
      />
    ))}
  </div>
))

export default ChooseType
