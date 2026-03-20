function upsertMetaAttribute(attributeName, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attributeName}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attributeName, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function setDocumentMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogUrl,
  twitterTitle,
  twitterDescription,
} = {}) {
  if (title) document.title = title;

  const desc = description ?? ogDescription;
  if (desc) upsertMetaAttribute("name", "description", desc);

  upsertMetaAttribute("property", "og:type", "website");
  if (ogTitle) upsertMetaAttribute("property", "og:title", ogTitle);
  if (ogDescription) upsertMetaAttribute("property", "og:description", ogDescription);
  if (ogUrl) upsertMetaAttribute("property", "og:url", ogUrl);

  upsertMetaAttribute("name", "twitter:card", "summary");
  if (twitterTitle || ogTitle) {
    upsertMetaAttribute("name", "twitter:title", twitterTitle ?? ogTitle);
  }
  if (twitterDescription || ogDescription) {
    upsertMetaAttribute(
      "name",
      "twitter:description",
      twitterDescription ?? ogDescription,
    );
  }
}

