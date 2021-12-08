import type { Override } from "../../utils/types"
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

class UserData
  extends DataTableConverter<RawUserData>
  implements ParsedUserData
{
  id?: UserID
  name?: string
  username?: string
  password?: string
  img?: string
  constructor(rawData: RawUserData = {} as RawUserData) {
    super(rawData)
    this.id = rawData.id as UserID
    this.name = rawData.name
    this.username = rawData.username
    this.password = rawData.password
    this.img = rawData.img
  }
  toRawData() {
    return {} as RawUserData
  }
}

export type UserDataTypes = [UserData, RawUserData, typeof UserData]
export default UserData
