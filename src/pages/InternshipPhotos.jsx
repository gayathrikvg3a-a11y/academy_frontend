import { useEffect, useState } from "react";
import { Image as ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import InternshipPhotoForm from "../components/InternshipPhotoForm";

import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingButton from "../components/common/LoadingButton";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

import { resolveMediaUrl } from "../utils/mediaUrl";

// The website's internship pages show their photos in one row of four, so no
// more than four can be selected.
const MAX_SELECTED = 4;

// The same floating surface the gallery's tiles use, so the controls stay
// readable whatever photo they land on.
const chipClass =
  "border-border/40 bg-background/90 shadow-sm backdrop-blur-sm hover:bg-muted dark:hover:bg-muted";

const listOf = (response) =>
  Array.isArray(response.data)
    ? response.data
    : response.data.results || [];

// The photos for the Academic or the Industry Internship page, named by
// `program`, with `api` from api/internshipPhotoApi.js.
function InternshipPhotos({ program, api }) {
  const [photos, setPhotos] = useState([]);

  // What the website has now, read from the selected photos themselves.
  const [savedIds, setSavedIds] = useState([]);

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

  // The ticks are reset to what the server has.
  const loadPhotos = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const [all, selected] = await Promise.all([
        api.getPhotos(),
        api.getSelectedPhotos(),
      ]);

      const ids = listOf(selected).map((photo) => photo.id);

      setPhotos(listOf(all));
      setSavedIds(ids);
      setPicked(ids);
    } catch (error) {
      console.error(error);

      showSnackbar("Failed to load photos.", "error");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const changed =
    savedIds.length !== picked.length ||
    savedIds.some((id) => !picked.includes(id));

  const full = picked.length >= MAX_SELECTED;

  // ================= HANDLERS =================

  const togglePhoto = (id) => {
    setPicked((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pickedId) => pickedId !== id);
      }

      return prev.length >= MAX_SELECTED ? prev : [...prev, id];
    });
  };

  const handleSaveSelection = async () => {
    try {
      setSavingSelection(true);

      await api.selectPhotos(
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
      message: savedIds.includes(photo.id)
        ? `Delete "${photo.title}"? It's on the website now, and leaves the ${program} page straight away. This action cannot be undone.`
        : `Delete "${photo.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(photo),
    });
  };

  // The photo is dropped from the list here rather than the list re-read, so
  // the ticks not yet saved stay as they are.
  const confirmDelete = async (photo) => {
    try {
      await api.deletePhoto(photo.id);

      setPhotos((prev) =>
        prev.filter((item) => item.id !== photo.id)
      );

      setSavedIds((prev) =>
        prev.filter((savedId) => savedId !== photo.id)
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

  // Re-read without touching the ticks, so ones not yet saved stay ticked.
  const handleSuccess = async () => {
    const wasEdit = Boolean(selectedPhoto);

    handleCloseForm();

    try {
      const response = await api.getPhotos();

      setPhotos(listOf(response));
    } catch (error) {
      console.error(error);
    }

    showSnackbar(
      wasEdit
        ? "Photo updated successfully."
        : "Photo added successfully."
    );
  };

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title={program}
        subtitle={`Photos for the website's ${program} page, which shows up to ${MAX_SELECTED} selected ones`}
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
              of {MAX_SELECTED} selected
              {picked.length > MAX_SELECTED ? (
                <span className="text-warning">
                  {" "}· only {MAX_SELECTED} show on the website
                </span>
              ) : (
                full && <> · untick one to pick another</>
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

              // Once four are ticked, the rest wait until one is unticked.
              const locked = !ticked && full;

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
                    <label
                      className={cn(
                        "block",
                        locked ? "cursor-not-allowed" : "cursor-pointer"
                      )}
                      title={
                        locked
                          ? `Only ${MAX_SELECTED} can be selected`
                          : undefined
                      }
                    >
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className={cn(
                            "aspect-[4/3] w-full bg-muted object-cover",
                            locked && "opacity-60"
                          )}
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
                          disabled={savingSelection || locked}
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
                    {savedIds.includes(photo.id) && (
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

      <InternshipPhotoForm
        program={program}
        api={api}
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

export default InternshipPhotos;
