import type { PickR } from "../../../utils/types"
import ActivityData, { RawActivityData } from "../ActivityData"
import WorkData, { RawWorkData } from "../WorkData"

export interface RawActivityWithWorkData {
  a: RawActivityData
  w: RawWorkData
}

class ActivityWithWorkData<
  A extends keyof ActivityData = keyof ActivityData,
  W extends keyof WorkData = keyof WorkData
> {
  activity: PickR<ActivityData, A>
  work: PickR<WorkData, W>
  constructor({ a, w }: RawActivityWithWorkData) {
    this.activity = new ActivityData(a) as unknown as typeof this.activity
    this.work = new WorkData(w) as unknown as typeof this.work
  }
}

export default ActivityWithWorkData
