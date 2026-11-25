// ================= MEDIA URL HELPERS =================
//
// Uploaded files reach us under a couple of different keys depending on the
// serializer (`file_url` / `file`, `cover_image_url` / `cover_image`), and the
// value is only an absolute URL when the API had the request in context. A
// bare "/media/..." path would otherwise resolve against the app's own origin
// and 404, so it gets pinned back to the API host here.

import { API_BASE_URL } from "../api/axios";

const API_ORIGIN = new URL(API_BASE_URL).origin;

export function resolveMediaUrl(...candidates) {
  const value = candidates.find(Boolean);

  if (!value) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
}

// ================= FILE NAME =================
//
// An item saved without a caption is still identifiable by the name it was
// uploaded under, which says more in a grid of thumbnails than a "No Caption"
// placeholder repeated twenty times.

export function mediaFileName(...candidates) {
  const value = candidates.find(Boolean);

  if (!value) {
    return "";
  }

  // Storage backends sign their URLs, so the query string has to go before the
  // last segment is the file name.
  const path = String(value).split(/[?#]/)[0];

  const name = path.slice(path.lastIndexOf("/") + 1);

  try {
    return decodeURIComponent(name);
  } catch {
    // A stray "%" in the name is not worth losing the name over.
    return name;
  }
}
