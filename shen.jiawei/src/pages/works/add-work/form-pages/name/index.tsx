import "./style.less"

import React from "react"
import { FormPageConfig } from "../.."
import InputMaterial from "../../../../../components/material-input"
import { WorkTypeTag } from "../../../../work/components/work-info"
import { view } from "@risingstack/react-easy-state"
import { useAllRequiredForm } from "../../../../../utils/forms"

interface NameForm {
  name: string
}

const WorkNameFormPage: FormPageConfig = {
  validate: ({ name }) => !!name,
  FormPage: view(({ formData, submit }) => {
    const { Form, register } = useAllRequiredForm<NameForm>({
      defaultValues: {
        name: formData.name
      }
    })
    return (
      <>
        <h3>
          Enter name for this
          <WorkTypeTag {...formData} />
        </h3>
        <Form handleSubmit={submit}>
          <InputMaterial
            // label="Work Title"
            placeholder="Work Title"
            {...register("name", {
              onChange: ({ currentTarget: { value } }) => {
                formData.name = value
              }
            })}
          />
        </Form>
      </>
    )
  })
}

export default WorkNameFormPage
