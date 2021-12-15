import "./style.less"

import React from "react"
import Icon from "@mdi/react"
import { mdiPlus } from "@mdi/js"
import { classNames } from "../../utils/classNames"

const FloatButton = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button {...props} className="float-button">
      <Icon path={mdiPlus} />
    </button>
  )
}

export default FloatButton

export const ModalButton = (props: {
  // modal: boolean
  // onClick: MouseEventHandler
  show: boolean
  setShow: (show: boolean) => void
  children: React.ReactNode
}) => (
  <div className={classNames("float-button", props.show ? "modal" : "")}>
    {props.children}
    <button onClick={() => props.setShow(!props.show)}>
      <Icon path={mdiPlus} />
    </button>
  </div>
)
