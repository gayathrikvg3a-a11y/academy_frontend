import { useEffect, useRef, useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import {
  createVacancy,
  updateVacancy,
} from "../api/vacancyApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import FormSection from "./common/FormSection";

import { JOB_TYPE_OPTIONS } from "../utils/vacancies";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

const initialForm = {
  title: "",
  department: "",
  location: "",
  job_type: "FULL_TIME",
  experience: "",
  vacancies: 1,
  salary: "",
  description: "",
  responsibilities: "",
  requirements: "",
  display_order: 1,
  close_date: "",
  is_active: true,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Job title",
  department: "Department",
  location: "Location",
  job_type: "Job type",
  vacancies: {
    label: "Number of openings",
    min: 1,
  },
};

export default function VacancyForm({
  open,
  onClose,
  onSuccess,
  vacancy = null,
}) {
  const isEdit = Boolean(vacancy);

  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (vacancy) {
      // Mapped field by field rather than spread, so read-only server fields
      // (id, timestamps) never ride along into the PUT body.
      setFormData({
        title: vacancy.title || "",
        department: vacancy.department || "",
        location: vacancy.location || "",
        job_type: vacancy.job_type || "FULL_TIME",
        experience: vacancy.experience || "",
        vacancies: vacancy.vacancies ?? 1,
        salary: vacancy.salary || "",
        description: vacancy.description || "",
        responsibilities: vacancy.responsibilities || "",
        requirements: vacancy.requirements || "",
        display_order: vacancy.display_order ?? 1,
        // A date input only takes YYYY-MM-DD; the slice keeps it working if
        // the backend ever returns a full timestamp.
        close_date: (vacancy.close_date || "").slice(0, 10),
        is_active: vacancy.is_active ?? true,
      });
    } else {
      setFormData(initialForm);
    }

    setErrors({});
  }, [vacancy, open]);

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

      // The endpoint takes JSON, so numbers go as numbers and an unset close
      // date as null rather than the date input's empty string.
      const payload = {
        ...formData,
        vacancies: Number(formData.vacancies) || 0,
        display_order: Number(formData.display_order) || 0,
        close_date: formData.close_date || null,
      };

      if (isEdit) {
        await updateVacancy(vacancy.id, payload);
      } else {
        await createVacancy(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save vacancy:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save vacancy."
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
      title={isEdit ? "Edit Vacancy" : "Post Vacancy"}
      subtitle={
        isEdit
          ? "Update this job opening"
          : "Publish a new job opening"
      }
      submitLabel={
        isEdit ? "Update Vacancy" : "Publish Vacancy"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= ROLE ================= */}

        <FormSection
          title="Role"
          columns={2}
        >
          <FormField
            required
            label="Job Title"
            placeholder="Python Django Developer"
            className="sm:col-span-2"
            {...fieldProps("title")}
          />

          <FormField
            required
            label="Department"
            placeholder="IT"
            {...fieldProps("department")}
          />

          <FormField
            required
            label="Location"
            placeholder="Kochi, Kerala"
            {...fieldProps("location")}
          />

          <FormSelect
            required
            label="Job Type"
            {...fieldProps("job_type")}
            options={JOB_TYPE_OPTIONS}
          />

          <FormField
            label="Experience"
            placeholder="2-4 Years"
            {...fieldProps("experience")}
          />
        </FormSection>

        {/* ================= OPENING ================= */}

        <FormSection
          title="Opening"
          description="How many people are being hired, on what terms, and until when."
          columns={2}
        >
          <FormField
            required
            type="number"
            min={1}
            label="Number of Openings"
            placeholder="3"
            {...fieldProps("vacancies")}
          />

          <FormField
            label="Salary"
            placeholder="₹30,000 - ₹45,000"
            {...fieldProps("salary")}
          />

          <FormField
            type="date"
            label="Close Date"
            helperText="Applications stop after this date."
            {...fieldProps("close_date")}
          />

          <FormField
            type="number"
            label="Display Order"
            placeholder="1"
            helperText="Lower numbers list first."
            {...fieldProps("display_order")}
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
            <FieldLabel>
              {isEdit ? "Published" : "Publish immediately"}
            </FieldLabel>
          </Field>
        </FormSection>

        {/* ================= DESCRIPTION ================= */}

        <FormSection
          title="Job Description"
          columns={1}
        >
          <FormField
            multiline
            rows={3}
            label="Description"
            placeholder="We are looking for an experienced Django developer."
            {...fieldProps("description")}
          />

          <FormField
            multiline
            rows={4}
            label="Responsibilities"
            placeholder="Build REST APIs and maintain backend."
            {...fieldProps("responsibilities")}
          />

          <FormField
            multiline
            rows={4}
            label="Requirements"
            placeholder="Python, Django, DRF, PostgreSQL."
            {...fieldProps("requirements")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}
