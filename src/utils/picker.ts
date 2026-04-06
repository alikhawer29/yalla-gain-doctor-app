import { launchCamera, launchImageLibrary } from "react-native-image-picker"

export const openImageGallery = async (onSelect) => {

  return launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    // Helps some devices re-open the picker and return a fresh asset on re-selection
    includeExtra: true,
  })
    .then(async (photo) => {

      let image = photo?.assets?.[0]
      let data = null

      if (image) {
        data = {
          ...image,
          name: image?.fileName,
          type: image?.type,
          uri: image?.uri
        }
      }

      onSelect(data)

      return data

    })
    .catch((err) => {
      console.log(err)
    })
}

export const openImageCamera = (onSelect) => {
  launchCamera({
    mediaType: 'photo',
  })
    .then((photo) => {

      let image = photo?.assets?.[0]
      let data = null

      if (image) {
        data = {
          ...image,
          name: image?.fileName,
          type: image?.type,
          uri: image?.uri
        }
      }

      onSelect(data)

    })
    .catch((err) => {
      console.log(err)
    })
}