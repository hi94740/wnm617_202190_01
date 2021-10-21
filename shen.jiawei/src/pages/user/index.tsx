import React from "react"
import { useHistory } from "react-router"
import { Toolbar } from "../../bottom-bar"
import { useUsername } from "../../storage"

export default () => {
  const history = useHistory()
  const [, setUsername] = useUsername()
  const logout = () => {
    setUsername(null)
    setTimeout(() => history.push("/"))
  }

  return (
    <section>
      <h1>Hi! I'm the one and only user! 👴🏻</h1>
      <Toolbar>
        <button onClick={logout}>Log Out</button>
      </Toolbar>
    </section>
  )
}
