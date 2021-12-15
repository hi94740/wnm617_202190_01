import "./style.less"

import {
  mdiClockTimeFour,
  mdiMapMarkerMultiple,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
  mdiSortAlphabeticalVariant,
  mdiSortClockAscendingOutline,
  mdiSortClockDescendingOutline,
  mdiSortNumericAscending,
  mdiSortNumericDescending
} from "@mdi/js"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Toolbar, ToolbarModal } from "../../bottom-bar"
import { WorkInfo } from "../work/components/work-info"
import { ModalButton } from "../../components/float-button"
import AddWork from "./add-work"
import WorkData, { RawWorkData } from "../../api/data-tables/WorkData"
import { PickR } from "../../utils/types"
import {
  createQueryParameter,
  SQLOrderByDirection,
  useQuery
} from "../../api/predefined-query"
import { ActivityCountData } from "../../api/data-tables/variations/work-data-with-activity-count"
import { withUserID } from "../../storage"
import WorkTags from "../work/components/tags"
import Button from "../../components/button"
import LoaderRadial from "../../components/loader-radial"
import {
  SelectButtonList,
  SelectButtonListObject
} from "../../components/select-button"
import {
  useClearURLQueryOnUnmout,
  useURLQueryObservable
} from "../../utils/url-query"
import {
  useObservable,
  useObservableState,
  useSubscription
} from "observable-hooks"
import { useFirstRender } from "../../utils/hooks"
import { combineLatest, debounceTime, filter, firstValueFrom, map } from "rxjs"

const Card = (
  w: PickR<WorkData, "id" | "img" | "name" | "type" | "tags"> &
    ActivityCountData
) => (
  <Link to={"/work/" + w.id}>
    <div className="card-work">
      <img src={w.img || "https://via.placeholder.com/360x510?text=Add"} />
      <div>
        <h2>{w.name}</h2>
        <WorkTags {...w} />
        <WorkInfo {...w} />
      </div>
    </div>
  </Link>
)

type SortOptionName = "name" | "date_create" | "activity_count"
type SortDirection = SQLOrderByDirection
type SortOptionConfig = SelectButtonListObject<
  SortOptionName,
  {
    directions: SelectButtonListObject<SortDirection>
    defaultAsc?: boolean
  }
>

const sortOptions: SortOptionConfig = {
  name: {
    icon: mdiSortAlphabeticalVariant,
    directions: {
      ASC: { icon: mdiSortAlphabeticalAscending, children: "A - Z" },
      DESC: { icon: mdiSortAlphabeticalDescending, children: "Z - A" }
    },
    defaultAsc: true
  },
  date_create: {
    icon: mdiClockTimeFour,
    directions: {
      DESC: { icon: mdiSortClockAscendingOutline, children: "Latest" },
      ASC: { icon: mdiSortClockDescendingOutline, children: "Oldest" }
    }
  },
  activity_count: {
    icon: mdiMapMarkerMultiple,
    directions: {
      DESC: { icon: mdiSortNumericDescending, children: "Most activities" },
      ASC: { icon: mdiSortNumericAscending, children: "Least activities" }
    }
  }
}

export default withUserID(() => {
  const firstRender = useFirstRender()

  useClearURLQueryOnUnmout()
  const [showAddWorkModal, setShowAddWorkModal] = useState(false)
  const [showToolbarModal, setShowToolbarModal] = useState(false)
  const [sortOptionName$, setSortOption] = useURLQueryObservable<
    SortOptionName
  >("sort", "name")
  const sortOptionName = useObservableState(sortOptionName$, "name")
  const sortOption = sortOptions[sortOptionName]
  const [sortDirection$, setSortDirection] = useURLQueryObservable<
    SortDirection
  >("by", "ASC")
  const sortDirection = useObservableState(sortDirection$, "ASC")
  const [search$, setSearch] = useURLQueryObservable("search")
  const search = useObservableState(search$)
  useEffect(() => {
    if (!firstRender) setSortDirection(sortOption.defaultAsc ? "ASC" : "DESC")
  }, [sortOption])

  const searchRef = useCallback(
    async (s: HTMLInputElement) =>
      (s.value = await firstValueFrom(search$.pipe(filter(s => !!s)))),
    []
  )

  const queryParams$ = useObservable(() =>
    combineLatest([search$, sortOptionName$, sortDirection$]).pipe(
      debounceTime(0),
      map(([search, ...s]) =>
        createQueryParameter("works", [
          {
            ...(search
              ? {
                  where: [
                    ["LIKE", ["name", search]],
                    "OR",
                    ["LIKE", ["tags", new Set<any>([search])]]
                  ]
                }
              : {}),
            orderBy:
              s[0] === "activity_count"
                ? undefined
                : [s as [keyof RawWorkData, SQLOrderByDirection]]
          },
          {
            orderBy:
              s[0] === "activity_count"
                ? [s as ["activity_count", SQLOrderByDirection]]
                : undefined
          }
        ])
      )
    )
  )
  const { data, loading } = useQuery("works", queryParams$)

  return (
    <section id="page-works">
      {data?.length === 0 ? (
        <p>Add some stuff!</p>
      ) : loading ? (
        <LoaderRadial />
      ) : (
        data?.map(work => <Card key={"work-card-" + work.id} {...work} />)
      )}
      <ModalButton show={showAddWorkModal} setShow={setShowAddWorkModal}>
        <AddWork show={showAddWorkModal} setShow={setShowAddWorkModal} />
      </ModalButton>
      <Toolbar>
        <form
          onSubmit={e => {
            e.preventDefault()
            setSearch(
              (Object.fromEntries([
                ...new FormData(e.target as HTMLFormElement)
              ]) as {
                search: string
              }).search
            )
          }}
        >
          <input
            type="search"
            name="search"
            placeholder="Search works..."
            onChange={({ target }) => !target.value && setSearch(null)}
            ref={searchRef}
          />
        </form>
        <Button
          icon={sortOption.directions[sortDirection].icon}
          onClick={() => setShowToolbarModal(!showToolbarModal)}
          active={showToolbarModal}
        />
        <ToolbarModal show={showToolbarModal}>
          <div className="button-list">
            <SelectButtonList
              buttons={sortOption.directions}
              selected={sortDirection}
              onClick={setSortDirection}
              pushIcon
            />
          </div>
          <div className="horizontal-scroll-section">
            <SelectButtonList
              buttons={sortOptions}
              selected={sortOptionName}
              onClick={setSortOption}
              outline
            />
          </div>
        </ToolbarModal>
      </Toolbar>
      <div className="bottom-spacer-with-float-button" />
    </section>
  )
})
