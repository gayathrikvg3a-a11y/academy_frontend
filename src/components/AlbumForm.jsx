import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import api from "../api/axios";

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

const initialForm = {
  title: "",
  description: "",
  cover_image: null,
  is_active: true,
  display_order: 0,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Album title",
};

function AlbumForm({
  open,
  album,
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] =
    useState(initialForm);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (album) {
      setFormData({
        title: album.title || "",
        description:
          album.description || "",
        cover_image: null,
        is_active:
          album.is_active ?? true,
        display_order:
          album.display_order ?? 0,
      });
    } else {
      setFormData(initialForm);
    }

    setErrors({});
  }, [album, open]);

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

  const handleImage = (e) => {
    setFormData((prev) => ({
      ...prev,
      cover_image: e.target.files?.[0] || null,
    }));
  };

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const data = new FormData();

      data.append("title", formData.title);
      data.append(
        "description",
        formData.description
      );
      data.append(
        "is_active",
        formData.is_active
      );
      data.append(
        "display_order",
        formData.display_order
      );

      if (formData.cover_image) {
        data.append(
          "cover_image",
          formData.cover_image
        );
      }

      if (album) {
        await api.put(
          `albums/${album.id}/`,
          data
        );
      } else {
        await api.post(
          "albums/",
          data
        );
      }

      onSuccess();

    } catch (error) {
      console.error(
        "Failed to save album:",
        error
      );

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save album."
      );

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);

    } finally {
      setSaving(false);
    }
  };

  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={album ? "Edit Album" : "Add Album"}
      subtitle={
        album
          ? "Update album information"
          : "Create a new gallery album"
      }
      submitLabel={
        album ? "Update Album" : "Create Album"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={2}>
          <FormField
            required
            label="Album Title"
            placeholder="Convocation 2026"
            {...fieldProps("title")}
          />

          <FormField
            type="number"
            label="Display Order"
            placeholder="1"
            {...fieldProps("display_order")}
          />

          <FormField
            multiline
            rows={4}
            label="Description"
            placeholder="What this album contains…"
            className="sm:col-span-2"
            {...fieldProps("description")}
          />

          <div className="sm:col-span-2">
            <Button
              variant="outline"
              render={
                <label>
                  {formData.cover_image
                    ? "Change Cover Image"
                    : "Upload Cover Image"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                  />
                </label>
              }
            />

            {formData.cover_image && (
              <p className="mt-1 text-sm text-muted-foreground">
                {formData.cover_image.name}
              </p>
            )}
          </div>

          <Field orientation="horizontal" className="w-fit sm:col-span-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: checked,
                }))
              }
              name="is_active"
            />
            <FieldLabel>Active</FieldLabel>
          </Field>
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default AlbumForm;
