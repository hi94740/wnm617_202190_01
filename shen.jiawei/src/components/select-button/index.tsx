import "./style.less"

import React from "react"
import Button from "../button"

export interface SelectButtonProps {
  icon: string
  children?: React.ReactNode
}

export type SelectButtonListObject<K extends string = string, T = {}> = {
  [P in K]: SelectButtonProps & {
    divideLine?: boolean
  } & T
}

export function SelectButtonList<T extends SelectButtonListObject>({
  buttons,
  selected,
  onClick,
  outline,
  pushIcon
}: {
  buttons: T,
  selected: keyof T,
  onClick: (name: keyof T) => void
  outline?: boolean,
  pushIcon?: boolean
}) {
  return (
    <>
      {Object.entries(buttons).map(([name, props]) => (
        <Button
          icon={props.icon}
          children={props.children}
          onClick={() => onClick(name as keyof T)}
          Type={outline ? "select outline" : "select"}
          pushIcon={pushIcon}
          active={selected === name}
        />
      ))}
    </>
  )
}
