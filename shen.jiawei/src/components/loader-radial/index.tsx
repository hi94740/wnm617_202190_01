import React from "react"

const LoaderRadial = () => (
  <div className="center-container" style={{ height: "100vh" }}>
    <div className="preloader-wrapper active">
      <div className="spinner-layer only">
        <div className="circle-clipper left">
          <div className="circle"></div>
        </div>
        <div className="gap-patch">
          <div className="circle"></div>
        </div>
        <div className="circle-clipper right">
          <div className="circle"></div>
        </div>
      </div>
    </div>
  </div>
)

export default LoaderRadial
