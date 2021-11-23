;[
  "{{repeat(250)}}",
  {
    id: "{{index (1)}}",
    work_id: "{{integer(1,50)}}",
    lat: "{{floating(37.62964, 37.73521)}}",
    lng: "{{floating(-122.40675,-122.48936)}}",
    title: '{{lorem(2,"words")}}',
    description: '{{lorem(3,"sentences")}}',
    images(tags) {
      return JSON.stringify(
        Array(tags.integer(0, 5))
          .fill()
          .map(
            () =>
              `https://via.placeholder.com/${tags.random(
                200,
                300,
                400,
                500,
                600
              )}x400/`
          )
      )
    },
    // appeared_at(tags) {
    //   return JSON.stringify(
    //     Array(tags.integer(0, 5))
    //       .fill()
    //       .map(() => [
    //         tags.integer(1, 5),
    //         tags.integer(1, 13),
    //         tags.integer(0, 90),
    //         tags.integer(0, 59)
    //       ])
    //       .sort((a, b) => a.reduce((c, d, i) => (c == 0 ? d - b[i] : c), 0))
    //       .map(p => p.join(":"))
    //   )
    // },
    date_create:
      '{{date(new Date(2020, 0, 1), new Date(),"YYYY-MM-dd hh:mm:ss")}}'
  }
]
