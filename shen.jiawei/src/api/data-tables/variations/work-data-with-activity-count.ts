import WorkData, { RawWorkData } from "../WorkData"

export interface ActivityCount { activity_count: number }

export class WorkDataWithActivityCount extends WorkData implements ActivityCount {
  activity_count: number
  constructor(rawData: RawWorkData & ActivityCount) {
    super(rawData)
    this.activity_count = rawData.activity_count
  }
}
