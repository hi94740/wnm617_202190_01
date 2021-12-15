import { useReducer } from "react";

export const useStepCounter = () => useReducer(
  (count: number, action: "up" | "down") =>
    action === "up" ? ++count : --count,
  0
)