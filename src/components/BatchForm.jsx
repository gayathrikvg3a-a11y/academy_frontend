import { useEffect, useRef, useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import FormSection from "./common/FormSection";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  validateRequired,
} from "../utils/formErrors";

const initialForm = {
  batch_name: "",
  batch_code: "",
  course: "",
  trainer: "",
  session: "MORNING",
  capacity: 30,
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  description: "",
  status: "UPCOMING",
  is_active: true,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  batch_name: "Batch name",
  batch_code: "Batch code",
  course: "Course",
};

function BatchForm({
  open,
  onClose,
  onSave,
  batch = null,
  courses = [],
  saving = false,
  serverErrors = null,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (batch) {
      setFormData({
        ...batch,
      });
    } else {
      setFormData(initialForm);
    }

    setErrors({});
  }, [batch, open]);

  useEffect(() => {
    if (!serverErrors) return;

    setErrors(serverErrors);

    focusFirstError(serverErrors, contentRef);
  }, [serverErrors]);

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

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    // A batch that ends before it starts is always a mistake — flag it on the
    // end date, which is the field the user needs to change.
    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date < formData.start_date
    ) {
      newErrors.end_date =
        "End date must be on or after the start date.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave(formData);
  };

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
      title={batch ? "Edit Batch" : "Add Batch"}
      subtitle={
        batch
          ? "Update batch information"
          : "Create a new academy batch"
      }
      submitLabel={
        batch ? "Update Batch" : "Save Batch"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= BASIC INFORMATION ================= */}

        <FormSection
          title="Basic Information"
          columns={2}
        >
          <FormField
            required
            label="Batch Name"
            placeholder="Web Dev — Sep 2026"
            {...fieldProps("batch_name")}
          />

          <FormField
            required
            label="Batch Code"
            placeholder="WEBDEV-0926"
            {...fieldProps("batch_code")}
          />

          <FormSelect
            required
            label="Course"
            {...fieldProps("course")}
            placeholder="Select Course"
            options={[
              { value: "", label: "Select Course" },
              ...courses.map((course) => ({
                value: course.id,
                label: course.name,
              })),
            ]}
          />

          <FormField
            label="Trainer"
            placeholder="Trainer name"
            {...fieldProps("trainer")}
          />
        </FormSection>

        {/* ================= SCHEDULE ================= */}

        <FormSection
          title="Schedule"
          columns={3}
        >
          <FormSelect
            label="Session"
            {...fieldProps("session")}
            options={[
              { value: "MORNING", label: "Morning" },
              { value: "EVENING", label: "Evening" },
            ]}
          />

          <FormField
            type="number"
            label="Capacity"
            placeholder="30"
            {...fieldProps("capacity")}
          />

          <FormSelect
            label="Status"
            {...fieldProps("status")}
            options={[
              { value: "UPCOMING", label: "Upcoming" },
              { value: "ONGOING", label: "Ongoing" },
              { value: "COMPLETED", label: "Completed" },
            ]}
          />

          <FormField
            type="date"
            label="Start Date"
            {...fieldProps("start_date")}
          />

          <FormField
            type="date"
            label="End Date"
            {...fieldProps("end_date")}
          />

          {/* Spacer: keeps the time pair on its own row under the date pair */}
          <div aria-hidden />

          <FormField
            type="time"
            label="Start Time"
            placeholder="09:30 AM"
            {...fieldProps("start_time")}
          />

          <FormField
            type="time"
            label="End Time"
            placeholder="11:30 AM"
            {...fieldProps("end_time")}
          />
        </FormSection>

        {/* ================= DESCRIPTION ================= */}

        <FormSection
          title="Description"
          columns={1}
        >
          <FormField
            multiline
            rows={4}
            label="Description"
            placeholder="What this batch covers and who it is for…"
            {...fieldProps("description")}
          />

          <Field orientation="horizontal" className="w-fit">
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

export default BatchForm;
