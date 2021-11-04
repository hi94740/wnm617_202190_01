;[
  "{{repeat(50)}}",
  {
    id: "{{index(1)}}",
    user_id: "{{integer(1, 10)}}",
    name: "{{company()}}",
    type: '{{random("single", "series")}}',
    tags(tags) {
      return [
        ...new Set(
          Array(tags.integer(0, 6))
            .fill()
            .map(() =>
              tags.random(
                "Anime",
                "Drama",
                "Love",
                "Sci-Fi",
                "Thriller",
                "Action"
              )
            )
            .sort()
        )
      ].join(",")
    },
    img(tags) {
      return (
        "https://via.placeholder.com/360x510/" +
        tags.integer(700, 999) +
        "/fff/?text=" +
        this.name
      )
    },
    date_create:
      '{{date(new Date(2020, 0, 1), new Date(), "YYYY-MM-dd hh:mm:ss")}}'
  }
]
