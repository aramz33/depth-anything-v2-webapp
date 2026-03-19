export interface Sample {
  id: string;
  label: string;
  src: string;
}

export const SAMPLES: Sample[] = [
  { id: "indoor", label: "Indoor", src: "/samples/indoor.jpg" },
  { id: "street", label: "Street", src: "/samples/street.jpg" },
  { id: "portrait", label: "Portrait", src: "/samples/portrait.jpg" },
  { id: "landscape", label: "Landscape", src: "/samples/landscape.jpg" },
  { id: "object", label: "Object", src: "/samples/object.jpg" },
  { id: "street1", label: "Street 1", src: "/samples/street1.png" },
  { id: "street2", label: "Street 2", src: "/samples/street2.png" },
  { id: "interieur1", label: "Intérieur 1", src: "/samples/interieur1.png" },
  { id: "interieur2", label: "Intérieur 2", src: "/samples/interieur2.png" },
];
