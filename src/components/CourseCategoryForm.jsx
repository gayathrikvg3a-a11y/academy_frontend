import { useEffect, useRef, useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import {
  createCourseCategory,
  getCourseCategory,
  updateCourseCategory,
} from "../api/courseCategoryApi";

import CourseFee from "./common/CourseFee";
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
  name: "",
  description: "",
  display_order: 1,
  is_active: true,
};

const toForm = (category) => ({
  name: category.name || "",
  description: category.description || "",
  display_order: category.display_order ?? 1,
  is_active: category.is_active ?? true,
});

// ================= REQUIRED FIELDS =================

const requiredFields = {
  name: "Category name",
};

function CourseCategoryForm({
  open,
  category,
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  // The list row has no courses, so an edit also loads the category from its
  // own endpoint.
  useEffect(() => {
    if (!open) return;

    setErrors({});
    setCourses([]);

    if (!category) {
      setFormData(initialForm);
      return;
    }

    setFormData(toForm(category));

    let cancelled = false;

    setLoading(true);

    getCourseCategory(category.id)
      .then((response) => {
        if (cancelled) return;

        setFormData(toForm(response.data));
        setCourses(response.data.courses || []);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Failed to load course category:", error);

        setErrors({
          [FORM_ERROR_KEY]:
            "Couldn't load this category's courses.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, open]);

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
    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});

      const payload = {
        ...formData,
        display_order: Number(formData.display_order) || 0,
      };

      if (category) {
        await updateCourseCategory(category.id, payload);
      } else {
        await createCourseCategory(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save course category:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save course category."
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
      title={category ? "Edit Course Category" : "Add Course Category"}
      subtitle={
        category
          ? "Update category information"
          : "Create a new category to group courses"
      }
      submitLabel={
        category ? "Update Category" : "Create Category"
      }
      onSubmit={handleSubmit}
      saving={saving}
      loading={loading}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        <FormSection columns={1}>
          <FormField
            required
            label="Category Name"
            placeholder="Our Programs"
            {...fieldProps("name")}
          />

          <FormField
            multiline
            rows={3}
            label="Description"
            placeholder="What kind of courses sit under this category…"
            {...fieldProps("description")}
          />

          <FormField
            type="number"
            label="Display Order"
            placeholder="1"
            helperText="Lower numbers list first."
            {...fieldProps("display_order")}
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

        {/* ================= COURSES ================= */}

        {/* Read-only: a course joins a category from its own form. */}
        {category && (
          <FormSection
            columns={1}
            title="Courses"
            description="A course is added to a category from the course's own form."
          >
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses in this category yet.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {courses.map((course) => (
                  <li
                    key={course.id}
                    className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{course.name}</p>

                      <p className="text-muted-foreground">
                        {[
                          course.course_code,
                          course.duration &&
                            `${course.duration} ${course.duration_type || ""}`.trim(),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    <CourseFee
                      fee={course.course_fee}
                      discount={course.discount_fee}
                      align="end"
                      className="shrink-0"
                    />
                  </li>
                ))}
              </ul>
            )}
          </FormSection>
        )}

      </div>
    </FormDialog>
  );
}

export default CourseCategoryForm;
