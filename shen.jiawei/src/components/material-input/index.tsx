import "./style.less"

import React from "react"

const InputMaterial = ({
  label = "",
  ...props
}: { label?: string } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => (
  <div className="material-input">
    <input type="text" placeholder=" " {...props} />
    <label>{label}</label>
  </div>
)

export default InputMaterial
