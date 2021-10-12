import "./style.less"
import Icon from "@mdi/react"
import { IconProps } from "@mdi/react/dist/IconProps"
import {
  mdiAccount,
  mdiFormatListText,
  mdiMapMarker,
  mdiSortClockAscendingOutline
} from "@mdi/js"

import React, { useState } from "react"
import { NavLink, Route, Switch, useHistory } from "react-router-dom"
import { debounce } from "lodash"

const NavIcon = (props: IconProps) => {
  props = {
    size: "calc(var(--toolbar-height) / 2)",
    ...props
  }
  return (
    <div>
      <div>
        <Icon {...props} />
      </div>
      <div>
        <Icon {...props} />
      </div>
    </div>
  )
}

export default () => {
  const { goBack } = useHistory()

  const [navActive, setNavActive] = useState(false)
  const [debounceCloseNav] = useState(() =>
    debounce(() => {
      setNavActive(false)
    }, 2800)
  )
  const tapNav = () => {
    setNavActive(true)
    debounceCloseNav()
  }

  return (
    <footer>
      <Switch>
        <Route exact path={["/map", "/works", "/user"]}>
          <div>
            <div>
              <input type="text" placeholder="Search & Filters" />
              <Icon
                path={mdiSortClockAscendingOutline}
                size={"calc(var(--toolbar-height) / 2)"}
                style={{marginRight: "10px"}}
              />
            </div>
            <nav className={navActive ? "active" : ""} onClick={tapNav}>
              <NavLink to="/map" activeClassName="selected">
                <NavIcon path={mdiMapMarker} />
              </NavLink>
              <NavLink to="/works" activeClassName="selected">
                <NavIcon path={mdiFormatListText} />
              </NavLink>
              <NavLink to="/user" activeClassName="selected">
                <NavIcon path={mdiAccount} />
              </NavLink>
            </nav>
          </div>
        </Route>
        <Route>
          <button onClick={goBack}>《 back</button>
        </Route>
      </Switch>
    </footer>
  )
}
