import "./style.less"

import React from "react"
import Icon from "@mdi/react"
import { classNames } from "../../utils/classNames"
import LoaderRadial from "../loader-radial"

const Button = ({
  Type,
  icon,
  iconRight,
  loading = !true,
  children,
  ...buttonProps
}: {
  Type?: "primary" | "outline"
  icon?: string
  iconRight?: string
  loading?: boolean
  children?: React.ReactNode
} & Omit<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  "className"
>) => (
  <button
    className={classNames(
      "button",
      !children && "round",
      Type,
      loading && "loading"
    )}
    {...buttonProps}
  >
    {loading ? (
      <LoaderRadial />
    ) : (
      <>
        {icon ? <Icon path={icon} /> : null}
        {children ? <div>{children}</div> : null}
        {iconRight ? <Icon path={iconRight} /> : null}
      </>
    )}
  </button>
)

export default Button
