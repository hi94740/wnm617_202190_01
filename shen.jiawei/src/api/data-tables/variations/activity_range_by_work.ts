import { MapTo, PickR } from "../../../utils/types"
import WorkData, { RawWorkData } from "../WorkData"

export interface RawActivityRange {
  lat_max: string
  lat_min: string
  lng_max: string
  lng_min: string
}
export type ActivityRange = MapTo<RawActivityRange, number> & {
  lat: number
  lng: number
}

export class ActivityRangeByWork extends WorkData implements ActivityRange {
  lat_max: number
  lat_min: number
  lng_max: number
  lng_min: number
  lat: number
  lng: number

  constructor(rawData: RawWorkData & RawActivityRange) {
    super(rawData)
    this.lat_max = parseFloat(rawData.lat_max)
    this.lat_min = parseFloat(rawData.lat_min)
    this.lng_max = parseFloat(rawData.lng_max)
    this.lng_min = parseFloat(rawData.lng_min)
    this.lat = (this.lat_max + this.lat_min) / 2
    this.lng = (this.lng_max + this.lng_min) / 2
  }
}

export type ActivityRangeByWorkData = PickR<
  ActivityRangeByWork,
  | "id"
  | "name"
  | "type"
  | "img"
  | "lat_max"
  | "lat_min"
  | "lng_max"
  | "lng_min"
  | "lat"
  | "lng"
>
