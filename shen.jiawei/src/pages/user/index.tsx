import React from "react"
import { useHistory } from "react-router"

export default () => {
  const history = useHistory()
  const logout = () => history.push("/")

  return (
    <section>
      <h1>Hi! I'm the one and only user! 👴🏻</h1>
      <button onClick={logout}>Log Out</button>
    </section>
  )
}
