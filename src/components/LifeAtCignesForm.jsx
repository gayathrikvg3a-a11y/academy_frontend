import { useEffect, useRef, useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import {
  createLifeAtCignesPhoto,
  updateLifeAtCignesPhoto,
} from "../api/lifeAtCignesApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";
import ImageUpload from "./common/ImageUpload";

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
  is_selected: false,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Title",
};

function LifeAtCignesForm({
  open,
  photo,
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
    // read off the photo itself.
    setFormData(
      photo
        ? {
            title: photo.title || "",
            image: null,
            is_selected: Boolean(photo.is_selected),
          }
        : initialForm
    );

    setErrors({});
  }, [photo, open]);

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
    photo?.image_url,
    photo?.image
  );

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    // A new photo can't be saved without its image. An edit keeps the saved
    // image unless a replacement is picked.
    if (!formData.image && !savedImage) {
      newErrors.image = "Image is required.";
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
      data.append("is_selected", formData.is_selected);

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (photo) {
        await updateLifeAtCignesPhoto(photo.id, data);
      } else {
        await createLifeAtCignesPhoto(data);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save photo:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save photo."
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
      title={photo ? "Edit Photo" : "Add Photo"}
      subtitle={
        photo
          ? "Update this Life at Cignes photo"
          : "Add a photo for the home page's Life at Cignes section"
      }
      submitLabel={photo ? "Update Photo" : "Add Photo"}
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={1}>
          <FormField
            required
            label="Title"
            placeholder="Class in session"
            helperText="Shown on the website as the photo's caption."
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title || ""}
          />

          <ImageUpload
            name="image"
            label="Image"
            emptyText="No image yet. Landscape (4:3) photos fit the website best."
            picked={formData.image}
            savedUrl={savedImage}
            savedName={mediaFileName(photo?.image_url, photo?.image)}
            error={errors.image || ""}
            saving={saving}
            onChange={handleImage}
            onRemove={removeImage}
          />

          <Field orientation="horizontal" className="w-fit">
            <Switch
              checked={formData.is_selected}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  is_selected: checked,
                }))
              }
              name="is_selected"
            />
            <FieldLabel>Show on the website</FieldLabel>
          </Field>
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default LifeAtCignesForm;
