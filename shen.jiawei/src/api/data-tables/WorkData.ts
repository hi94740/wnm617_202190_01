import type { Override, TupleToUnion } from "../../utils/types"
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

export const WorkTypes = ["single", "series"] as const
export const WorkTagOptions = [
  "Anime",
  "Drama",
  "Love",
  "Sci-Fi",
  "Thriller",
  "Action"
] as const
export type WorkType = TupleToUnion<typeof WorkTypes>
export type WorkTag = TupleToUnion<typeof WorkTagOptions>

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
  constructor(rawData: RawWorkData = {} as RawWorkData) {
    super(rawData)
    this.id = rawData.id as WorkID
    this.user_id = rawData.user_id as UserID
    this.name = rawData.name
    this.type = rawData.type as WorkType
    this.tags = rawData.tags
      ? new Set(rawData.tags.split(",") as WorkTag[])
      : new Set()
    this.img = rawData.img
  }
  toRawData() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      tags: this.tags ? [...this.tags].join(",") : undefined,
      img: this.img
    } as RawWorkData
  }
}

export type WorkDataTypes = [WorkData, RawWorkData, typeof WorkData]
export default WorkData
