import "./style.less"

import React, { useRef } from "react"
import ActivityPage from "../activity"
import {
  usePageScrollAnimation,
  usePreventPageHorizontalScrolling
} from "../../utils/scroll"
import { Toolbar } from "../../bottom-bar"
import FloatButton from "../../components/float-button"
import { Map as GoogleMap, Marker, Overlay } from "rgm"
import { PickR } from "../../utils/types"
import ActivityData from "../../api/data-tables/ActivityData"
import { useQuery } from "../../api/predefined-query"
import Icon from "@mdi/react"
import { mdiMapMarker } from "@mdi/js"
import { useURLQuery } from "../../utils/url-query"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { withUserID } from "../../storage"
// import { GoogleMap, Marker } from "react-google-maps"
// import withGoogleMap from "react-google-maps/lib/withGoogleMap"

const ActivityMarker = (a: PickR<ActivityData, "id" | "lat" | "lng">) => {
  const urlQuery = useURLQuery()
  return (
    <Marker {...a}>
      <div
        className="marker-container"
        onClick={() =>
          urlQuery[urlQuery.has("activity") ? "set" : "append"](
            "activity",
            a.id.toString()
          )
        }
      >
        <Icon path={mdiMapMarker} />
      </div>
    </Marker>
  )
}

export default withUserID(() => {
  const urlQuery = useURLQuery()
  const isActivityPage = urlQuery.has("activity")

  const mapContainer = useRef(null as HTMLDivElement)
  usePageScrollAnimation(scroll =>
    mapContainer.current.style.setProperty("--scroll", scroll + "px")
  )
  usePreventPageHorizontalScrolling()

  const { data, loading } = useQuery(
    "one_most_recent_activity_of_each_work",
    undefined
  )

  return (
    <section id="page-map">
      <div
        ref={mapContainer}
        style={{
          height: isActivityPage
            ? "calc(90vh - 2 * (var(--toolbar-height) + var(--toolbar-margin)))"
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
        {/* {React.createElement(
          withGoogleMap(() => (
            <GoogleMap defaultCenter={{ lat: 37.70655, lng: -122.48498 }}>
              {data?.map(
                a =>
                  <Marker key={"activity-marker-" + a.id} {...a}></Marker> ||
                  null
              )}
            </GoogleMap>
          )),
          {
            mapElement: <div style={{height: "100%"}} />,
            containerElement: <div style={{height: "100%"}} />
          }
        )} */}
      </div>
      <TransitionGroup component={null}>
        <CSSTransition
          classNames="slide-up"
          timeout={500}
          key={"isActivityPage-" + isActivityPage}
        >
          {isActivityPage ? <ActivityPage /> : <FloatButton />}
        </CSSTransition>
      </TransitionGroup>
      <Toolbar>
        <input type="text" placeholder="Search & Filters" />
      </Toolbar>
      <CSSTransition in={loading} classNames="fade" timeout={300}>
        <div className="progress">
          <div className="indeterminate" />
        </div>
      </CSSTransition>
    </section>
  )
})
