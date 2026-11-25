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

const initialFormData = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  venue: "",
  registration_link: "",
  is_active: true,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Event title",
  event_date: "Event date",
  venue: "Venue",
};

function EventForm({
  open,
  onClose,
  event,
  onSuccess,
}) {
  const isEdit = Boolean(event);

  const contentRef = useRef(null);

  const [formData, setFormData] =
    useState(initialFormData);

  const [banner, setBanner] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (event) {
      setFormData({
        title: event.title || "",
        description:
          event.description || "",
        event_date:
          event.event_date || "",
        event_time:
          event.event_time || "",
        venue: event.venue || "",
        registration_link:
          event.registration_link || "",
        is_active:
          event.is_active ?? true,
      });

      setPreview(
        event.banner_url || ""
      );
    } else {
      setFormData(initialFormData);

      setPreview("");
    }

    setBanner(null);

    setErrors({});
  }, [event, open]);

  // ================= INPUT CHANGE =================

  const handleChange = (changeEvent) => {
    const { name, value, checked, type } =
      changeEvent.target;

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

  // ================= BANNER =================

  const handleBannerChange = (changeEvent) => {
    const file = changeEvent.target.files?.[0];

    if (!file) return;

    setBanner(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  // ================= VALIDATION =================

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

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const data = new FormData();

      Object.entries(formData).forEach(
        ([key, value]) => {
          data.append(key, value);
        }
      );

      if (banner) {
        data.append("banner", banner);
      }

      if (isEdit) {
        await api.put(
          `events/${event.id}/`,
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      } else {
        await api.post(
          "events/",
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      if (
        typeof onSuccess === "function"
      ) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        "Failed to save event:",
        error
      );

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save event."
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
    value: formData[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Event" : "Add Event"}
      subtitle={
        isEdit
          ? "Update event details"
          : "Publish a new academy event"
      }
      submitLabel={
        isEdit ? "Update Event" : "Save Event"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= EVENT DETAILS ================= */}

        <FormSection
          title="Event Details"
          columns={2}
        >
          <FormField
            required
            label="Event Title"
            placeholder="Tech Fest 2026"
            className="sm:col-span-2"
            {...fieldProps("title")}
          />

          <FormField
            multiline
            rows={4}
            label="Description"
            placeholder="What the event is about…"
            className="sm:col-span-2"
            {...fieldProps("description")}
          />

          <FormField
            required
            type="date"
            label="Event Date"
            {...fieldProps("event_date")}
          />

          <FormField
            type="time"
            label="Event Time"
            placeholder="10:00 AM"
            {...fieldProps("event_time")}
          />

          <FormField
            required
            label="Venue"
            placeholder="Main auditorium"
            {...fieldProps("venue")}
          />

          <FormField
            label="Registration Link"
            placeholder="https://example.com/register"
            {...fieldProps("registration_link")}
          />

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
            <FieldLabel>Active Event</FieldLabel>
          </Field>
        </FormSection>

        {/* ================= BANNER ================= */}

        <FormSection
          title="Event Banner"
          columns={1}
        >
          <div>
            <Button
              variant="outline"
              render={
                <label>
                  {preview
                    ? "Change Banner"
                    : "Upload Banner"}

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                  />
                </label>
              }
            />

            {preview && (
              <div className="mt-2">
                <p className="mb-1 text-sm text-muted-foreground">
                  Banner Preview
                </p>

                <img
                  src={preview}
                  alt="Banner Preview"
                  className="max-h-[250px] w-full rounded-lg border object-cover"
                />
              </div>
            )}
          </div>
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default EventForm;
