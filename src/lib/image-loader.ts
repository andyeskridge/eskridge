'use client';

const normalizeSrc = (src: string) => {
  return src.startsWith('/') ? src.slice(1) : src;
};

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto'];
  return `https://eskridge.dev/cdn-cgi/image/${params.join(',')}/${normalizeSrc(src)}`;
}
