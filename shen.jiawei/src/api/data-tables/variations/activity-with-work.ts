import type { PickR } from "../../../utils/types"
import ActivityData, { RawActivityData } from "../ActivityData"
import { DataTableConverter } from "../DataTableConverter"
import WorkData, { RawWorkData } from "../WorkData"

export interface RawActivityWithWorkData {
  a: RawActivityData
  w: RawWorkData
}

class ActivityWithWorkData<
  A extends keyof ActivityData = keyof ActivityData,
  W extends keyof WorkData = keyof WorkData
> extends DataTableConverter<RawActivityWithWorkData> {
  activity: PickR<ActivityData, A>
  work: PickR<WorkData, W>
  constructor({ a, w }: RawActivityWithWorkData) {
    super({ a, w })
    this.activity = new ActivityData(a) as unknown as typeof this.activity
    this.work = new WorkData(w) as unknown as typeof this.work
  }
  toRawData() {
    return { a: {}, w: {} } as RawActivityWithWorkData
  }
}

export default ActivityWithWorkData
