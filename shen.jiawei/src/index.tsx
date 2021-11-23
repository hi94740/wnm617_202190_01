import React from "react"
import ReactDOM from "react-dom"
import { HashRouter } from "react-router-dom"

import App from "./app"
import { ToolbarContextProvider } from "./bottom-bar"

import smoothscroll from "smoothscroll-polyfill"
import { HistoryObservableContextProvider } from "./utils/history"
smoothscroll.polyfill()

ReactDOM.render(
  <HashRouter hashType="noslash">
    <HistoryObservableContextProvider>
      <ToolbarContextProvider>
        <App />
      </ToolbarContextProvider>
    </HistoryObservableContextProvider>
  </HashRouter>,
  document.getElementById("app")
)
