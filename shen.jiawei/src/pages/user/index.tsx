import "./style.less"

import React from "react"
import { useHistory } from "react-router"
import { Toolbar } from "../../bottom-bar"
import { useUserID } from "../../storage"
import Icon from "@mdi/react"
import { mdiAccountCircleOutline } from "@mdi/js"

export default () => {
  const history = useHistory()
  const [, setUserID] = useUserID()
  const logout = () => {
    setUserID(null)
    setTimeout(() => history.push("/"))
  }

  return (
    <section id="page-user">
      <Icon path={mdiAccountCircleOutline} size="5rem" />
      <h1 contentEditable>User</h1>
      <Toolbar>
        <button onClick={logout}>Change Password</button>
        <button onClick={logout}>Log Out</button>
      </Toolbar>
    </section>
  )
}
