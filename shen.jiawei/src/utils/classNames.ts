export const classNames = (...names: any) =>
  names
    .flat(Infinity)
    .filter((c: any) => c && typeof c === "string")
    .join(" ")
