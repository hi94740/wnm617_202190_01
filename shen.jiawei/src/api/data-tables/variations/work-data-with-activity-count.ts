import WorkData, { RawWorkData } from "../WorkData"

export interface ActivityCountData {
  activity_count: number
}

export class WorkDataWithActivityCount
  extends WorkData
  implements ActivityCountData
{
  activity_count: number
  constructor(rawData: RawWorkData & ActivityCountData) {
    super(rawData)
    this.activity_count = rawData.activity_count
  }
}
