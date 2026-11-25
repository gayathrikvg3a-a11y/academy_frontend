import { useEffect, useRef, useState } from "react";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  validateRequired,
} from "../utils/formErrors";

const initialForm = {
  course: "",
  title: "",
  description: "",
  module_order: 1,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Module title",
  module_order: {
    label: "Display order",
    min: 1,
  },
};

function ModuleForm({
  open,
  onClose,
  onSave,
  module = null,
  courseId,
  saving = false,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (module) {
      setFormData({
        course: module.course,
        title: module.title,
        description: module.description || "",
        module_order: module.module_order,
      });
    } else {
      setFormData({
        ...initialForm,
        course: courseId,
      });
    }

    setErrors({});
  }, [module, courseId, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "module_order"
          ? Number(value)
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
    value: formData[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={module ? "Edit Module" : "Add Module"}
      subtitle={
        module
          ? "Update module information"
          : "Add a module to this course"
      }
      submitLabel={
        module ? "Update Module" : "Save Module"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={1}>
          <FormField
            required
            label="Module Title"
            placeholder="Module 1 — Basics"
            {...fieldProps("title")}
          />

          <FormField
            multiline
            rows={4}
            label="Description"
            placeholder="What this module covers…"
            {...fieldProps("description")}
          />

          <FormField
            required
            type="number"
            label="Display Order"
            placeholder="1"
            {...fieldProps("module_order")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default ModuleForm;
