type ClassNames = string[] | ClassNames[]

export const classNames = (...names: ClassNames) =>
  names
    .flat(Infinity)
    .filter(c => c && typeof c === "string")
    .join(" ")
