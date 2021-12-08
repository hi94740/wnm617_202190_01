// import "./style.less"

import React from "react"
import { FormPageConfig } from "../.."
import { WorkTypes } from "../../../../../api/data-tables/WorkData"
import ChooseType from "../../../../work/components/choose-type"
import { view } from "@risingstack/react-easy-state"

const WorkTypeFormPage: FormPageConfig = {
  validate: ({ type }) => WorkTypes.includes(type),
  FormPage: view(({ formData }) => (
    <>
      <h3>Add what type of work?</h3>
      <ChooseType w={formData} />
    </>
  ))
}

export default WorkTypeFormPage
