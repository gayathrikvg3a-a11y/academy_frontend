import { useEffect, useState } from "react";
import { Image as ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import {
  deleteLifeAtCignesPhoto,
  getLifeAtCignesPhotos,
  selectLifeAtCignesPhotos,
} from "../api/lifeAtCignesApi";

import LifeAtCignesForm from "../components/LifeAtCignesForm";

import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingButton from "../components/common/LoadingButton";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

import { resolveMediaUrl } from "../utils/mediaUrl";

// The home page's section is a sentence with a photo between each part of
// it, written for five.
const SHOWN_ON_WEBSITE = 5;

// The same floating surface the gallery's tiles use, so the controls stay
// readable whatever photo they land on.
const chipClass =
  "border-border/40 bg-background/90 shadow-sm backdrop-blur-sm hover:bg-muted dark:hover:bg-muted";

const selectedIdsOf = (photos) =>
  photos
    .filter((photo) => photo.is_selected)
    .map((photo) => photo.id);

function LifeAtCignes() {
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(false);

  // The ticked photos, saved together with "Save Selection".
  const [picked, setPicked] = useState([]);

  const [savingSelection, setSavingSelection] = useState(false);

  const [openForm, setOpenForm] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const {
    showSnackbar,
  } = useSnackbar();

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The ticks are reset to what the server has, which a save from the form
  // can change too.
  const loadPhotos = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await getLifeAtCignesPhotos();

      const list = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setPhotos(list);
      setPicked(selectedIdsOf(list));
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load photos.", "error");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const savedIds = selectedIdsOf(photos);

  const changed =
    savedIds.length !== picked.length ||
    savedIds.some((id) => !picked.includes(id));

  // ================= HANDLERS =================

  const togglePhoto = (id) => {
    setPicked((prev) =>
      prev.includes(id)
        ? prev.filter((pickedId) => pickedId !== id)
        : [...prev, id]
    );
  };

  const handleSaveSelection = async () => {
    try {
      setSavingSelection(true);

      await selectLifeAtCignesPhotos(
        photos
          .filter((photo) => picked.includes(photo.id))
          .map((photo) => photo.id)
      );

      await loadPhotos({ silent: true });

      showSnackbar("Selection saved.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to save selection.", "error");
    } finally {
      setSavingSelection(false);
    }
  };

  const handleAdd = () => {
    setSelectedPhoto(null);
    setOpenForm(true);
  };

  const handleEdit = (photo) => {
    setSelectedPhoto(photo);
    setOpenForm(true);
  };

  const handleDelete = (photo) => {
    askConfirm({
      title: "Delete Photo",
      message: photo.is_selected
        ? `Delete "${photo.title}"? It's on the website now, and leaves the home page the next time the site is built. This action cannot be undone.`
        : `Delete "${photo.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(photo),
    });
  };

  // The photo is dropped from the list here rather than the list re-read, so
  // the ticks not yet saved stay as they are.
  const confirmDelete = async (photo) => {
    try {
      await deleteLifeAtCignesPhoto(photo.id);

      setPhotos((prev) =>
        prev.filter((item) => item.id !== photo.id)
      );

      setPicked((prev) =>
        prev.filter((pickedId) => pickedId !== photo.id)
      );

      showSnackbar("Photo deleted successfully.");
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to delete photo.", "error");
    }
  };

  const handleCloseForm = () => {
    setSelectedPhoto(null);
    setOpenForm(false);
  };

  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedPhoto);

    handleCloseForm();

    await loadPhotos({ silent: true });

    showSnackbar(
      wasEdit
        ? "Photo updated successfully."
        : "Photo added successfully."
    );
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title="Life at Cignes"
        subtitle={`Photos for the home page's Life at Cignes section, which shows up to ${SHOWN_ON_WEBSITE} of the selected ones`}
        action={
          <Button onClick={handleAdd}>
            <Plus data-icon="inline-start" />
            Add Photo
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-xl border py-10 text-center text-muted-foreground">
          No photos yet.
        </div>
      ) : (
        <>
          {/* ================= SELECTION ================= */}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {picked.length}
              </span>{" "}
              selected
              {picked.length > SHOWN_ON_WEBSITE && (
                <span className="text-warning">
                  {" "}· only {SHOWN_ON_WEBSITE} show on the home page
                </span>
              )}
            </p>

            <div className="flex items-center gap-2">
              {changed && (
                <Button
                  variant="ghost"
                  disabled={savingSelection}
                  onClick={() => setPicked(savedIds)}
                >
                  Undo Changes
                </Button>
              )}

              <LoadingButton
                loading={savingSelection}
                disabled={!changed}
                onClick={handleSaveSelection}
              >
                Save Selection
              </LoadingButton>
            </div>
          </div>

          {/* ================= PHOTOS ================= */}

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const image = resolveMediaUrl(
                photo.image_url,
                photo.image
              );

              const ticked = picked.includes(photo.id);

              return (
                <Card
                  key={photo.id}
                  className={cn(
                    "group overflow-hidden pt-0",
                    ticked && "ring-2 ring-primary"
                  )}
                >
                  <div className="relative">
                    {/* The whole photo ticks it, not just the box. */}
                    <label className="block cursor-pointer">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="aspect-[4/3] w-full bg-muted object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground">
                          <ImageIcon className="size-6" />
                        </div>
                      )}

                      <span
                        className={cn(
                          "absolute top-2 left-2 flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm font-medium",
                          chipClass
                        )}
                      >
                        <Checkbox
                          checked={ticked}
                          disabled={savingSelection}
                          onCheckedChange={() => togglePhoto(photo.id)}
                        />
                        Select
                        <span className="sr-only"> {photo.title}</span>
                      </span>
                    </label>

                    <div className="pointer-events-none absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 motion-reduce:transition-none [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${photo.title}`}
                        title="Edit"
                        className={chipClass}
                        onClick={() => handleEdit(photo)}
                      >
                        <Pencil />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${photo.title}`}
                        title="Delete"
                        className={cn(chipClass, "hover:text-destructive")}
                        onClick={() => handleDelete(photo)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="flex items-center justify-between gap-2 p-3">
                    <p className="truncate font-semibold" title={photo.title}>
                      {photo.title || "Untitled"}
                    </p>

                    {/* What the website has now, which a tick only changes once saved. */}
                    {photo.is_selected && (
                      <StatusBadge
                        tone="success"
                        label="On website"
                        className="shrink-0"
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <LifeAtCignesForm
        open={openForm}
        photo={selectedPhoto}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />
    </div>
  );
}

export default LifeAtCignes;
