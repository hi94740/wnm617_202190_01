import React from "react"
import { useHistory, useLocation } from "react-router"
import { useLog } from "../../utils/dev"
import "./style.less"

export default () => {
  useLog(useHistory())
  return (
    <section id="page-activity">
      <header>
        <h1>(Probably) the best work ever</h1>
      </header>
      <div>
        <div></div>
      </div>
    </section>
  )
}
