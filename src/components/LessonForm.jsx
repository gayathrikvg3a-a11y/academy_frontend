import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";
import FormSelect from "./common/FormSelect";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  validateRequired,
} from "../utils/formErrors";

const initialForm = {
  course: "",
  module: "",
  topic: "",
  lesson_title: "",
  description: "",
  lesson_order: 1,
  duration_minutes: "",
  video_url: "",
  notes: "",
  pdf_file: null,
  is_published: true,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  topic: "Topic",
  lesson_title: "Lesson title",
  lesson_order: {
    label: "Lesson order",
    min: 1,
  },
};

function LessonForm({
  open,
  onClose,
  onSave,
  lesson = null,
  courseId,
  moduleId,
  topicId,
  topics = [],
  saving = false,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lesson) {
      setFormData({
        course: lesson.course,
        module: lesson.module,
        topic: lesson.topic ?? "",
        lesson_title: lesson.lesson_title || "",
        description: lesson.description || "",
        lesson_order: lesson.lesson_order || 1,
        duration_minutes: lesson.duration_minutes || "",
        video_url: lesson.video_url || "",
        notes: lesson.notes || "",
        pdf_file: null,
        is_published: lesson.is_published,
      });
    } else {
      setFormData({
        ...initialForm,
        course: courseId,
        module: moduleId,
        topic: topicId ?? "",
      });
    }

    setErrors({});
  }, [lesson, open, courseId, moduleId, topicId]);

  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        pdf_file: files?.[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "lesson_order" ||
        name === "duration_minutes"
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

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      if (
        value !== null &&
        value !== "" &&
        value !== undefined
      ) {
        data.append(key, value);
      }
    });

    onSave(data);
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
      title={lesson ? "Edit Lesson" : "Add Lesson"}
      subtitle={
        lesson
          ? "Update lesson content"
          : "Add a lesson to this topic"
      }
      submitLabel={
        lesson ? "Update Lesson" : "Save Lesson"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection
          title="Lesson Details"
          columns={2}
        >
          <div className="sm:col-span-2">
            <FormSelect
              required
              label="Topic"
              {...fieldProps("topic")}
              placeholder="Select Topic"
              options={[
                { value: "", label: "Select Topic" },
                ...topics.map((topic) => ({
                  value: topic.id,
                  label: topic.title,
                })),
              ]}
            />
          </div>

          <FormField
            required
            label="Lesson Title"
            placeholder="Introduction to React"
            className="sm:col-span-2"
            {...fieldProps("lesson_title")}
          />

          <FormField
            multiline
            rows={3}
            label="Description"
            placeholder="What this lesson covers…"
            className="sm:col-span-2"
            {...fieldProps("description")}
          />

          <FormField
            required
            type="number"
            label="Lesson Order"
            placeholder="1"
            {...fieldProps("lesson_order")}
          />

          <FormField
            type="number"
            label="Duration (Minutes)"
            placeholder="45"
            {...fieldProps("duration_minutes")}
          />
        </FormSection>

        <FormSection
          title="Materials"
          columns={1}
        >
          <FormField
            label="Video URL"
            placeholder="https://youtube.com/watch?v=…"
            {...fieldProps("video_url")}
          />

          <FormField
            multiline
            rows={5}
            label="Notes"
            placeholder="Extra notes for this lesson…"
            {...fieldProps("notes")}
          />

          <div>
            <Button
              variant="outline"
              render={
                <label>
                  {formData.pdf_file
                    ? "Change PDF"
                    : "Upload PDF"}

                  <input
                    hidden
                    type="file"
                    name="pdf_file"
                    accept=".pdf"
                    onChange={handleChange}
                  />
                </label>
              }
            />

            {formData.pdf_file && (
              <p className="mt-1 text-sm text-muted-foreground">
                {formData.pdf_file.name}
              </p>
            )}
          </div>

          <Field orientation="horizontal" className="w-fit">
            <Checkbox
              checked={formData.is_published}
              name="is_published"
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  is_published: checked,
                }))
              }
            />
            <FieldLabel>Published</FieldLabel>
          </Field>
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default LessonForm;
