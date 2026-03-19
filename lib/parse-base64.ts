type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export function parseBase64(raw: string): { mediaType: ImageMediaType; data: string } {
  const [mimeTypePart, data] = raw.includes(",")
    ? (raw.split(",") as [string, string])
    : ["data:image/jpeg;base64", raw];

  const mediaType = mimeTypePart
    .replace("data:", "")
    .replace(";base64", "") as ImageMediaType;

  return { mediaType, data };
}

export function toDataUri(raw: string): string {
  const { mediaType, data } = parseBase64(raw);
  return `data:${mediaType};base64,${data}`;
}