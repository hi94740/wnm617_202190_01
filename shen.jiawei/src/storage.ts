import { useStorageState } from "react-storage-hooks"
import { UserID } from "./api/ids"

export const useUserID = () => useStorageState(sessionStorage, "userID", null as UserID)