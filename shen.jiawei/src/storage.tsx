import { ReactElement, useEffect, useReducer } from "react"
import React from "react"
import { useStorageState } from "react-storage-hooks"
import { UserID } from "./api/ids"

export const useUserID = () =>
  useStorageState(sessionStorage, "uid", null as UserID)

export const withUserID = (Page: () => ReactElement) => () => {
  const [uid] = useUserID()
  const [hasUserID, setHasUserId] = useReducer(
    (_: boolean, uid: UserID) => !!uid,
    false
  )
  useEffect(() => {
    let intid: ReturnType<typeof setInterval> = null
    if (!uid) {
      intid = setInterval(() => {
        const currentUserID = sessionStorage.getItem("uid")
        if (currentUserID) {
          setHasUserId(JSON.parse(currentUserID))
          clearInterval(intid)
        }
      })
    }
    return () => clearInterval(intid)
  }, [uid])
  return uid || hasUserID ? <Page /> : null
}
