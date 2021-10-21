import { mdiFilmstripBoxMultiple } from "@mdi/js"
import Icon from "@mdi/react"
import React, { useEffect } from "react"
import { useHistory, useLocation } from "react-router"
import { useLog } from "../../utils/dev"
import "./style.less"

export default () => {
  useEffect(() => {
    setTimeout(() => window.scroll({ top: visualViewport.height * 0.7 }))
  }, [])

  useLog(useHistory())
  return (
    <section id="page-activity">
      <header>
        <h1 contentEditable>Activity Title</h1>
        <div className="work-info" style={{marginLeft: "var(--toolbar-margin)"}}>
          <div className="category">
            <Icon path={mdiFilmstripBoxMultiple} size="1.3rem" />
            <div>Machikado Mazoku</div>
          </div>
        </div>
      </header>
      <div>
        <div contentEditable>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum,
            quisquam recusandae ipsum quaerat voluptas animi dolores veritatis
            commodi! Laboriosam eaque vero voluptatum earum assumenda minus
            repudiandae laudantium pariatur deserunt aliquam.
          </p>
        </div>
      </div>
    </section>
  )
}
