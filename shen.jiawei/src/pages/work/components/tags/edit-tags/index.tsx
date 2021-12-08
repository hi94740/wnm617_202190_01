import "./style.less"

import React from "react"
import { PickR } from "../../../../../utils/types"
import type WorkData from "../../../../../api/data-tables/WorkData"
import WorkTags from ".."
import { WorkTagOptions } from "../../../../../api/data-tables/WorkData"
import { view } from "@risingstack/react-easy-state"
import { mdiMinusBox, mdiPlusBox } from "@mdi/js"

const EditTags = view(({ w }: { w: PickR<WorkData, "tags"> }) => {
  const notAdded = new Set(WorkTagOptions)
  w.tags.forEach(t => notAdded.delete(t))
  return (
    <div className="edit-work-tags">
      <h4>Tap to add tags</h4>
      <WorkTags
        tags={notAdded}
        icon={mdiPlusBox}
        scroll
        onClick={t => w.tags.add(t)}
      />
      <h4>Added tags</h4>
      <WorkTags
        {...w}
        icon={mdiMinusBox}
        scroll
        onClick={t => w.tags.delete(t)}
      />
    </div>
  )
})

export default EditTags
