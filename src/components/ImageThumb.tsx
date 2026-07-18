import type { CSSProperties } from "react";
import { useObjectUrl } from "../hooks/useObjectUrl";

export default function ImageThumb({
  image,
  alt,
  className,
  style,
}: {
  image: Blob;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  const url = useObjectUrl(image);
  if (!url)
    return <div className={`animate-pulse bg-rose-100 dark:bg-neutral-800 ${className ?? ""}`} />;
  return <img src={url} alt={alt} className={className} style={style} />;
}
