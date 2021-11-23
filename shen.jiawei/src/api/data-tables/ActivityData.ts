import type { KVPair, Nominal, Override } from "../../utils/types"
import type { ActivityID, WorkID } from "../ids"
import { DataTableConverter } from "./DataTableConverter"

export interface RawActivityData {
  id?: number
  work_id?: number
  lat?: number
  lng?: number
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
    // lat: Latitude
    // lng: Longtitude
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
  images?: string
  date_create?: Date
  constructor(rawData: RawActivityData) {
    super(rawData)
    this.id = rawData.id as ActivityID
    this.work_id = rawData.work_id as WorkID
    this.lat = rawData.lat
    this.lng = rawData.lng
    this.title = rawData.title
    this.description = rawData.description
    this.images = rawData.images
    this.date_create = new Date(rawData.date_create)
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
