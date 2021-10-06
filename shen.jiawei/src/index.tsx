import React from "react"
import ReactDOM from "react-dom"
import { HashRouter } from "react-router-dom"

import App from "./app"

ReactDOM.render(
  <HashRouter hashType="noslash">
    <App />
  </HashRouter>,
  document.getElementById("app")
)
