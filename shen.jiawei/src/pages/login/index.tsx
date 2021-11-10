import "./style.less"

import React, { FormEventHandler } from "react"
import { useHistory } from "react-router"
import { useUserID } from "../../storage"
import { queryUsers } from "../../api/query"

export default () => {
  const history = useHistory()
  const [, setUserID] = useUserID()

  const login: FormEventHandler = async event => {
    event.preventDefault()
    const input = Object.fromEntries([
      ...new FormData(event.target as HTMLFormElement)
    ]) as {
      username: string
      password: string
    }
    const [{ id }] = await queryUsers(["id"], {
      where: [
        ["=", ["username", input.username]],
        "AND",
        ["=", ["password", input.password]]
      ]
    })
    if (id) {
      setUserID(id)
      history.push("/map")
    } else {
      alert("Wrong!")
    }
  }

  return (
    <section id="page-login">
      <form onSubmit={login}>
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <button>Login</button>
      </form>
    </section>
  )
}
