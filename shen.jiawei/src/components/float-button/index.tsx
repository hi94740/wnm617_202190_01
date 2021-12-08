import "./style.less"

import React, { MouseEventHandler, ReactNode, useState } from "react"
import Icon from "@mdi/react"
import { mdiPlus } from "@mdi/js"
import { classNames } from "../../utils/classNames"

const FloatButton = () => {
  return (
    <button className="float-button">
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
  children: ReactNode
}) => (
  <div className={classNames("float-button", props.show ? "modal" : "")}>
    {props.children}
    <button onClick={() => props.setShow(!props.show)}>
      <Icon path={mdiPlus} />
    </button>
  </div>
)
