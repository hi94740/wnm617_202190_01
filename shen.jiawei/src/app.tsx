import "./app.less"

import React from "react"
import { Route, Switch, useLocation } from "react-router-dom"
import { CSSTransition, TransitionGroup } from "react-transition-group"

import LoginPage from "./pages/login"
import MapPage from "./pages/map"
import WorksPage from "./pages/works"
import WorkPage from "./pages/work"
import UserPage from "./pages/user"
import BottomBar from "./bottom-bar"

export default () => {
  const location = useLocation()

  return (
    <>
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
            <Route path="/work">
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
    </>
  )
}
