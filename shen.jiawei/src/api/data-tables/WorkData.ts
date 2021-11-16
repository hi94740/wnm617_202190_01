import type { KVPair, Override } from "../../utils/types"
import type { UserID, WorkID } from "../ids"
import { DataTableConverter } from "./DataTableConverter"

export interface RawWorkData {
  id?: number
  user_id?: number
  type?: string
  name?: string
  tags?: string
  img?: string
  date_create?: number
}

export type WorkType = "single" | "series"
export type WorkTag =
  | "Anime"
  | "Drama"
  | "Love"
  | "Sci-Fi"
  | "Thriller"
  | "Action"
export const WorkTags = [
  "Anime",
  "Drama",
  "Love",
  "Sci-Fi",
  "Thriller",
  "Action"
] as const

type ParsedWorkData = Override<
  RawWorkData,
  {
    id: WorkID
    user_id: UserID
    type: WorkType
    tags: Set<WorkTag>
    date_create: Date
  }
>

class WorkData
  extends DataTableConverter<RawWorkData>
  implements ParsedWorkData
{
  id?: WorkID
  user_id?: UserID
  name?: string
  type?: WorkType
  tags?: Set<WorkTag>
  img?: string
  date_create?: Date
  constructor(rawData: RawWorkData) {
    super(rawData)
    this.id = rawData.id as WorkID
    this.user_id = rawData.user_id as UserID
    this.name = rawData.name
    this.type = rawData.type as WorkType
    this.tags = new Set((rawData.tags)?.split(",") as WorkTag[])
    this.img = rawData.img
    this.date_create = new Date(rawData.date_create)
  }
  toRawData() {
    return {} as RawWorkData
  }
}

export type WorkDataTypes = [WorkData, RawWorkData, typeof WorkData]
export default WorkData
