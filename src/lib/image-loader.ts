"use client";

const normalizeSrc = (src: string) =>
  src.startsWith("/") ? src.slice(1) : src;

const DEFAULT_IMAGE_QUALITY = 75;

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = [
    `width=${width}`,
    `quality=${quality ?? DEFAULT_IMAGE_QUALITY}`,
    "format=auto",
  ];
  return `https://eskridge.dev/cdn-cgi/image/${params.join(",")}/${normalizeSrc(src)}`;
}
