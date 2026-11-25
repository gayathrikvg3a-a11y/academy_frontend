import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { resolveMediaUrl } from "../utils/mediaUrl";

// ================= SEO DIALOG =================
//
// A course's or blog post's SEO details, opened from its row action, with
// `name` (the course name or post title) under the heading. Everything comes
// from the row already loaded, so there is no extra request; the footer hands
// the same item to the edit form, where the SEO fields are changed.

function Detail({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-line break-words">{value || "-"}</p>
    </div>
  );
}

export default function SeoDialog({
  open,
  onClose,
  item,
  name,
  onEdit,
}) {
  if (!item) return null;

  const ogImage = resolveMediaUrl(item.og_image_url, item.og_image);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">

        <DialogHeader>
          <DialogTitle>SEO Details</DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Slug"
              value={item.slug}
              className="sm:col-span-2"
            />
            <Detail
              label="Short Description"
              value={item.short_description}
              className="sm:col-span-2"
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="SEO Title" value={item.seo_title} />
            <Detail label="SEO Keywords" value={item.seo_keywords} />
            <Detail
              label="SEO Description"
              value={item.seo_description}
              className="sm:col-span-2"
            />

            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Canonical URL</p>
              {item.canonical_url ? (
                <a
                  href={item.canonical_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 block break-all text-primary underline-offset-4 hover:underline"
                >
                  {item.canonical_url}
                </a>
              ) : (
                <p className="mt-0.5">-</p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">OG Image</p>
            {ogImage ? (
              <img
                src={ogImage}
                alt=""
                className="mt-1.5 aspect-video w-full max-w-sm rounded-md bg-muted object-cover"
              />
            ) : (
              <p className="mt-0.5">-</p>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <Button onClick={() => onEdit(item)}>
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
