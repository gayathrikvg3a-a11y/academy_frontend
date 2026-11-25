import { useEffect, useState } from "react";

// ================= PREVIEW =================
//
// A picked file is only a name until it is shown, so each row paints from an
// object URL made on the spot and revoked when the row goes — the URL pins the
// file in memory for as long as it lives, and a long batch would add up.

function FilePreview({ file, video, className }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);

    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) {
    return <div className={className} />;
  }

  // A video element with nothing loaded paints an empty box, so the fragment
  // asks the player to seek a moment in and show that frame instead.
  return video ? (
    <video
      muted
      playsInline
      preload="metadata"
      src={`${url}#t=0.1`}
      className={className}
    />
  ) : (
    <img src={url} alt="" className={className} />
  );
}

export default FilePreview;
