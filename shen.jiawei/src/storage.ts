import { useStorageState } from "react-storage-hooks"

export const useUsername = () => useStorageState(sessionStorage, "username", null as string)