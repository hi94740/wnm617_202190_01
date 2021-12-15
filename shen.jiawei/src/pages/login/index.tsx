import "./style.less"

import React from "react"
import { Route, Switch, useHistory } from "react-router"
import { useUserID } from "../../storage"
import { query } from "../../api/predefined-query"
import { SubmitHandler } from "react-hook-form"
import Button from "../../components/button"
import { mdiArrowRight } from "@mdi/js"
import InputMaterial from "../../components/material-input"
import { Link } from "react-router-dom"
import { FormErrorObject, useAllRequiredForm } from "../../utils/forms"
import { RawUserData } from "../../api/data-tables/UserData"
import { PickR } from "../../utils/types"
import { UserID } from "../../api/ids"

interface LoginFormData {
  username: string
  password: string
}

const useLogin = (...destinations: string[]) => {
  const [, setUserID] = useUserID()
  const { push } = useHistory()
  return (uid: UserID) => {
    setUserID(uid)
    destinations.forEach(d => push(d))
  }
}

const LoginForm = () => {

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

  const login = useLogin("/map")

  const { register, formState, Form } = useAllRequiredForm<LoginFormData>()
  const handleLogin: SubmitHandler<LoginFormData> = async data => {
    try {
      const [{ id }] = await query("login", [data.username, data.password])
      if (!id) throw new Error()
      login(id)
    } catch {
      alert("Username or password incorrect.")
    }
  }
  return (
    <Form handleSubmit={handleLogin}>
      <InputMaterial {...register("username")} />
      <InputMaterial {...register("password")} />
      <Button
        iconRight={mdiArrowRight}
        Type="primary"
        loading={formState.isSubmitting}
        disabled={!(formState.isDirty && formState.isValid)}
      >
        Login
      </Button>
    </Form>
  )
}

export type AddUserFormData = PickR<RawUserData, "username" | "password">
export type AddUserFormErrors = FormErrorObject<AddUserFormData>
type SignUpFormData = AddUserFormData & { confirmPassword: string }

const SignUpForm = () => {
  const {
    register,
    formState,
    getValues,
    Form,
    setValidateErrorObject
  } = useAllRequiredForm<SignUpFormData>()

  const login = useLogin("/works", "/edit-profile")
  const handleSignUp: SubmitHandler<SignUpFormData> = async ({
    username,
    password
  }) => {
    const res = await query(
      "add_user",
      { username, password },
      undefined,
      false
    )
    if (typeof res === "number") login(res as UserID)
    else setValidateErrorObject(res)
  }

  return (
    <Form handleSubmit={handleSignUp}>
      <InputMaterial {...register("username")} />
      <InputMaterial {...register("password")} />
      <InputMaterial
        {...register("confirmPassword", {
          validate: v =>
            v === getValues("password") ||
            "Please enter the same password again"
        })}
        type="password"
      />
      <Button
        iconRight={mdiArrowRight}
        Type="primary"
        loading={formState.isSubmitting}
        disabled={!(formState.isDirty && formState.isValid)}
      >
        Sign Up
      </Button>
    </Form>
  )
}

export default () => (
  <section id="page-login">
    <Switch>
      <Route path="/" exact>
        <LoginForm />
      </Route>
      <Route path="/register">
        <SignUpForm />
      </Route>
    </Switch>
    <Switch>
      <Route path="/" exact>
        <Link className="button" to="/register">
          Need an account?
        </Link>
      </Route>
      <Route path="/register">
        <Link className="button" to="/">
          Have an account?
        </Link>
      </Route>
    </Switch>
  </section>
)
