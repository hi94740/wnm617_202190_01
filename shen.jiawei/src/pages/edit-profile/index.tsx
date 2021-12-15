import "./style.less"

import React, { useEffect } from "react"
import { useUserID, withUserID } from "../../storage"
import { FormErrorObject, useAllRequiredForm } from "../../utils/forms"
import InputMaterial from "../../components/material-input"
import { PickR, TupleToUnion } from "../../utils/types"
import { RawUserData } from "../../api/data-tables/UserData"
import { Toolbar } from "../../bottom-bar"
import Button from "../../components/button"
import { query, useQuery } from "../../api/predefined-query"
import LoaderRadial from "../../components/loader-radial"
import { SubmitHandler } from "react-hook-form"
import { debounce } from "lodash"
import { useHistory } from "react-router"
import useUploadImage from "../../api/upload-image"
import { useMutationObserver } from "../../utils/mutationObserver"

const fieldNames = ["name", "username", "img"] as const
type FieldNames = TupleToUnion<typeof fieldNames>
export type EditProfileFormData = PickR<RawUserData, FieldNames>
export type EditProfileFormErrors = FormErrorObject<EditProfileFormData>

export default withUserID(() => {
  const { goBack } = useHistory()
  const { data: [serverValues] = [{}], loading } = useQuery(
    "user_profile",
    undefined
  )
  const {
    Form,
    register,
    setValue,
    reset,
    watch,
    setValidateErrorObject,
    formState: { isSubmitting }
  } = useAllRequiredForm<EditProfileFormData>()
  // const reset = useCallback(() => {
  //   Object.entries(defaultValues)
  //     .filter(([k]) => fieldNames.includes(k as FieldNames))
  //     .forEach(([k, v]: KVPair<EditProfileFormData>) => setValue(k, v))
  // }, [defaultValues])
  const resetToServerValues = debounce(() => {
    // console.log("reset")
    reset(serverValues)
  }, 100)
  useEffect(resetToServerValues, [serverValues])
  // const [handleSubmit, onSubmit$] = useObservableCallback<EditProfileFormData>(
  //   data => data
  // )
  // const { data, loading: submitting } = useQuery("edit_profile", onSubmit$, { retry: false })
  // useLog(data)
  const [uid] = useUserID()
  const handleSubmit: SubmitHandler<EditProfileFormData> = async data => {
    const res = await query("edit_profile", data, uid, false)
    if (Array.isArray(res)) goBack()
    else {
      if (typeof res === "string") alert(res)
      else setValidateErrorObject(res)
    }
  }

  const { ImageUploader, openImagePicker, upLoading } = useUploadImage(imgUrl =>
    setValue("img", imgUrl)
  )

  const imgRef = useMutationObserver(console.log, { attributes: true })

  return (
    <section id="page-edit-profile">
      {loading ? (
        <LoaderRadial />
      ) : (
        <>
          <Form id="form-edit-profile" handleSubmit={handleSubmit}>
            <InputMaterial {...register("name")} />
            <InputMaterial {...register("username")} />
            <input
              type="text"
              hidden
              {...register("img", { required: false })}
            />
          </Form>
          <div className="pfp" onClick={openImagePicker}>
            {upLoading ? (
              <LoaderRadial />
            ) : (
              <>
                <img src={watch("img")} alt="profile picture" className="pfp" ref={imgRef} />
                <div className="image-edit-tag">Edit</div>
              </>
            )}
          </div>
        </>
      )}
      <Toolbar classNames="grid2">
        <Button
          Type="outline black"
          onClick={resetToServerValues}
          disabled={isSubmitting || loading}
        >
          Reset
        </Button>
        <Button
          form="form-edit-profile"
          Type="primary"
          loading={isSubmitting}
          disabled={loading}
        >
          Save
        </Button>
      </Toolbar>
      <ImageUploader />
    </section>
  )
})
