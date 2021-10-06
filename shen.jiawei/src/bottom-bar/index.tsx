import "./style.less"

import React from "react"
import { NavLink, Route, Switch, useHistory } from "react-router-dom"

export default () => {
  const { goBack } = useHistory()

  return (
    <footer>
      <Switch>
        <Route exact path={["/map", "/works", "/user"]}>
          <nav>
            <NavLink to="/map" activeClassName="selected">
              Map
            </NavLink>
            <NavLink to="/works" activeClassName="selected">
              Works
            </NavLink>
            <NavLink to="/user" activeClassName="selected">
              User
            </NavLink>
          </nav>
        </Route>
        <Route>
          <button onClick={goBack}>《 back</button>
        </Route>
      </Switch>
    </footer>
  )
}
