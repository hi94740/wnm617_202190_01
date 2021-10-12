import "./style.less"

import React, { FormEventHandler, useState } from "react"
import { useHistory } from "react-router"
import { useUsername } from "../../storage"

export default () => {
  const history = useHistory()
  const [, setUsername] = useUsername()

  const login: FormEventHandler = event => {
    event.preventDefault()
    const input = Object.fromEntries([
      ...new FormData(event.target as HTMLFormElement)
    ]) as {
      username: string
      password: string
    }
    if (input.username == "user" && input.password == "pass") {
      setUsername(input.username)
      history.push("/map")
    } else {
      alert("Wrong!")
    }
  }

  return (
    <section id="page-login">
      <form onSubmit={login}>
        <input
          type="text"
          name="username"
          placeholder="Username"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
        />
        <button>Login</button>
      </form>
    </section>
  )
}
