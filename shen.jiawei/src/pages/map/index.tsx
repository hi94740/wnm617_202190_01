import "./style.less"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import ActivityPage from "../activity"
import {
  usePageScrollAnimation,
  usePreventPageHorizontalScrolling
} from "../../utils/scroll"
import { Toolbar } from "../../bottom-bar"
import FloatButton from "../../components/float-button"
import { Map as GoogleMap, Marker, Overlay, useMap } from "rgm"
import { PickR } from "../../utils/types"
import ActivityData from "../../api/data-tables/ActivityData"
import { query, useQuery } from "../../api/predefined-query"
import Icon from "@mdi/react"
import { mdiMapMarker, mdiMapMarkerCheck, mdiMapMarkerRadius } from "@mdi/js"
import { useURLQuery, useURLQueryObservable } from "../../utils/url-query"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { useUserID, withUserID } from "../../storage"
import { ActivityRangeByWorkData } from "../../api/data-tables/variations/activity_range_by_work"
import { useObservable, useObservableState } from "observable-hooks"
import { filter, map, tap } from "rxjs"
import { WorkID } from "../../api/ids"
import Button from "../../components/button"
import { ActivityCount, WorkTypeTag } from "../work/components/work-info"
import { classNames } from "../../utils/classNames"
import { useHistory } from "react-router-dom"
// import { GoogleMap, Marker } from "react-google-maps"
// import withGoogleMap from "react-google-maps/lib/withGoogleMap"
type UseMapReturnType = { map: google.maps.Map; api: typeof google.maps }
import Color from "color"

const DisplayedCoordsContext = createContext(
  new Set<google.maps.LatLng | google.maps.LatLngLiteral>()
)

const useRegisterDisplayedCoords = (
  ...args: Array<google.maps.LatLng | google.maps.LatLngLiteral>
) => {
  const displayedCoords = useContext(DisplayedCoordsContext)
  useEffect(() => {
    args.forEach(c => displayedCoords.add(c))
    return () => args.forEach(c => displayedCoords.delete(c))
  }, [])
}

export type ActivityMarkerData = PickR<ActivityData, "lat" | "lng"> &
  Pick<ActivityData, "id">
const ActivityMarker = (a: ActivityMarkerData) => {
  useRegisterDisplayedCoords(a)
  const urlQuery = useURLQuery()
  const { map }: UseMapReturnType = useMap()
  return (
    <Marker {...a}>
      <div
        className={classNames(
          "marker-container",
          (urlQuery.get("activity") === a.id?.toString?.()) && "selected",
          !a.id && "add"
        )}
        onClick={() => {
          a.id &&
            urlQuery[urlQuery.has("activity") ? "set" : "append"](
              "activity",
              a.id.toString()
            )
          map.setCenter(a)
        }}
      >
        <Icon path={a.id ? mdiMapMarker : mdiMapMarkerCheck} />
      </div>
    </Marker>
  )
}

const WorkWithActivityRange = (w: ActivityRangeByWorkData) => {
  const { map, api }: UseMapReturnType = useMap()
  const boundingCoords = useMemo(
    () =>
      [
        new api.LatLng(w.lat_min, w.lng_min),
        new api.LatLng(w.lat_max, w.lng_max)
      ] as const,
    []
  )
  useRegisterDisplayedCoords(w)
  const radius = useMemo(
    () => api.geometry.spherical.computeDistanceBetween(...boundingCoords) / 2,
    []
  )
  const circle = useRef(null as google.maps.Circle)
  const lines = useRef([] as Array<google.maps.Polyline>)
  const getShapes = () => [circle.current, ...lines.current]
  useEffect(() => {
    const stroke = {
      strokeColor: "rgba(0,0,0,0)",
      strokeOpacity: 0.8,
      strokeWeight: 2
    }
    circle.current = new api.Circle({
      map,
      ...stroke,
      fillColor: "rgba(0,0,0,0)",
      fillOpacity: 0.1,
      center: w,
      radius
    })
    const rand = Math.random()
    lines.current = [60, 180, 300].map(
      (heading: number) =>
        new api.Polyline({
          map,
          ...stroke,
          strokeOpacity: 0.33,
          // icons: [
          //   {
          //     icon: {
          //       path: "M 0,-2 0,2",
          //       strokeOpacity: 1,
          //       scale: 2
          //     },
          //     offset: "0",
          //     repeat: "20px"
          //   }
          // ],
          path: [
            w,
            api.geometry.spherical.computeOffset(
              new api.LatLng(w),
              radius,
              heading + 120 * (rand - 0.5)
            )
          ]
        })
    )
    return () => getShapes().forEach(s => s.setMap(null))
  }, [])
  const urlQuery = useURLQuery()
  return (
    <Marker {...w}>
      <img
        className="work-with-activity-range"
        onClick={() => {
          urlQuery.append("work", w.id.toString())
          map.setCenter(w)
        }}
        src={w.img || "https://via.placeholder.com/1/FFF"}
        onLoad={({ target }) => {
          let color = Color("rgba(0,0,0,0)")
          if (w.img.startsWith("https://via.placeholder.com/")) {
            color =
              Color("#" +
              /^https:\/\/via.placeholder.com\/[^/]*\/([0-9|a-f]+)\//.exec(
                w.img
              )[1])
          } else {
            const canvas = document.createElement("canvas")
            canvas.width = canvas.height = 1
            const ctx = canvas.getContext("2d")
            ctx.drawImage(target as HTMLImageElement, 0, 0, 1, 1)
            color = Color.rgb(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
          }
          const colorStr = color.lightness(50).saturationl(100).hex()
          getShapes().forEach(s =>
            s.setOptions({
              strokeColor: colorStr,
              fillColor: colorStr
            })
          )
        }}
      />
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

  // const { data, loading } = useQuery(
  //   "one_most_recent_activity_of_each_work",
  //   undefined
  // )
  const {
    data: works,
    loading: loadingWorks,
    refresh: refreshWorks
  } = useQuery("activity_range_by_work", undefined)
  const [rawWorkID$] = useURLQueryObservable("work")
  const workID$ = useObservable(() =>
    rawWorkID$.pipe(map(id => parseInt(id) as WorkID))
  )
  const {
    data: activities,
    loading: loadingActivities,
    refresh: refreshActivities
  } = useQuery(
    "acitivity_markers_of_work",
    useObservable(() => workID$.pipe(filter(id => !!id)))
  )
  const workID = useObservableState(workID$)
  const loading = loadingWorks || loadingActivities

  const w = workID ? works?.find(w => w.id === workID) : null

  const api = google.maps
  const mapRef = useRef(null as google.maps.Map)

  const displayedCoordsRef = useRef(
    new Set<google.maps.LatLng | google.maps.LatLngLiteral>()
  )
  const fitData = () => {
    const bounds = new api.LatLngBounds()
    displayedCoordsRef.current.forEach(c => bounds.extend(c))
    mapRef.current.fitBounds(bounds, {
      top: 200,
      bottom: 200,
      left: 30,
      right: 30
    })
  }
  const centerActivity = () =>
    mapRef.current?.setCenter(
      activities.find(a => a.id === parseInt(urlQuery.get("activity")))
    )
  useEffect(() => {
    if (isActivityPage && activities) centerActivity()
    else if (
      !loading &&
      displayedCoordsRef.current.size > 0 &&
      !urlQuery.get("add")
    )
      fitData()
  }, [loading])

  const [addActivity$] = useURLQueryObservable("add")
  const addActivityRef = useRef(null as string)
  const [addCoord, setAddCoord] = useState(null as google.maps.LatLngLiteral)
  const setAddCoordToCenter = () => {
    if (mapRef.current) {
      const latLng = mapRef.current.getCenter()
      setAddCoord({
        lat: latLng.lat(),
        lng: latLng.lng()
      })
    }
  }
  const [addActivity] = useObservableState(() =>
    addActivity$.pipe(
      tap(add => {
        addActivityRef.current = add
        setAddCoordToCenter()
      })
    )
  )
  useEffect(() => {
    const intID = setInterval(() => {
      if (mapRef.current) {
        clearInterval(intID)
        setAddCoordToCenter()
        mapRef.current.addListener(
          "click",
          ({ latLng }: { latLng: google.maps.LatLng }) => {
            if (addActivityRef.current) {
              mapRef.current.setCenter(latLng)
              setAddCoord({
                lat: latLng.lat(),
                lng: latLng.lng()
              })
            }
          }
        )
      }
    })
  }, [])

  const [isSubmitting, setSubmitting] = useState(false)
  const [uid] = useUserID()
  const history = useHistory()
  const submit = async () => {
    setSubmitting(true)
    const res = await query(
      "add_activity",
      {
        lat: addCoord.lat.toString(),
        lng: addCoord.lng.toString(),
        work_id: workID
      },
      uid,
      false
    )
    setSubmitting(false)
    history.goBack()
    if (typeof res === "number") {
      refreshActivities()
      refreshWorks()
      setTimeout(() => history.push(`/map?work=${workID}&activity=${res}`))
    } else if (typeof res === "string") alert(res)
    else {
      console.error(res)
      alert("Unknown error!")
    }
  }

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
        <DisplayedCoordsContext.Provider value={displayedCoordsRef.current}>
          <GoogleMap
            api={api}
            ref={mapRef}
            options={{
              center: { lat: 37.70655, lng: -122.48498 },
              zoom: 11,
              disableDefaultUI: true,
              mapTypeControl: true,
              styles: [
                {
                  featureType: "poi",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            <Overlay>
              {/* {data?.map(
              a =>
                (
                  <ActivityMarker
                    key={"activity-marker-" + a.id}
                    {...a}
                  ></ActivityMarker>
                ) || null
            )} */}
              {addActivity ? (
                addCoord ? (
                  <ActivityMarker
                    {...addCoord}
                    key={"newActivity" + addCoord.lat + addCoord.lng}
                  />
                ) : null
              ) : workID ? (
                loadingActivities ? (
                  w ? (
                    <WorkWithActivityRange
                      {...w}
                      key={"WorkWithActivityRange-" + w.id}
                    />
                  ) : null
                ) : (
                  activities.map(a => (
                    <ActivityMarker
                      key={"activity-marker-" + a.id}
                      {...a}
                    ></ActivityMarker>
                  ))
                )
              ) : (
                works
                  ?.filter(w => w.lat && w.lng)
                  ?.map(w => (
                    <WorkWithActivityRange
                      {...w}
                      key={"WorkWithActivityRange-" + w.id}
                    />
                  ))
              )}
            </Overlay>
          </GoogleMap>
        </DisplayedCoordsContext.Provider>
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
        {isActivityPage ? (
          <CSSTransition
            classNames="slide-up"
            timeout={500}
            key="isActivityPage"
          >
            <ActivityPage />
          </CSSTransition>
        ) : workID && !addActivity ? (
          <CSSTransition
            classNames="slide-up"
            timeout={500}
            key="canAddActivity"
          >
            <FloatButton onClick={() => urlQuery.append("add", "activity")} />
          </CSSTransition>
        ) : null}
      </TransitionGroup>
      {addActivity ? (
        <Toolbar classNames="map">
          <Button
            Type="outline black"
            loading={isSubmitting}
            // disabled={loading}
            onClick={submit}
            style={{ flexGrow: 1 }}
          >
            {w ? (
              <>
                <div style={{ flexShrink: 0 }}>Add to</div>
                <WorkTypeTag type={w.type} name={w.name} showName />
              </>
            ) : (
              "Loading..."
            )}
          </Button>
        </Toolbar>
      ) : (
        <Toolbar classNames="map">
          {
            <Button
              onClick={isActivityPage ? centerActivity : fitData}
              style={{ flexGrow: 1 }}
            >
              {isActivityPage ? (
                <>
                  <Icon path={mdiMapMarker} />
                  <div>Tap to center on map</div>
                </>
              ) : w ? (
                <>
                  <WorkTypeTag type={w.type} name={w.name} showName />
                  <div>/</div>
                  <ActivityCount
                    activity_count={
                      loadingActivities ? null : activities.length
                    }
                  />
                </>
              ) : (
                <>
                  <Icon path={mdiMapMarkerRadius} />
                  <div>Activity Range by Work</div>
                </>
              )}
            </Button>
          }
        </Toolbar>
      )}
      <CSSTransition in={loading} classNames="fade" timeout={300}>
        <div className="progress">
          <div className="indeterminate" />
        </div>
      </CSSTransition>
    </section>
  )
})
