import React from "react"
import { FormPageConfig, GenericHeading } from "../.."
import EditTags from "../../../../work/components/tags/edit-tags"

const WorkTagsFormPage: FormPageConfig = {
  validate: ({ tags }) => tags.size > 0,
  FormPage: ({ formData }) => (
    <>
      <GenericHeading {...formData} />
      <EditTags w={formData} />
    </>
  )
}

export default WorkTagsFormPage
