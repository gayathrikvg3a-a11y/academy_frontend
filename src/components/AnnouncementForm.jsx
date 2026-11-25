import { useEffect, useRef, useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import {
  createAnnouncement,
  updateAnnouncement,
} from "../api/announcementApi";

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
  is_important: false,
  is_active: true,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Title",
  description: "Description",
};

export default function AnnouncementForm({
  open,
  announcement = null,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(announcement);

  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    // Mapped field by field rather than spread, so read-only server fields
    // (id, published_at, updated_at) never ride along into the PATCH body.
    setFormData(
      announcement
        ? {
            title: announcement.title || "",
            description: announcement.description || "",
            is_important: announcement.is_important ?? false,
            is_active: announcement.is_active ?? true,
          }
        : initialForm
    );

    setErrors({});
  }, [announcement, open]);

  // ================= INPUT CHANGE =================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  const handleToggle = (name) => (checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ================= VALIDATION =================

  const validate = () => {
    const newErrors = validateRequired(formData, requiredFields);

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      is_important: formData.is_important,
      is_active: formData.is_active,
    };

    try {
      setSaving(true);
      setErrors({});

      if (isEdit) {
        await updateAnnouncement(announcement.id, payload);
      } else {
        await createAnnouncement(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save announcement:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save announcement."
      );

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
    }
  };

  // ================= FIELD PROPS =================

  const fieldProps = (name) => ({
    name,
    value: formData[name] ?? "",
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Announcement" : "New Announcement"}
      subtitle={
        isEdit
          ? "Update this announcement"
          : "Post a notice for everyone to see"
      }
      submitLabel={isEdit ? "Update Announcement" : "Post Announcement"}
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={1}>
          <FormField
            required
            label="Title"
            placeholder="Holiday Announcement"
            {...fieldProps("title")}
          />

          <FormField
            required
            multiline
            rows={5}
            label="Description"
            placeholder="The office will remain closed on Friday due to a public holiday…"
            {...fieldProps("description")}
          />

          <div className="flex flex-wrap gap-4">
            <Field orientation="horizontal" className="w-fit">
              <Switch
                checked={formData.is_important}
                onCheckedChange={handleToggle("is_important")}
                name="is_important"
              />
              <FieldLabel>Mark as important</FieldLabel>
            </Field>

            <Field orientation="horizontal" className="w-fit">
              <Switch
                checked={formData.is_active}
                onCheckedChange={handleToggle("is_active")}
                name="is_active"
              />
              <FieldLabel>
                {isEdit ? "Published" : "Publish immediately"}
              </FieldLabel>
            </Field>
          </div>
        </FormSection>

      </div>
    </FormDialog>
  );
}
