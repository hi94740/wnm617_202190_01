import "./style.less"

import React, { MouseEventHandler, ReactNode, useState } from "react"
import Icon from "@mdi/react"
import { mdiPlus } from "@mdi/js"

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
  children: ReactNode
}) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <div className={["float-button", showModal ? "modal" : ""].join(" ")}>
      {props.children}
      <button onClick={() => setShowModal(!showModal)}>
        <Icon path={mdiPlus} />
      </button>
    </div>
  )
}
