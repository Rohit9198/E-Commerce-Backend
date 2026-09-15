export const getImageUrl = (product) => {
  if (!product) return "/avatar-holder.avif";
  const images = product.images || product.image;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return first.url || first.secure_url || "/avatar-holder.avif";
  }
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === "string") return first;
        if (first && typeof first === "object") return first.url || first.secure_url || "/avatar-holder.avif";
      }
    } catch {
      if (images.startsWith("http") || images.startsWith("/")) return images;
    }
  }
  if (typeof images === "string" && (images.startsWith("http") || images.startsWith("/"))) {
    return images;
  }
  return "/avatar-holder.avif";
};

export const handleImageError = (e) => {
  e.currentTarget.src = "/avatar-holder.avif";
};

export const getReviewCount = (product) => {
  return Number(product?.review_count ?? product?.reviews?.length ?? 0);
};
