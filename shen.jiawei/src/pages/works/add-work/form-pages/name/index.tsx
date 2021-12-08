import "./style.less"

import React from "react"
import { FormPageConfig } from "../.."
import InputMaterial from "../../../../../components/material-input"
import { WorkTypeTag } from "../../../../work/components/work-info"
import { view } from "@risingstack/react-easy-state"

const WorkNameFormPage: FormPageConfig = {
  validate: ({ name }) => !!name,
  FormPage: view(({ formData, submit }) => (
    <>
      <h3>
        Enter name for this
        <WorkTypeTag {...formData} />
      </h3>
      <form
        onSubmit={e => {
          e.preventDefault()
          submit()
        }}
      >
        <InputMaterial
          // label="Work Title"
          placeholder="Work Title"
          onChange={({ currentTarget: { value } }) => {
            formData.name = value
          }}
          value={formData.name || ""}
        />
      </form>
    </>
  ))
}

export default WorkNameFormPage
