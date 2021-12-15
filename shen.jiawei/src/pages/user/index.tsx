import "./style.less"

import React, { useState } from "react"
import { useHistory } from "react-router"
import { Toolbar, ToolbarModal } from "../../bottom-bar"
import { useUserID, withUserID } from "../../storage"
import Icon from "@mdi/react"
import {
  mdiAccountCircleOutline,
  mdiAccountEdit,
  mdiDotsVertical,
  mdiLogout
} from "@mdi/js"
import { useQuery } from "../../api/predefined-query"
import Button from "../../components/button"

export default withUserID(() => {
  const [showMenu, setShowMenu] = useState(false)

  const { push } = useHistory()
  const [, setUserID] = useUserID()
  const logout = () => {
    setUserID(null)
    setTimeout(() => push("/"))
  }

  const { data: [u] = [null] } = useQuery("user_profile", undefined)

  return (
    <section id="page-user">
      {u ? (
        <img src={u.img} alt="profile picture" className="pfp" />
      ) : (
        <Icon path={mdiAccountCircleOutline} />
      )}
      <h1>{u ? u.name : "Loading..."}</h1>
      <p>{u ? "@" + u.username : ""}</p>
      <Toolbar>
        <Button
          icon={mdiAccountEdit}
          style={{ flexGrow: 1 }}
          Type="outline black"
          onClick={() => push("/edit-profile")}
        >
          Edit
        </Button>
        <Button icon={mdiDotsVertical} onClick={() => setShowMenu(!showMenu)} />
        <ToolbarModal show={showMenu}>
          <div className="button-list">
            <Button icon={mdiLogout} onClick={logout}>
              Log Out
            </Button>
          </div>
        </ToolbarModal>
      </Toolbar>
    </section>
  )
})
