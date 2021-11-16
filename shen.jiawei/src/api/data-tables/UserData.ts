import type { KVPair, Override } from "../../utils/types"
import type { UserID } from "../ids"
import { DataTableConverter } from "./DataTableConverter"

export interface RawUserData {
  id?: number
  name?: string
  username?: string
  password?: string
  img?: string
  date_create?: number
}

type ParsedUserData = Override<
  RawUserData,
  {
    id: UserID
    date_create: Date
  }
>

type a = abstract new <
  R,
  P extends {
    toRawData: (data: P) => R
  }
>(
  rawData: R
) => P

class UserData
  extends DataTableConverter<RawUserData>
  implements ParsedUserData
{
  id?: UserID
  name?: string
  username?: string
  password?: string
  img?: string
  date_create?: Date
  constructor(rawData: RawUserData) {
    super(rawData)
    this.id = rawData.id as UserID
    this.name = rawData.name
    this.username = rawData.username
    this.password = rawData.password
    this.img = rawData.img
    this.date_create = new Date(rawData.date_create)
  }
  toRawData() {
    return {} as RawUserData
  }
}

export type UserDataTypes = [UserData, RawUserData, typeof UserData]
export default UserData
