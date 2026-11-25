import { useEffect, useRef, useState } from "react";

import {
  createTestimonial,
  updateTestimonial,
} from "../api/testimonialApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";

import { DOMAIN_OPTIONS } from "../utils/staff";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

const initialForm = {
  name: "",
  domain: "",
  note: "",
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  name: "Student name",
  domain: "Domain",
  note: "Testimonial",
};

// The domain is free text, but suggesting the course areas keeps the same
// course from being spelled three ways on the website.
const DOMAIN_SUGGESTIONS = DOMAIN_OPTIONS
  .filter((option) => option.value !== "OTHER")
  .map((option) => option.label);

export default function TestimonialForm({
  open,
  testimonial = null,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(testimonial);

  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setFormData(
      testimonial
        ? {
            name: testimonial.name || "",
            domain: testimonial.domain || "",
            note: testimonial.note || "",
          }
        : initialForm
    );

    setErrors({});
  }, [testimonial, open]);

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
      name: formData.name.trim(),
      domain: formData.domain.trim(),
      note: formData.note.trim(),
    };

    try {
      setSaving(true);
      setErrors({});

      if (isEdit) {
        await updateTestimonial(testimonial.id, payload);
      } else {
        await createTestimonial(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save testimonial:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save testimonial."
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
      title={isEdit ? "Edit Testimonial" : "Add Testimonial"}
      subtitle={
        isEdit
          ? `Update ${testimonial.name}'s testimonial`
          : "Add what a student said about their course"
      }
      submitLabel={isEdit ? "Update Testimonial" : "Add Testimonial"}
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={2}>
          <FormField
            required
            label="Student Name"
            placeholder="Aromal"
            {...fieldProps("name")}
          />

          <FormField
            required
            label="Domain"
            placeholder="Flutter Development"
            list="testimonial-domains"
            autoComplete="off"
            {...fieldProps("domain")}
          />

          <datalist id="testimonial-domains">
            {DOMAIN_SUGGESTIONS.map((label) => (
              <option key={label} value={label} />
            ))}
          </datalist>

          <div className="sm:col-span-2">
            <FormField
              required
              multiline
              rows={5}
              label="Testimonial"
              placeholder="What the student said about the course, in their words…"
              {...fieldProps("note")}
            />
          </div>
        </FormSection>

      </div>
    </FormDialog>
  );
}
