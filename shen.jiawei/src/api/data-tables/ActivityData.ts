import type { Nominal, Override } from "../../utils/types"
import type { ActivityID, WorkID } from "../ids"
import { DataTableConverter } from "./DataTableConverter"
export interface RawActivityData {
  id?: number
  work_id?: number
  lat?: string
  lng?: string
  title?: string
  description?: string
  images?: string
  date_create?: number
}

// export type Latitude = Nominal<"Latitude", number>
// export type Longtitude = Nominal<"Longtitude", number>
type ParsedActivityData = Override<
  RawActivityData,
  {
    id: ActivityID
    work_id: WorkID
    lat?: number
    lng?: number
    images?: string[]
    date_create: Date
  }
>

class ActivityData
  extends DataTableConverter<RawActivityData>
  implements ParsedActivityData
{
  id?: ActivityID
  work_id?: WorkID
  lat?: number
  lng?: number
  title?: string
  description?: string
  images?: string[]
  constructor(rawData: RawActivityData = {} as RawActivityData) {
    super(rawData)
    this.id = rawData.id as ActivityID
    this.work_id = rawData.work_id as WorkID
    this.lat = parseFloat(rawData.lat)
    this.lng = parseFloat(rawData.lng)
    this.title = rawData.title
    this.description = rawData.description
    if (rawData.images) this.images = JSON.parse(rawData.images)
  }
  toRawData() {
    return {} as RawActivityData
  }
}

export type ActivityDataTypes = [
  ActivityData,
  RawActivityData,
  typeof ActivityData
]
export default ActivityData
