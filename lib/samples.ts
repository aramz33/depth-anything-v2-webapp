export interface Sample {
  id: string
  label: string
  src: string
}

export const SAMPLES: Sample[] = [
  { id: "indoor", label: "Indoor", src: "/samples/indoor.jpg" },
  { id: "street", label: "Street", src: "/samples/street.jpg" },
  { id: "portrait", label: "Portrait", src: "/samples/portrait.jpg" },
  { id: "landscape", label: "Landscape", src: "/samples/landscape.jpg" },
  { id: "object", label: "Object", src: "/samples/object.jpg" },
  { id: "architecture", label: "Architecture", src: "/samples/architecture.jpg" },
]
