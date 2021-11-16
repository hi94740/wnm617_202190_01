import "./style.less"

import React from "react"
import { WorkInfo } from "./work-info"
import { Link } from "react-router-dom"
import FloatButton from "../../components/float-button"

const Activity = () => {
  return (
    <Link to="/map/activity?activity">
      <h3>Activity Title</h3>
      <p>12/28/2020 16:34</p>
    </Link>
  )
}

export default () => {
  return (
    <section id="page-work">
      <header
        style={{
          backgroundImage: "url('img/demo/machikado_mazoku_header.jpg')"
        }}
      >
        <div className="dimmer">
          <img src="img/demo/machikado_mazoku_cover.jpg" />
          <div className="header">
            {/* <WorkInfo /> */}
            <h1 contentEditable>Machikado Mazoku</h1>
          </div>
        </div>
      </header>
      {Array(18).fill(<Activity />)}
      <FloatButton />
      <div className="bottom-spacer-with-float-button" />
    </section>
  )
}
