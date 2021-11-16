import "./style.less"

import React, { useRef } from "react"
import ActivityPage from "../activity"
import { Route, useLocation } from "react-router"
import { usePageScrollAnimation } from "../../utils/scroll"
import { Toolbar } from "../../bottom-bar"
import FloatButton from "../../components/float-button"
import { Map as GoogleMap, Marker, Overlay } from "rgm"
import { PickR } from "../../utils/types"
import ActivityData from "../../api/data-tables/ActivityData"
import { useQuery } from "../../api/predefined-query"
import Icon from "@mdi/react"
import { mdiMapMarker } from "@mdi/js"

const ActivityMarker = (a: PickR<ActivityData, "id" | "lat" | "lng">) => (
  <Marker {...a}>
    <div>
      <Icon path={mdiMapMarker} />
    </div>
  </Marker>
)

export default () => {
  const location = useLocation()

  const mapContainer = useRef(null as HTMLDivElement)
  usePageScrollAnimation(scroll =>
    mapContainer.current.style.setProperty("--scroll", scroll + "px")
  )

  const isActivityPage = location.search == "?activity"

  const { data } = useQuery("one_most_recent_activity_of_each_work", undefined)

  return (
    <section id="page-map">
      <div
        ref={mapContainer}
        style={{
          height: isActivityPage
            ? "calc(100vh - 2 * (var(--toolbar-height) + var(--toolbar-margin)))"
            : "100vh"
        }}
      >
        <GoogleMap
          api={google.maps}
          options={{
            center: { lat: 37.70655, lng: -122.48498 },
            zoom: 11,
            disableDefaultUI: true,
            mapTypeControl: true
          }}
        >
          <Overlay>
            {data?.map(
              a =>
                (
                  <ActivityMarker
                    key={"activity-marker-" + a.id}
                    {...a}
                  ></ActivityMarker>
                ) || null
            )}
          </Overlay>
        </GoogleMap>
      </div>
      {isActivityPage ? <ActivityPage /> : <FloatButton />}
      <Toolbar>
        <input type="text" placeholder="Search & Filters" />
      </Toolbar>
    </section>
  )
}
