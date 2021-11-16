import { useStorageState } from "react-storage-hooks"
import { UserID } from "./api/ids"

export const useUserID = () => useStorageState(sessionStorage, "uid", null as UserID)