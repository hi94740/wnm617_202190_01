import "./style.less"
import Icon from "@mdi/react"
import {
  mdiAccount,
  mdiArrowLeft,
  mdiCloseCircle,
  mdiFormatListText,
  mdiMap
} from "@mdi/js"

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react"
import { createPortal } from "react-dom"
import { NavLink, useHistory, useLocation } from "react-router-dom"
import { useObservableCallback, useSubscription } from "observable-hooks"
import { debounceTime, tap } from "rxjs"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { useURLQuery } from "../utils/url-query"
import { classNames } from "../utils/classNames"
import { useHistoryObservable } from "../utils/history"

export const ToolbarContext = createContext({
  toolbarElement: null as HTMLDivElement,
  setToolbarElement: (element: HTMLDivElement) => {},
  modalElement: null as HTMLDivElement,
  setModalElement: (element: HTMLDivElement) => {}
})

const noBackPath = ["/map", "/works", "/user"]
const backQuery = ["activity", "work", "add"]

let goBackHandler: (() => void) | null = null
export const useGoBackHandler = (handler: () => void) =>
  useEffect(() => {
    if (goBackHandler) throw new Error("goBackHandler already defined!")
    goBackHandler = handler
    return () => (goBackHandler = null)
  }, [])

const NavIcon = (props: Parameters<typeof Icon>[0]) => {
  props = {
    size: "calc(var(--toolbar-height) / 2)",
    ...props
  }
  return (
    <div>
      <div>
        <Icon {...props} />
      </div>
      <div>
        <Icon {...props} />
      </div>
    </div>
  )
}

export default () => {
  const { goBack, location } = useHistory()
  const urlQuery = useURLQuery()

  const backable =
    !noBackPath.includes(location.pathname) ||
    backQuery.some(q => urlQuery.has(q))

  const [navActive, setNavActive] = useState(false)
  const [handleTapNav, tapNav] = useObservableCallback(o =>
    o.pipe(
      tap(() => setNavActive(true))
      // debounceTime(2800)
    )
  )
  useSubscription(tapNav /*, () => setNavActive(false)*/)

  const activeClassName = "selected"
  const navlinkProps: Partial<Parameters<NavLink>[0]> = {
    activeClassName,
    onClick: event => {
      if (
        (event.target as HTMLAnchorElement).classList.contains(activeClassName)
      ) {
        event.stopPropagation()
        setNavActive(false)
      }
    }
  }

  // useSubscription(
  //   useHistoryObservable(),
  //   ([{ location }]) =>
  //     !noBackPath.includes(location.pathname) ||
  //     (backQuery.some(q => new URLSearchParams(location.search).has(q)) &&
  //       setNavActive(false))
  // )
  useEffect(() => {
    if (backable) setNavActive(false)
  }, [backable])

  const toolbarRef = useCallback(
    useContext(ToolbarContext).setToolbarElement,
    []
  )
  const modalRef = useCallback(useContext(ToolbarContext).setModalElement, [])

  return (
    <>
      <div className="modal-container" ref={modalRef} />
      <footer>
        <div ref={toolbarRef} />
        <nav
          className={backable ? "back" : navActive ? "active" : ""}
          onClick={backable ? undefined : handleTapNav}
        >
          <TransitionGroup component={null}>
            <CSSTransition
              key={"nav-back-" + backable}
              classNames="fade"
              timeout={300}
            >
              {backable ? (
                <button onClick={() => (goBackHandler || goBack)()}>
                  <Icon
                    path={mdiArrowLeft}
                    size="calc(var(--toolbar-height) / 2)"
                  />
                </button>
              ) : (
                <>
                  <a
                    onClick={event => {
                      event.stopPropagation()
                      setNavActive(false)
                    }}
                  >
                    <NavIcon path={mdiCloseCircle} />
                  </a>
                  <NavLink to="/map" {...navlinkProps}>
                    <NavIcon path={mdiMap} />
                  </NavLink>
                  <NavLink to="/works" {...navlinkProps}>
                    <NavIcon path={mdiFormatListText} />
                  </NavLink>
                  <NavLink to="/user" {...navlinkProps}>
                    <NavIcon path={mdiAccount} />
                  </NavLink>
                </>
              )}
            </CSSTransition>
          </TransitionGroup>
        </nav>
      </footer>
    </>
  )
}

export const Toolbar = (props: { children: ReactNode; classNames?: any }) => {
  const { toolbarElement } = useContext(ToolbarContext)
  const [show, setShow] = useState(false)
  useEffect(() => {
    setTimeout(() => setShow(true))
  }, [])
  const classShow =
    useHistory().location.pathname === useLocation().pathname && show
      ? "show"
      : ""
  return toolbarElement
    ? createPortal(
        <div className={classNames("toolbar", classShow, props.classNames)}>
          {props.children}
        </div>,
        toolbarElement
      )
    : null
}

export const ToolbarModal = (props: { children: ReactNode; show: boolean }) => {
  const { modalElement } = useContext(ToolbarContext)
  return modalElement
    ? createPortal(
        <CSSTransition
          in={props.show}
          timeout={500}
          classNames="slide-up"
          mountOnEnter
          unmountOnExit
        >
          <div className="toolbar-modal">
            <div>{props.children}</div>
          </div>
        </CSSTransition>,
        modalElement
      )
    : null
}

export const ToolbarContextProvider = (props: { children: ReactNode }) => {
  const [toolbarElement, setToolbarElement] = useState(null as HTMLDivElement)
  const [modalElement, setModalElement] = useState(null as HTMLDivElement)
  return (
    <ToolbarContext.Provider
      value={{
        toolbarElement,
        setToolbarElement,
        modalElement,
        setModalElement
      }}
    >
      {props.children}
    </ToolbarContext.Provider>
  )
}
