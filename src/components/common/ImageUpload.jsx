import { Image as ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import FilePreview from "./FilePreview";

// ================= IMAGE UPLOAD =================
//
// A file button with a preview of the image: the one just picked, or else the
// one already saved. Course thumbnails, blog covers and OG images all use it.

function ImageUpload({
  name,
  label,
  emptyText,
  picked,
  savedUrl,
  savedName,
  error,
  saving,
  onChange,
  onRemove,
}) {
  return (
    <div>
      <Button
        variant="outline"
        className={error ? "border-destructive text-destructive" : undefined}
        nativeButton={false}
        render={
          <label>
            {picked || savedUrl
              ? `Change ${label}`
              : `Upload ${label}`}

            <input
              hidden
              type="file"
              name={name}
              accept="image/*"
              onChange={onChange}
            />
          </label>
        }
      />

      {/* A replacement is previewed straight from the picked file; with
          none picked, the image already saved stands in. */}
      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
        {picked ? (
          <FilePreview
            file={picked}
            className="aspect-video w-24 shrink-0 rounded-md bg-muted object-cover"
          />
        ) : savedUrl ? (
          <img
            src={savedUrl}
            alt=""
            className="aspect-video w-24 shrink-0 rounded-md bg-muted object-cover"
          />
        ) : (
          <div className="flex aspect-video w-24 shrink-0 items-center justify-center rounded-md bg-muted">
            <ImageIcon className="size-5" />
          </div>
        )}

        <span className="min-w-0 flex-1 truncate">
          {picked ? picked.name : savedName || emptyText}
        </span>

        {picked && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label={`Remove ${label}`}
            disabled={saving}
            onClick={() => onRemove(name)}
          >
            <X />
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default ImageUpload;
