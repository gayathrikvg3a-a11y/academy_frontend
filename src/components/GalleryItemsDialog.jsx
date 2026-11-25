import { useEffect, useState } from "react";
import { Eye, Film, ImagePlus, Play, Trash2, Star, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import GalleryItemForm from "./GalleryItemForm";
import ConfirmDialog from "./common/ConfirmDialog";
import useConfirm from "./common/useConfirm";
import useSnackbar from "./common/useSnackbar";

import api from "../api/axios";
import { mediaFileName, resolveMediaUrl } from "../utils/mediaUrl";

// What a tile and its preview are called: the caption when there is one, and
// otherwise the uploaded file's own name. Only an item whose file never made
// it through has nothing left to go by.
const itemLabel = (item) =>
  item?.caption ||
  mediaFileName(item?.file_url, item?.file) ||
  "Untitled";

// The controls float over the photograph rather than sitting on a player-style
// scrim, so each one carries the surface of the app with it and stays readable
// whatever it lands on.
// The dark variants are spelled out because the button's own hover colours are
// tuned for a solid panel; at half opacity over a photograph they stop being
// readable.
const chipClass =
  "border-border/40 bg-background/90 shadow-sm backdrop-blur-sm hover:bg-muted dark:hover:bg-muted";

function GalleryItemsDialog({
  open,
  album,
  onClose,
}) {
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const {
    showSnackbar,
  } = useSnackbar();

  // The album already arrives with its media nested, so the grid paints from
  // what the table row handed us and then refreshes, meaning every View click
  // ends up showing what the server has right now. The seeded items stand in
  // during that refresh, so the spinner is only for a first, empty open.
  useEffect(() => {
    if (open && album) {
      const seeded = album.gallery_items || [];

      setItems(seeded);
      loadGalleryItems({ silent: seeded.length > 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, album]);

  const loadGalleryItems = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // The list is about to be replaced, so whatever was playing has either
      // been deleted or is about to be remounted from stale props.
      setPlayingId(null);

      const response = await api.get(
        `albums/${album.id}/`
      );

      // Fall back to the flat endpoint if a detail response ever comes back
      // without the nested list.
      if (Array.isArray(response.data.gallery_items)) {
        setItems(response.data.gallery_items);
        return;
      }

      const fallback = await api.get(
        `gallery-items/?album=${album.id}`
      );

      setItems(
        Array.isArray(fallback.data)
          ? fallback.data
          : fallback.data.results || []
      );
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Failed to load gallery items.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    askConfirm({
      title: "Delete Media",
      message:
        "Delete this media? This action cannot be undone.",
      onConfirm: () => confirmDelete(item),
    });
  };

  const confirmDelete = async (item) => {
    try {
      await api.delete(
        `gallery-items/${item.id}/`
      );

      await loadGalleryItems();

      showSnackbar("Media deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Failed to delete media.",
        "error"
      );
    }
  };

  const previewSrc = previewItem
    ? resolveMediaUrl(previewItem.file_url, previewItem.file)
    : "";

  // A video shows its uploaded poster until it is played. Without one the
  // player is left to its own devices, so `undefined` rather than an empty
  // string, which some browsers treat as a src to go and fetch.
  const previewPoster = previewItem
    ? resolveMediaUrl(
        previewItem.thumbnail_url,
        previewItem.thumbnail
      ) || undefined
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{album?.title}</DialogTitle>
          <DialogDescription>Gallery Items</DialogDescription>
        </DialogHeader>

        <div className="mb-3 flex items-center justify-between">
          <Button
            onClick={() => {
              setSelectedItem(null);
              setOpenForm(true);
            }}
          >
            <ImagePlus data-icon="inline-start" />
            Add Media
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No media in this album yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const mediaSrc = resolveMediaUrl(
                item.file_url,
                item.file
              );

              const label = itemLabel(item);
              const isVideo = item.media_type === "VIDEO";
              const poster = resolveMediaUrl(
                item.thumbnail_url,
                item.thumbnail
              );
              const playing = isVideo && playingId === item.id;

              return (
                <Card key={item.id} className="group overflow-hidden pt-0">
                  <div className="relative">
                    {playing ? (
                      // Only now does a source exist for the browser to fetch.
                      // Until play is pressed the tile is a still image, so
                      // opening an album of video costs one poster each.
                      <video
                        src={mediaSrc}
                        poster={poster || undefined}
                        controls
                        autoPlay
                        className="h-[200px] w-full bg-black object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        aria-label={
                          isVideo ? `Play ${label}` : `View ${label}`
                        }
                        className="relative block w-full cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        onClick={() =>
                          isVideo
                            ? setPlayingId(item.id)
                            : setPreviewItem(item)
                        }
                      >
                        {isVideo && !poster ? (
                          // A video uploaded without a thumbnail has nothing to
                          // show, and an empty poster leaves a blank rectangle
                          // that reads as a broken tile.
                          <div className="flex h-[200px] w-full items-center justify-center bg-muted">
                            <Film className="size-7 text-muted-foreground" />
                          </div>
                        ) : (
                          <img
                            src={isVideo ? poster : mediaSrc}
                            alt={item.caption || "Gallery media"}
                            className="h-[200px] w-full bg-muted object-cover"
                          />
                        )}

                        {isVideo && (
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span
                              className={cn(
                                "flex size-11 items-center justify-center rounded-full border",
                                chipClass
                              )}
                            >
                              <Play className="size-4 translate-x-px fill-current" />
                            </span>
                          </span>
                        )}
                      </button>
                    )}

                    {/* Reversible actions on the left, the irreversible one as
                        far from them as the tile allows. While a video plays
                        they move up so they are not sitting on the scrubber. */}
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-x-0 flex items-center justify-between gap-1 px-2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 motion-reduce:transition-none [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100",
                        playing ? "top-2" : "bottom-2"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="View"
                          title="View"
                          className={chipClass}
                          onClick={() => setPreviewItem(item)}
                        >
                          <Eye />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit"
                          title="Edit"
                          className={chipClass}
                          onClick={() => {
                            setSelectedItem(item);
                            setOpenForm(true);
                          }}
                        >
                          <Pencil />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete"
                        title="Delete"
                        className={cn(
                          chipClass,
                          "text-destructive hover:border-destructive hover:bg-destructive hover:text-white focus-visible:border-destructive focus-visible:ring-destructive/30 dark:hover:bg-destructive"
                        )}
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <p className="truncate font-semibold" title={label}>
                      {label}
                    </p>

                    {item.is_featured && (
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-warning/15 text-warning dark:bg-warning/20"
                      >
                        <Star data-icon="inline-start" />
                        Featured
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>

        <GalleryItemForm
          open={openForm}
          album={album}
          item={selectedItem}
          onClose={(uploadedBeforeClosing) => {
            setOpenForm(false);
            setSelectedItem(null);

            // A batch upload that failed partway still added items, so the
            // grid is stale even though the form never reported success.
            if (uploadedBeforeClosing) {
              loadGalleryItems();
            }
          }}
          onSuccess={(count = 1) => {
            setOpenForm(false);
            setSelectedItem(null);
            loadGalleryItems();

            showSnackbar(
              selectedItem
                ? "Media updated successfully."
                : count > 1
                  ? `${count} media files added successfully.`
                  : "Media added successfully."
            );
          }}
        />

        {/* Full-size preview. Cropping to a 200px tile is fine for scanning the
            album, but checking a photo needs the whole frame, so this one is
            contained rather than covered. */}
        <Dialog
          open={Boolean(previewItem)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPreviewItem(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="truncate">
                {previewItem ? itemLabel(previewItem) : ""}
              </DialogTitle>
              <DialogDescription>{album?.title}</DialogDescription>
            </DialogHeader>

            {previewItem?.media_type === "VIDEO" ? (
              <video
                controls
                autoPlay
                poster={previewPoster}
                className="max-h-[65svh] w-full rounded-lg bg-muted"
              >
                <source src={previewSrc} />
              </video>
            ) : (
              <img
                src={previewSrc}
                alt={previewItem?.caption || "Gallery media"}
                className="max-h-[65svh] w-full rounded-lg bg-muted object-contain"
              />
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewItem(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          {...confirm}
          onConfirm={runConfirm}
          onClose={closeConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}

export default GalleryItemsDialog;
