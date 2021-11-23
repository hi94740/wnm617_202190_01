import "./style.less"
import Icon from "@mdi/react"
import {
  mdiAccount,
  mdiArrowLeft,
  mdiFormatListText,
  mdiMapMarker
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
import { NavLink, useHistory, Switch, Route } from "react-router-dom"
import { useObservableCallback, useSubscription } from "observable-hooks"
import { debounceTime, tap } from "rxjs"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { useURLQuery } from "../utils/url-query"

export const ToolbarContext = createContext({
  toolbarElement: null as HTMLDivElement,
  setToolbarElement: (element: HTMLDivElement) => {},
  modalElement: null as HTMLDivElement,
  setModalElement: (element: HTMLDivElement) => {}
})

const noBack = ["/map", "/works", "/user"]

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
    !noBack.includes(location.pathname) || urlQuery.has("activity")

  const [navActive, setNavActive] = useState(false)
  const [handleTapNav, tapNav] = useObservableCallback(o =>
    o.pipe(
      tap(() => setNavActive(true)),
      debounceTime(2800)
    )
  )
  useSubscription(tapNav, () => setNavActive(false))

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
          className={[navActive ? "active" : "", backable ? "back" : ""].join(
            " "
          )}
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
                  <NavLink to="/map" {...navlinkProps}>
                    <NavIcon path={mdiMapMarker} />
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

export const Toolbar = (props: { children: ReactNode }) => {
  const { toolbarElement } = useContext(ToolbarContext)
  return toolbarElement ? createPortal(props.children, toolbarElement) : null
}

export const ToolbarModal = (props: { children: ReactNode; show: boolean }) => {
  const { modalElement } = useContext(ToolbarContext)
  return modalElement
    ? createPortal(
        <CSSTransition
          in={props.show}
          timeout={300}
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
