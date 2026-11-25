// ================= VIDEO EMBED =================
//
// Lessons store whatever link was pasted into the form — usually a YouTube
// watch page, sometimes Vimeo, Drive or a plain file. A watch page refuses to
// load inside an iframe, so each host's link is rewritten to its player URL.
// Anything unrecognised returns null and the caller falls back to a link.

const VIDEO_FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;

function parseUrl(value) {
  try {
    // A link pasted without its scheme is still a link.
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

function youtubeId(url, host) {
  if (host === "youtu.be") {
    return url.pathname.split("/")[1];
  }

  if (host !== "youtube.com" && host !== "youtube-nocookie.com") {
    return null;
  }

  if (url.pathname === "/watch") {
    return url.searchParams.get("v");
  }

  return url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1];
}

export function getVideoEmbed(value) {
  const url = value && parseUrl(value.trim());

  if (!url) {
    return null;
  }

  const host = url.hostname.replace(/^(www|m)\./, "");

  const youtube = youtubeId(url, host);

  if (youtube) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${youtube}`,
    };
  }

  if (host === "player.vimeo.com") {
    return { type: "iframe", src: url.href };
  }

  if (host === "vimeo.com") {
    // Unlisted videos carry a privacy hash as a second path segment.
    const [, id, hash] = url.pathname.split("/");

    if (/^\d+$/.test(id)) {
      return {
        type: "iframe",
        src: `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`,
      };
    }
  }

  if (host === "drive.google.com") {
    const id =
      url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] ||
      url.searchParams.get("id");

    if (id) {
      return {
        type: "iframe",
        src: `https://drive.google.com/file/d/${id}/preview`,
      };
    }
  }

  if (VIDEO_FILE.test(url.pathname)) {
    return { type: "file", src: url.href };
  }

  return null;
}
