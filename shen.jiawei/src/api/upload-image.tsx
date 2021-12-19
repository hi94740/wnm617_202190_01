import React, { useReducer, useRef } from "react"
import { useStepCounter } from "../utils/counter"

const useUploadImage = (setImgUrl: (imgUrl: string) => void) => {
  const ref = useRef(null as HTMLInputElement)
  // const [imgUrl, setImgUrl] = useState(null as string)
  const [upLoading, loadingCount] = useStepCounter()
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async ({
    currentTarget: {
      files: [image]
    }
  }) => {
    if (image) {
      loadingCount("up")
      const body = new FormData()
      body.append("image", image)
      ref.current.value = null
      const res: {
        error?: string
        url?: string
      } = await (
        await fetch("php/upload-image.php", {
          method: "POST",
          body
        })
      ).json()
      loadingCount("down")
      if (res.url) setImgUrl(res.url)
      else throw new Error(res.error)
    }
  }
  const ImageUploader = 
    (
      props: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >
    ) => (
      <input
        type="file"
        name="image"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleChange}
        hidden
        ref={ref}
        {...props}
      />
    )
  return {
    ImageUploader,
    openImagePicker: () => ref.current?.click?.(),
    upLoading
  }
}

export default useUploadImage
