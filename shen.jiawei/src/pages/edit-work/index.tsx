import "./style.less"

import React, { useEffect, useState } from "react"
import { useUserID, withUserID } from "../../storage"
import { useHistory, useParams } from "react-router-dom"
import { WorkID } from "../../api/ids"
import {
  useQuery,
  createQueryParameter,
  query
} from "../../api/predefined-query"
import { store, view } from "@risingstack/react-easy-state"
import LoaderRadial from "../../components/loader-radial"
import { useAllRequiredForm } from "../../utils/forms"
import InputMaterial from "../../components/material-input"
import ChooseType from "../work/components/choose-type"
import EditTags from "../work/components/tags/edit-tags"
import { Toolbar } from "../../bottom-bar"
import Button from "../../components/button"
import { cloneDeep } from "lodash-es"
import useUploadImage from "../../api/upload-image"

export default withUserID(
  view(() => {
    const workID = parseInt(useParams<{ work_id: string }>().work_id) as WorkID
    const { data: [data] = [null], loading } = useQuery(
      "works",
      createQueryParameter("works", [
        {
          where: [["id", workID]]
        }
      ])
    )
    const formStore = store({ formData: data })
    const { formData } = formStore
    const { Form, register, reset, watch } =
      useAllRequiredForm<{ name: string }>()
    watch(({ name }) => {
      if (formData) formData.name = name
    })
    const resetToServerData = () => {
      formStore.formData = cloneDeep(data)
      reset({ name: data?.name })
    }
    useEffect(resetToServerData, [data])
    console.log(formStore)

    const { ImageUploader, upLoading, openImagePicker } = useUploadImage(
      u => (formData.img = u)
    )

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uid] = useUserID()
    const { goBack } = useHistory()
    const submit = async () => {
      setIsSubmitting(true)
      await query("edit_work", formData.toRawData(), uid, false)
      goBack()
    }

    return (
      <section id="page-edit-work">
        {!formData || loading ? (
          <LoaderRadial />
        ) : (
          <>
            <div className="form-edit-work">
              <Form>
                <InputMaterial {...register("name")} />
              </Form>
              <ChooseType w={formData} />
              <EditTags w={formData} />
            </div>
            <div className="work-img" onClick={openImagePicker}>
              {upLoading ? (
                <LoaderRadial />
              ) : (
                <>
                  <img
                    src={
                      formStore.formData?.img ||
                      (loading
                        ? "https://via.placeholder.com/360x510?text=Loading"
                        : "https://via.placeholder.com/360x510?text=Add")
                    }
                    alt="work image"
                  />
                  <div className="image-edit-tag">Edit</div>
                </>
              )}
            </div>
          </>
        )}
        <Toolbar classNames="grid2">
          <Button
            Type="outline black"
            onClick={resetToServerData}
            disabled={isSubmitting || loading}
          >
            Reset
          </Button>
          <Button Type="primary" loading={isSubmitting} disabled={loading} onClick={submit}>
            Save
          </Button>
        </Toolbar>
        <ImageUploader />
      </section>
    )
  })
)
