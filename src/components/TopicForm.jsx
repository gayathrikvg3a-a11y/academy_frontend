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
  module: "",
  title: "",
  description: "",
  topic_order: 1,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  title: "Topic title",
  topic_order: {
    label: "Display order",
    min: 1,
  },
};

function TopicForm({
  open,
  onClose,
  onSave,
  topic = null,
  module = null,
  saving = false,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (topic) {
      setFormData({
        module: module?.id,
        title: topic.title,
        description: topic.description || "",
        topic_order: topic.topic_order,
      });
    } else {
      // A new topic goes to the end of the module's list.
      const lastOrder = Math.max(
        0,
        ...(module?.topics ?? []).map((item) => item.topic_order)
      );

      setFormData({
        ...initialForm,
        module: module?.id,
        topic_order: lastOrder + 1,
      });
    }

    setErrors({});
  }, [topic, module, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "topic_order"
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
      title={topic ? "Edit Topic" : "Add Topic"}
      subtitle={
        module
          ? `${topic ? "Update a topic in" : "Add a topic to"} ${module.title}`
          : undefined
      }
      submitLabel={
        topic ? "Update Topic" : "Save Topic"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={1}>
          <FormField
            required
            label="Topic Title"
            placeholder="Introduction to Python"
            {...fieldProps("title")}
          />

          <FormField
            multiline
            rows={3}
            label="Description"
            placeholder="What this topic covers…"
            {...fieldProps("description")}
          />

          <FormField
            required
            type="number"
            label="Display Order"
            placeholder="1"
            {...fieldProps("topic_order")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default TopicForm;
