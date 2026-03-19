type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export function parseBase64(raw: string): {
  mediaType: ImageMediaType;
  data: string;
} {
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

export async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
