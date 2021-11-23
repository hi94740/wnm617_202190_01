import "./style.less"

import React, { FormEventHandler } from "react"
import { useHistory } from "react-router"
import { useUserID } from "../../storage"
import { query } from "../../api/predefined-query"
import { SubmitHandler, useForm } from "react-hook-form"

interface LoginFormData {
  username: string
  password: string
}

export default () => {
  const { push } = useHistory()
  const [, setUserID] = useUserID()

  // const login: FormEventHandler = async event => {
  //   event.preventDefault()
  //   const input = Object.fromEntries([
  //     ...new FormData(event.target as HTMLFormElement)
  //   ]) as {
  //     username: string
  //     password: string
  //   }
  //   // const [{ id }] = await queryUsers(["id"], {
  //   //   where: [
  //   //     ["=", ["username", input.username]],
  //   //     "AND",
  //   //     ["=", ["password", input.password]]
  //   //   ]
  //   // })
  //   const [{ id }] = await query("login", [input.username, input.password])
  //   if (id) {
  //     setUserID(id)
  //     history.push("/map")
  //   } else {
  //     alert("Wrong!")
  //   }
  // }

  const { register, handleSubmit } = useForm<LoginFormData>()
  const handleLogin: SubmitHandler<LoginFormData> = async data => {
    try {
      const [{ id }] = await query("login", [data.username, data.password])
      if (!id) throw new Error()
      setUserID(id)
      push("/map")
    } catch {
      alert("Wrong!")
    }
  }

  return (
    <section id="page-login">
      <form onSubmit={handleSubmit(handleLogin)}>
        <input type="text" placeholder="Username" {...register("username")} />
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        <button>Login</button>
      </form>
    </section>
  )
}
