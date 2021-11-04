import "./style.less"

import React, { useRef } from "react"
import ActivityPage from "../activity"
import { Route, useLocation } from "react-router"
import { usePageScrollAnimation } from "../../utils/scroll"
import { Toolbar } from "../../bottom-bar"
import FloatButton from "../../components/float-button"

export default () => {
  const location = useLocation()

  const mapContainer = useRef(null as HTMLDivElement)
  usePageScrollAnimation(scroll =>
    mapContainer.current.style.setProperty("--scroll", scroll + "px")
  )

  const isActivityPage = location.search == "?activity"

  return (
    <section id="page-map">
      <div
        ref={mapContainer}
        style={{
          height: isActivityPage
            ? "calc(100vh - 2 * (var(--toolbar-height) + var(--toolbar-margin)))"
            : "100vh"
        }}
      >
        <img src="img/demo/map.png" />
      </div>
      {isActivityPage ? <ActivityPage /> : <FloatButton />}
      <Toolbar>
        <input type="text" placeholder="Search & Filters" />
      </Toolbar>
    </section>
  )
}
