import "./style.less"

import React from "react"
import { useHistory } from "react-router"

export default () => {
  const history = useHistory()
  const login = () => history.push("/map")

  return (
    <section id="page-login">
      <form onSubmit={login}>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </form>
    </section>
  )
}
