import type { ReactElement } from "react"
import React from "react"
import { useStorageState } from "react-storage-hooks"
import { UserID } from "./api/ids"

export const useUserID = () =>
  useStorageState(sessionStorage, "uid", null as UserID)

export const withUserID = (Page: () => ReactElement) => () =>
  useUserID()[0] ? <Page /> : null
