import { useObjectUrl } from "../hooks/useObjectUrl";

export default function ImageThumb({
  image,
  alt,
  className,
}: {
  image: Blob;
  alt: string;
  className?: string;
}) {
  const url = useObjectUrl(image);
  if (!url)
    return <div className={`animate-pulse bg-rose-100 dark:bg-neutral-800 ${className ?? ""}`} />;
  return <img src={url} alt={alt} className={className} />;
}
