import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import api from "../api/axios";

import FilePreview from "./common/FilePreview";
import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import FormSection from "./common/FormSection";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";
import { mediaFileName, resolveMediaUrl } from "../utils/mediaUrl";

// A batch is uploaded one file at a time and each file is saved as its own
// item, so everything that belongs to a single item is held per file, keyed
// the way the list rows are: its poster, its caption, its featured flag. Only
// the display order is shared, and it counts up through the batch.
//
// Editing works on one item, which has no list to key by, so its caption,
// featured flag and thumbnail sit on the form itself.
const initialForm = {
  media_type: "IMAGE",
  files: [],
  thumbnails: {},
  captions: {},
  featured: {},
  thumbnail: null,
  caption: "",
  is_featured: false,
  display_order: 0,
};

// ================= REQUIRED FIELDS =================
//
// The file is only mandatory when adding; editing an existing item keeps the
// media already uploaded unless a replacement is chosen. Media type is a
// select that always holds a value, so it needs no check of its own.

const requiredFields = {};

// ================= FILE HELPERS =================
//
// Adding accepts a whole batch, so files need an identity of their own to be
// listed, de-duplicated and removed before the upload starts.

const fileKey = (file) =>
  `${file.name}-${file.size}-${file.lastModified}`;

// A picked file already knows what it is, so its own MIME type decides how the
// item is saved, which keeps a mixed batch from landing under one wrong type.
// Some pickers hand over a file with an empty MIME type, so the extension is
// the second opinion before falling back.
const videoExtensions =
  /\.(mp4|mov|m4v|webm|avi|mkv|3gp|ogv|mpe?g|wmv)$/i;

const mediaTypeFor = (file, fallback) => {
  if (file.type.startsWith("video/")) {
    return "VIDEO";
  }

  if (file.type.startsWith("image/")) {
    return "IMAGE";
  }

  if (videoExtensions.test(file.name)) {
    return "VIDEO";
  }

  return fallback;
};

// A row that says "2.4 MB" answers the question a file name raises next, and
// it is the one thing about a picked file that the preview cannot show.
const formatSize = (bytes) => {
  if (!bytes) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];

  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${
    unit > 0 && value < 10 ? value.toFixed(1) : Math.round(value)
  } ${units[unit]}`;
};

function GalleryItemForm({
  open,
  album,
  item,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(item);

  const contentRef = useRef(null);

  // A batch that fails halfway still leaves items in the album, so the parent
  // has to reload even when the dialog is closed rather than saved.
  const uploadedRef = useRef(false);

  const [saving, setSaving] = useState(false);

  const [progress, setProgress] = useState(0);

  const [formData, setFormData] =
    useState(initialForm);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (item) {
      setFormData({
        media_type: item.media_type,
        files: [],
        thumbnails: {},
        captions: {},
        featured: {},
        thumbnail: null,
        caption: item.caption || "",
        is_featured: item.is_featured,
        display_order: item.display_order,
      });
    } else {
      setFormData(initialForm);
    }

    uploadedRef.current = false;

    setProgress(0);
    setErrors({});
  }, [item, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  // Picking appends to the list instead of replacing it, so a batch can be
  // gathered from more than one folder. Editing swaps in a single replacement.
  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);

    // Clearing the input lets the same file be picked again after a removal.
    e.target.value = "";

    if (picked.length === 0) {
      return;
    }

    setFormData((prev) => {
      if (isEdit) {
        return { ...prev, files: picked.slice(0, 1) };
      }

      const chosen = new Set(prev.files.map(fileKey));

      return {
        ...prev,
        files: [
          ...prev.files,
          ...picked.filter(
            (file) => !chosen.has(fileKey(file))
          ),
        ],
      };
    });

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, "file")
    );
  };

  const removeFile = (key) => {
    setFormData((prev) => {
      // What was typed for a file belongs to that file, so dropping it drops
      // its poster, caption and flag too rather than leaving them behind to
      // attach themselves to whatever is picked next.
      const thumbnails = { ...prev.thumbnails };
      const captions = { ...prev.captions };
      const featured = { ...prev.featured };

      delete thumbnails[key];
      delete captions[key];
      delete featured[key];

      return {
        ...prev,
        files: prev.files.filter(
          (file) => fileKey(file) !== key
        ),
        thumbnails,
        captions,
        featured,
      };
    });
  };

  // Caption and featured are per file while adding, so they are written into
  // the map that holds them rather than onto the form itself.
  const setFileField = (key, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  };

  // ================= THUMBNAILS =================
  //
  // A video is a black rectangle in the album grid until something stands in
  // for its first frame. Adding takes one per video row, keyed by file;
  // editing takes the single item's own, so its key is left out.

  const handleThumbnail = (key) => (e) => {
    const picked = e.target.files?.[0] || null;

    e.target.value = "";

    if (!picked) {
      return;
    }

    setFormData((prev) =>
      key
        ? {
            ...prev,
            thumbnails: { ...prev.thumbnails, [key]: picked },
          }
        : { ...prev, thumbnail: picked }
    );

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, "thumbnail")
    );
  };

  const removeThumbnail = (key) => {
    setFormData((prev) => {
      if (!key) {
        return { ...prev, thumbnail: null };
      }

      const thumbnails = { ...prev.thumbnails };

      delete thumbnails[key];

      return { ...prev, thumbnails };
    });
  };

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    if (!isEdit && formData.files.length === 0) {
      newErrors.file =
        "Please choose at least one file to upload.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  // Every file in a batch shares the caption and the featured flag; only the
  // display order moves, counting up from the number typed in the form.
  const buildData = (file, index) => {
    const data = new FormData();

    const key = file ? fileKey(file) : null;

    const mediaType = file
      ? mediaTypeFor(file, formData.media_type)
      : formData.media_type;

    data.append("album", album.id);

    data.append("media_type", mediaType);

    data.append(
      "caption",
      isEdit
        ? formData.caption
        : (key && formData.captions[key]) || ""
    );

    data.append(
      "is_featured",
      isEdit
        ? formData.is_featured
        : Boolean(key && formData.featured[key])
    );

    data.append(
      "display_order",
      Number(formData.display_order || 0) + index
    );

    if (file) {
      data.append("file", file);
    }

    // The poster rides along in the same request as the video it belongs to.
    // It stays optional, and the key is left off entirely rather than sent
    // empty, so an edit that only changes the caption keeps the saved one.
    const thumbnail = isEdit
      ? formData.thumbnail
      : key && formData.thumbnails[key];

    if (mediaType === "VIDEO" && thumbnail) {
      data.append("thumbnail", thumbnail);
    }

    return data;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const { files } = formData;

    let uploaded = 0;

    try {
      setSaving(true);
      setErrors({});

      if (item) {
        await api.patch(
          `gallery-items/${item.id}/`,
          buildData(files[0] || null, 0)
        );

        onSuccess(1);
        return;
      }

      // One request per file, in order, so a failure halfway through can say
      // how far it got and leave the rest queued for another try.
      for (let index = 0; index < files.length; index += 1) {
        setProgress(index);

        await api.post(
          "gallery-items/",
          buildData(files[index], index)
        );

        uploaded += 1;
      }

      onSuccess(uploaded);
    } catch (error) {
      console.error(
        "Failed to save gallery item:",
        error
      );

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save media."
      );

      // Adding shows no media type control, so a server complaint about it
      // would otherwise land on a field that is not on screen.
      if (!isEdit && apiErrors.media_type) {
        apiErrors.file = apiErrors.media_type;

        delete apiErrors.media_type;
      }

      // Whatever went through is already saved. Drop those from the list so a
      // retry uploads the remainder instead of duplicating the album.
      if (uploaded > 0) {
        uploadedRef.current = true;

        setFormData((prev) => ({
          ...prev,
          files: prev.files.slice(uploaded),
        }));

        apiErrors[FORM_ERROR_KEY] =
          `Uploaded ${uploaded} of ${files.length} files. ` +
          (apiErrors[FORM_ERROR_KEY] ||
            "The rest were not saved.");
      }

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  const fileCount = formData.files.length;

  // The poster already on the item, if it has one — a stored path rather than
  // a picked file, so it is resolved against the API host like any other.
  const savedThumbnail = resolveMediaUrl(
    item?.thumbnail_url,
    item?.thumbnail
  );

  const uploadLabel = isEdit
    ? fileCount > 0
      ? "Change File"
      : "Upload File"
    : fileCount > 0
      ? "Add More Files"
      : "Upload Files";

  const submitLabel = () => {
    if (item) {
      return "Update Media";
    }

    if (saving && fileCount > 1) {
      return `Uploading ${progress + 1} of ${fileCount}…`;
    }

    return fileCount > 1
      ? `Save ${fileCount} Files`
      : "Save Media";
  };

  return (
    <FormDialog
      open={open}
      onClose={() => onClose(uploadedRef.current)}
      title={item ? "Edit Media" : "Add Media"}
      subtitle={album?.title}
      // A batch row carries a preview, a caption and its own controls, which
      // is more than the default width holds without everything truncating.
      maxWidth="lg"
      submitLabel={submitLabel()}
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={2}>
          {/* Adding reads the type off each picked file, so the dropdown would
              only be a second, contradictable answer. Editing keeps it: an item
              whose type was saved wrong can be corrected without re-uploading. */}
          {isEdit && (
            <FormSelect
              required
              label="Media Type"
              {...fieldProps("media_type")}
              options={[
                { value: "IMAGE", label: "Image" },
                { value: "VIDEO", label: "Video" },
              ]}
            />
          )}

          <FormField
            type="number"
            label="Display Order"
            placeholder="1"
            {...fieldProps("display_order")}
          />

          {/* File input is not a TextField, so its error is rendered by hand
              in the same position a helperText would occupy. */}
          <div className="sm:col-span-2">
            <Button
              variant="outline"
              className={errors.file ? "border-destructive text-destructive" : undefined}
              render={
                <label>
                  {uploadLabel}

                  <input
                    hidden
                    type="file"
                    name="file"
                    multiple={!isEdit}
                    accept={
                      isEdit
                        ? formData.media_type === "IMAGE"
                          ? "image/*"
                          : "video/*"
                        : "image/*,video/*"
                    }
                    onChange={handleFiles}
                  />
                </label>
              }
            />

            {/* The picked batch is listed in upload order, each row showing
                what was picked, and can be dropped again before anything is
                sent — the last chance to catch a wrong file is here. */}
            {fileCount > 0 && (
              <ul className="mt-3 space-y-2">
                {formData.files.map((file, index) => {
                  const key = fileKey(file);

                  const isVideo =
                    mediaTypeFor(file, formData.media_type) === "VIDEO";

                  const thumbnail = formData.thumbnails[key];

                  return (
                    <li
                      key={key}
                      className="rounded-lg border bg-card p-2"
                    >
                      <div className="flex items-center gap-3">
                        <FilePreview
                          file={file}
                          video={isVideo}
                          className="size-14 shrink-0 rounded-md bg-muted object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium"
                            title={file.name}
                          >
                            {fileCount > 1 && (
                              <span className="tabular-nums text-muted-foreground">
                                {index + 1}.{" "}
                              </span>
                            )}

                            {file.name}
                          </p>

                          {/* A mixed batch is only readable if each row says
                              which way it was read. */}
                          <p className="text-xs text-muted-foreground">
                            <span className="uppercase">
                              {isVideo ? "Video" : "Image"}
                            </span>

                            {formatSize(file.size) &&
                              ` · ${formatSize(file.size)}`}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0"
                          aria-label={`Remove ${file.name}`}
                          disabled={saving}
                          onClick={() => removeFile(key)}
                        >
                          <X />
                        </Button>
                      </div>

                      {/* Each file is saved as an item of its own, so what
                          describes it is typed on its own row rather than
                          spread across the whole batch. */}
                      {!isEdit && (
                        <div className="mt-2 flex items-center gap-3">
                          <Input
                            value={formData.captions[key] || ""}
                            placeholder="Caption (optional)"
                            disabled={saving}
                            aria-label={`Caption for ${file.name}`}
                            className="flex-1"
                            onChange={(e) =>
                              setFileField(key, "captions", e.target.value)
                            }
                          />

                          <Field
                            orientation="horizontal"
                            className="w-fit shrink-0"
                          >
                            <Switch
                              checked={Boolean(formData.featured[key])}
                              disabled={saving}
                              aria-label={`Feature ${file.name}`}
                              onCheckedChange={(checked) =>
                                setFileField(key, "featured", checked)
                              }
                            />

                            <FieldLabel className="text-sm font-normal text-muted-foreground">
                              Featured
                            </FieldLabel>
                          </Field>
                        </div>
                      )}

                      {/* Only a video is offered a poster, and only while
                          adding — the edit form has one control of its own
                          below, since the item there may keep its file. */}
                      {!isEdit && isVideo && (
                        <div className="mt-2 flex items-center gap-3 border-t pt-2">
                          {thumbnail ? (
                            <FilePreview
                              file={thumbnail}
                              className="size-10 shrink-0 rounded-md bg-muted object-cover"
                            />
                          ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <ImageIcon className="size-4" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-muted-foreground">
                              {thumbnail
                                ? thumbnail.name
                                : "No thumbnail — the player picks its own frame."}
                            </p>

                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              disabled={saving}
                              render={
                                <label>
                                  {thumbnail
                                    ? "Change Thumbnail"
                                    : "Add Thumbnail"}

                                  <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnail(key)}
                                  />
                                </label>
                              }
                            />
                          </div>

                          {thumbnail && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0"
                              aria-label={`Remove thumbnail for ${file.name}`}
                              disabled={saving}
                              onClick={() => removeThumbnail(key)}
                            >
                              <X />
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {fileCount > 1 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Images and videos can be mixed — each file is saved as its own
                item, under its own type, with the caption and featured flag
                set on its row. The display order counts up from the number
                above, in the order listed.
              </p>
            )}

            {errors.file && (
              <p className="text-sm text-destructive">
                {errors.file}
              </p>
            )}

            {/* Adding has no single thumbnail field of its own, so a server
                complaint about one lands here, beside the batch it came from. */}
            {!isEdit && errors.thumbnail && (
              <p className="text-sm text-destructive">
                {errors.thumbnail}
              </p>
            )}
          </div>

          {/* Editing works on one item, so its poster gets a control of its
              own — and one already saved is named rather than left blank. */}
          {isEdit && formData.media_type === "VIDEO" && (
            <div className="sm:col-span-2">
              <Button
                variant="outline"
                className={errors.thumbnail ? "border-destructive text-destructive" : undefined}
                render={
                  <label>
                    {formData.thumbnail || savedThumbnail
                      ? "Change Thumbnail"
                      : "Upload Thumbnail"}

                    <input
                      hidden
                      type="file"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleThumbnail(null)}
                    />
                  </label>
                }
              />

              {/* A replacement is previewed straight from the picked file; with
                  none picked, the poster already saved stands in, so the
                  control never leaves it a guess which one is in force. */}
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                {formData.thumbnail ? (
                  <FilePreview
                    file={formData.thumbnail}
                    className="size-14 shrink-0 rounded-md bg-muted object-cover"
                  />
                ) : savedThumbnail ? (
                  <img
                    src={savedThumbnail}
                    alt=""
                    className="size-14 shrink-0 rounded-md bg-muted object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
                    <ImageIcon className="size-5" />
                  </div>
                )}

                <span className="min-w-0 flex-1 truncate">
                  {formData.thumbnail
                    ? formData.thumbnail.name
                    : mediaFileName(
                        item?.thumbnail_url,
                        item?.thumbnail
                      ) || "No thumbnail yet."}
                </span>

                {formData.thumbnail && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0"
                    aria-label="Remove thumbnail"
                    disabled={saving}
                    onClick={() => removeThumbnail(null)}
                  >
                    <X />
                  </Button>
                )}
              </div>

              {errors.thumbnail && (
                <p className="text-sm text-destructive">
                  {errors.thumbnail}
                </p>
              )}
            </div>
          )}

          {/* Adding sets these on each row, since every file becomes an item
              of its own. Editing has one item, so they belong to the form. */}
          {isEdit && (
            <>
              <FormField
                label="Caption"
                placeholder="A short caption for this media"
                className="sm:col-span-2"
                {...fieldProps("caption")}
              />

              <Field orientation="horizontal" className="w-fit sm:col-span-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_featured: checked,
                    }))
                  }
                  name="is_featured"
                />
                <FieldLabel>Featured</FieldLabel>
              </Field>
            </>
          )}

          {/* A caption rejected by the server while adding has no field of its
              own on screen either, so it lands with the batch. */}
          {!isEdit && errors.caption && (
            <p className="text-sm text-destructive sm:col-span-2">
              {errors.caption}
            </p>
          )}
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default GalleryItemForm;
