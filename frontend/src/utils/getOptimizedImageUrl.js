const getOptimizedImageUrl = (src, width = 800, quality = 82) => {
  if (!src || !src.startsWith("/uploads/")) {
    return src;
  }

  const params = new URLSearchParams({
    src,
    w: String(width),
    q: String(quality),
  });

  return `/api/images?${params.toString()}`;
};

export default getOptimizedImageUrl;