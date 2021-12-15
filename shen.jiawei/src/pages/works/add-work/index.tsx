import "./style.less"

import React, { useEffect, useReducer, useState } from "react"
import WorkData, { RawWorkData } from "../../../api/data-tables/WorkData"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import WorkTypeFormPage from "./form-pages/type"
import Button from "../../../components/button"
import { mdiCheck, mdiChevronLeft, mdiChevronRight } from "@mdi/js"
import WorkNameFormPage from "./form-pages/name"
import { view, store, autoEffect } from "@risingstack/react-easy-state"
import type { PickR } from "../../../utils/types"
import WorkTagsFormPage from "./form-pages/tags"
import { WorkTypeTag } from "../../work/components/work-info"
import { query } from "../../../api/predefined-query"
import { useHistory } from "react-router"
import { useUserID } from "../../../storage"

type AddWorkFormData = Pick<WorkData, "type" | "name"> &
  PickR<WorkData, "tags" | "toRawData">

type AddWorkFormPage = (props: {
  formData: AddWorkFormData
  submit?: () => void
}) => React.ReactElement

export interface FormPageConfig {
  FormPage: AddWorkFormPage
  validate: (formData: AddWorkFormData) => boolean
  skipable?: boolean
}

const formPages: FormPageConfig[] = [
  WorkTypeFormPage,
  WorkNameFormPage,
  WorkTagsFormPage
]
const maxPage = formPages.length - 1

const formStore = store({
  formData: new WorkData() as AddWorkFormData
})
const createAddWorkFormData = () => {
  const w = new WorkData() as AddWorkFormData
  w.tags = new Set()
  return w
}

export default view(
  ({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) => {
    // const forceUpdate = useForceUpdate()

    const [lastPageChange, changePageNumberBy] = useState(0)
    const addPageNumber = (a: number = 1) => {
      changePageNumberBy(0)
      setTimeout(() => changePageNumberBy(a))
    }
    const [pageNumber, dispatchPageNumberChange] = useReducer(
      (n: number, a: number) => {
        let pageNumber = n + a
        if (pageNumber < 0) pageNumber = 0
        if (pageNumber > maxPage) pageNumber = maxPage
        return pageNumber
      },
      0
    )
    useEffect(() => dispatchPageNumberChange(lastPageChange), [lastPageChange])
    const { FormPage, skipable, validate } = formPages[pageNumber]
    const [readyToGoNext, setReadyToGoNext] = useState(false)
    // const [formData, setFormData] = use2WayBinding(
    //   createAddWorkFormData(),
    //   useCallback(target => setReadyToGoNext(validate(target)), [validate])
    // )
    const { formData } = formStore
    autoEffect(
      () => setReadyToGoNext(validate(formStore.formData)),
      [pageNumber]
    )
    // useEffect(() => setReadyToGoNext(validate(formData)), [pageNumber])
    useEffect(() => {
      if (show) {
        // setFormData(createAddWorkFormData())
        formStore.formData = createAddWorkFormData()
        setReadyToGoNext(false)
        addPageNumber(-formPages.length)
        setLoading(false)
        // forceUpdate()
      }
    }, [show])
    const done = pageNumber === maxPage

    const [loading, setLoading] = useState(false)
    const { push } = useHistory()
    const [uid] = useUserID()

    const nextHandler = async () => {
      if (!done) addPageNumber()
      else {
        setLoading(true)
        const newWorkId = await query(
          "add_work",
          formData.toRawData() as PickR<RawWorkData, "name" | "type" | "tags">,
          uid,
          false
        )
        push("/edit-work/" + newWorkId)
      }
    }

    return (
      <TransitionGroup component={null}>
        <CSSTransition
          classNames={lastPageChange < 0 ? "slide-right" : "slide-left"}
          timeout={500}
          key={"AddWorkFormPage" + pageNumber}
        >
          <div>
            <FormPage formData={formData} submit={nextHandler} />
            <div className="button-bar">
              {pageNumber === 0 ? (
                <Button onClick={() => setShow(false)}>Cancel</Button>
              ) : (
                <Button
                  icon={mdiChevronLeft}
                  onClick={() => {
                    addPageNumber(-1)
                  }}
                >
                  Back
                </Button>
              )}
              {skipable && !readyToGoNext ? (
                <Button Type="outline" onClick={nextHandler} loading={loading}>
                  Skip
                </Button>
              ) : (
                <Button
                  iconRight={done ? mdiCheck : mdiChevronRight}
                  Type="primary"
                  disabled={!readyToGoNext}
                  onClick={nextHandler}
                  loading={loading}
                >
                  {done ? "Done" : "Next"}
                </Button>
              )}
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    )
  }
)

export const GenericHeading = (w: Pick<WorkData, "name" | "type">) => (
  <h3 className="work-form-generic-heading">
    Adding <WorkTypeTag {...w} showName />
  </h3>
)
