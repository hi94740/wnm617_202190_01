import { KVPair } from "../../utils/types"
import { UserID, WorkID } from "../ids"

interface RawWorkData {
  id?: number
  user_id?: number
  type?: string
  name?: string
  tags?: string
  img?: string
  date_create?: number
}

type WorkType = "single" | "series"
type WorkTag = "Anime" | "Drama" | "Love" | "Sci-Fi" | "Thriller" | "Action"

type ParsedWorkData = {
  [P in keyof RawWorkData]: P extends "id"
    ? WorkID
    : P extends "user_id"
    ? UserID
    : P extends "type"
    ? WorkType
    : P extends "tags"
    ? Set<WorkTag>
    : P extends "date_create"
    ? Date
    : RawWorkData[P]
}

export class WorkData implements ParsedWorkData {
  id?: WorkID
  user_id?: UserID
  name?: string
  type?: WorkType
  tags?: Set<WorkTag>
  img?: string
  date_create?: Date
  constructor(rawData: RawWorkData) {
    Object.entries(rawData).forEach(([k, v]: KVPair<RawWorkData>) => {
      const key = k
      switch (key) {
        case "id":
          this[key] = v as WorkID
          break
        case "user_id":
          this[key] = v as UserID
          break
        case "date_create":
          this[key] = new Date(v)
          break
        case "type":
          this[key] = v as WorkType
          break
        case "tags":
          this[key] = new Set((v as string).split(",") as WorkTag[])
          break
        default:
          this[key] = v as ParsedWorkData[typeof key]
      }
    })
  }
}

export type WorkDataTypes = [WorkData, RawWorkData, typeof WorkData]
export default WorkData
