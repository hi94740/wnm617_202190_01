import { useEffect } from "react"

export const useLog: typeof console.log = (...logs) =>
  useEffect(() => console.log(...logs), logs)
