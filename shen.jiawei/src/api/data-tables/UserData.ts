import type { KVPair } from "../../utils/types"
import type { UserID } from "../ids"

interface RawUserData {
  id?: number
  name?: string
  username?: string
  password?: string
  img?: string
  date_create?: number
}

type ParsedUserData = {
  [P in keyof RawUserData]: P extends "id"
    ? UserID
    : P extends "date_create"
    ? Date
    : RawUserData[P]
}

export class UserData implements ParsedUserData {
  id?: UserID
  name?: string
  username?: string
  password?: string
  img?: string
  date_create?: Date
  constructor(rawData: RawUserData) {
    Object.entries(rawData).forEach(([k, v]: KVPair<RawUserData>) => {
      const key = k
      switch (key) {
        case "id":
          this[key] = v as UserID
          break
        case "date_create":
          this[key] = new Date(v)
          break
        default:
          this[key] = v as ParsedUserData[typeof key]
      }
    })
  }
}

export type UserDataTypes = [UserData, RawUserData, typeof UserData]
export default UserData
