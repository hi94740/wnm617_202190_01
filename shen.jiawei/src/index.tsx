import React from "react"
import ReactDOM from "react-dom"
import { HashRouter } from "react-router-dom"

import App from "./app"
import { ToolbarContextProvider } from "./bottom-bar"

ReactDOM.render(
  <HashRouter hashType="noslash">
    <ToolbarContextProvider>
      <App />
    </ToolbarContextProvider>
  </HashRouter>,
  document.getElementById("app")
)
