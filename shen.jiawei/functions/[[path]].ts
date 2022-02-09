export const onRequest: PagesFunction = ({request}) => {
  const url = new URL(request.url)
  url.host = "php-projects.azurewebsites.net"
  url.port = ""
  url.pathname = "/seichijunrei" + url.pathname
  url.protocol = "https"
  console.log(url.toString())
  return fetch(url.toString(), request)
}
