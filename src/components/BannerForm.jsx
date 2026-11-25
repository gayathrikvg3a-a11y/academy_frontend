import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { createBanner, updateBanner } from "../api/bannerApi";

import FilePreview from "./common/FilePreview";
import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";
import { mediaFileName, resolveMediaUrl } from "../utils/mediaUrl";

const initialForm = {
  title: "",
  image: null,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Banner title",
};

function BannerForm({
  open,
  banner,
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    // `image` only ever holds a newly picked file; the one already saved is
    // read off the banner itself.
    setFormData(
      banner
        ? { title: banner.title || "", image: null }
        : initialForm
    );

    setErrors({});
  }, [banner, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  const handleImage = (e) => {
    const picked = e.target.files?.[0] || null;

    // Cleared so the same file can be picked again after being removed.
    e.target.value = "";

    if (!picked) return;

    setFormData((prev) => ({
      ...prev,
      image: picked,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, "image")
    );
  };

  // Dropping a picked file falls back to the image already saved, if any.
  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const savedImage = resolveMediaUrl(
    banner?.image_url,
    banner?.image
  );

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    // A banner is its image, so a new one can't be saved without it. An edit
    // keeps the saved image unless a replacement is picked.
    if (!formData.image && !savedImage) {
      newErrors.image = "Banner image is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});

      const data = new FormData();

      data.append("title", formData.title);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (banner) {
        await updateBanner(banner.id, data);
      } else {
        await createBanner(data);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save banner:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save banner."
      );

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={banner ? "Edit Banner" : "Add Banner"}
      subtitle={
        banner
          ? "Update banner information"
          : "Create a new website banner"
      }
      submitLabel={
        banner ? "Update Banner" : "Create Banner"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={1}>
          <FormField
            required
            label="Banner Title"
            placeholder="Admissions Open 2026"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title || ""}
          />

          <div>
            <Button
              variant="outline"
              className={errors.image ? "border-destructive text-destructive" : undefined}
              render={
                <label>
                  {formData.image || savedImage
                    ? "Change Image"
                    : "Upload Image"}

                  <input
                    hidden
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImage}
                  />
                </label>
              }
            />

            {/* A replacement is previewed straight from the picked file; with
                none picked, the image already saved stands in. */}
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              {formData.image ? (
                <FilePreview
                  file={formData.image}
                  className="aspect-video w-32 shrink-0 rounded-md bg-muted object-cover"
                />
              ) : savedImage ? (
                <img
                  src={savedImage}
                  alt=""
                  className="aspect-video w-32 shrink-0 rounded-md bg-muted object-cover"
                />
              ) : (
                <div className="flex aspect-video w-32 shrink-0 items-center justify-center rounded-md bg-muted">
                  <ImageIcon className="size-5" />
                </div>
              )}

              <span className="min-w-0 flex-1 truncate">
                {formData.image
                  ? formData.image.name
                  : mediaFileName(
                      banner?.image_url,
                      banner?.image
                    ) || "No image yet."}
              </span>

              {formData.image && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  aria-label="Remove image"
                  disabled={saving}
                  onClick={removeImage}
                >
                  <X />
                </Button>
              )}
            </div>

            {errors.image && (
              <p className="mt-1 text-sm text-destructive">
                {errors.image}
              </p>
            )}
          </div>
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default BannerForm;
