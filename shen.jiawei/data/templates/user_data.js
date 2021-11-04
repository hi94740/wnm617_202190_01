;[
  "{{repeat(10)}}",
  {
    id: "{{index (1)}}",
    name: "{{firstName()}} {{surname()}}",
    username() {
      return "user" + this.id
    },
    // email: function () {
    //   return this.username + "@gmail.com"
    // },
    password: 'md5("pass")',
    img(tags) {
      return (
        "https://via.placeholder.com/400/" +
        tags.integer(7, 999) +
        "/fff/?text=" +
        this.username
      )
    },
    date_create:
      '{{date (new Date(2020, 0, 1), new Date(),"YYYY-MM-dd hh:mm:ss")}}'
  }
]
