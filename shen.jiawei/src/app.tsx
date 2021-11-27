import "./app.less"

import React, { useEffect } from "react"
import { Route, Switch, useHistory, useLocation } from "react-router-dom"
import { CSSTransition, TransitionGroup } from "react-transition-group"

import LoginPage from "./pages/login"
import MapPage from "./pages/map"
import WorksPage from "./pages/works"
import WorkPage from "./pages/work"
import UserPage from "./pages/user"
import BottomBar from "./bottom-bar"

import { useUserID } from "./storage"

const pageWithoutLogin = ["/"]

export default () => {
  const history = useHistory()
  const location = useLocation()
  const [userID] = useUserID()

  useEffect(() => {
    if (!pageWithoutLogin.includes(history.location.pathname) && !userID)
      history.push("/")
    if (pageWithoutLogin.includes(history.location.pathname) && userID)
      history.push("/map")
  }, [])

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={"page-" + location.pathname}
        classNames="fade"
        timeout={300}
      >
        <Switch location={location}>
          <Route exact path="/">
            <LoginPage />
          </Route>
          <Route path="/map">
            <MapPage />
          </Route>
          <Route path="/works">
            <WorksPage />
          </Route>
          <Route path="/work/:work_id">
            <WorkPage />
          </Route>
          <Route path="/user">
            <UserPage />
          </Route>
        </Switch>
      </CSSTransition>
      <CSSTransition
        key={"show-bottom-bar-" + (location.pathname == "/")}
        classNames="fade"
        timeout={300}
      >
        <Switch location={location}>
          <Route exact path="/"></Route>
          <Route>
            <BottomBar />
          </Route>
        </Switch>
      </CSSTransition>
    </TransitionGroup>
  )
}
