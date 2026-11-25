import { useEffect, useRef, useState } from "react";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import CourseFeeOptions from "./CourseFeeOptions";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import FormSection from "./common/FormSection";
import ImageUpload from "./common/ImageUpload";
import SlugField from "./common/SlugField";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  validateRequired,
} from "../utils/formErrors";
import { mediaFileName, resolveMediaUrl } from "../utils/mediaUrl";
import {
  currentSlug,
  slugify,
  slugInput,
  takenSlugs,
} from "../utils/slug";

const initialForm = {
  name: "",
  course_code: "",
  category: "",
  mode: "ONLINE",
  language: "",
  level: "",
  duration: "",
  duration_type: "MONTHS",
  course_fee: "",
  discount_fee: "",
  display_order: 1,
  details: "",
  learning_outcomes: "",
  prerequisites: "",
  certificate_available: false,
  is_active: true,
  thumbnail: null,
  title: "",
  slug: "",
  short_description: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  og_image: null,
};

// ================= REQUIRED FIELDS =================

const requiredFields = {
  name: "Course name",
  course_code: "Course code",
  mode: "Mode",
  course_fee: {
    label: "Course fee",
    positive: true,
  },
};

function CourseForm({
  open,
  onClose,
  onSave,
  course = null,
  courses = [],
  categories = [],
  saving = false,
  serverErrors = null,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // Whether the slug can be typed (see SlugField). Locked, a new course's is
  // made from its name as it's typed.
  const [slugUnlocked, setSlugUnlocked] = useState(false);

  // Whether a saved course's slug follows its name as it's typed, as a new
  // one's does: from when the suggested slug is taken until the slug is typed
  // in or put back.
  const [slugFollowsName, setSlugFollowsName] = useState(false);

  // The slug the form opened with, which locking it again puts back.
  const openingSlug = (data) =>
    course
      ? currentSlug(course, courses)
      : slugify(data.name);

  useEffect(() => {
    setSlugUnlocked(false);
    setSlugFollowsName(false);

    if (course) {
      setFormData({
        ...initialForm,
        ...course,
        slug: currentSlug(course, courses),
        learning_outcomes:
          Array.isArray(course.learning_outcomes)
            ? course.learning_outcomes.join("\n")
            : "",
        prerequisites:
          Array.isArray(course.prerequisites)
            ? course.prerequisites.join("\n")
            : "",
      });
    } else {
      setFormData(initialForm);
    }

    setErrors({});
  }, [course, open]);

  // Validation errors raised by the API land here from the page that owns the
  // save call, and are shown under the fields they belong to.
  useEffect(() => {
    if (!serverErrors) return;

    setErrors(serverErrors);

    focusFirstError(serverErrors, contentRef);
  }, [serverErrors]);

  // Flags a slug another course already has, there and then rather than on
  // save, or clears the flag.
  const flagTakenSlug = (previousErrors, slug) =>
    takenSlugs(courses, course).has(slug)
      ? {
          ...previousErrors,
          slug: "Another course already has this slug.",
        }
      : clearFieldError(previousErrors, "slug");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    // A new course's slug is made from its name as it's typed, until the slug
    // is unlocked; a saved one's once its suggested slug is taken.
    const slugFollows =
      name === "name" &&
      (course ? slugFollowsName : !slugUnlocked);

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
      ...(slugFollows && { slug: slugify(value) }),
    }));

    setErrors((previousErrors) => {
      const nextErrors = clearFieldError(previousErrors, name);

      return course && slugFollows
        ? flagTakenSlug(nextErrors, slugify(value))
        : nextErrors;
    });
  };

  const lockSlug = () => {
    setSlugUnlocked(false);
    setSlugFollowsName(false);

    setFormData((prev) => ({
      ...prev,
      slug: openingSlug(prev),
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, "slug")
    );
  };

  // Typing a slug stops it following the name.
  const handleSlugChange = (e) => {
    const slug = slugInput(e.target.value);

    setSlugFollowsName(false);

    setFormData((prev) => ({
      ...prev,
      slug,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, "slug")
    );
  };

  // A saved course that's been renamed is offered the slug its new name
  // gives, unless that's the one it already has.
  const nameSlug = slugify(formData.name);
  const suggestedSlug =
    course &&
    nameSlug &&
    nameSlug !== slugify(course.name) &&
    nameSlug !== formData.slug
      ? nameSlug
      : "";

  // Unlocked with the offered slug filled in, which then follows the name
  // as it's edited further. Undo puts the old one back.
  const takeSuggestedSlug = () => {
    setSlugUnlocked(true);
    setSlugFollowsName(true);

    setFormData((prev) => ({
      ...prev,
      slug: suggestedSlug,
    }));

    setErrors((previousErrors) =>
      flagTakenSlug(previousErrors, suggestedSlug)
    );
  };

  // The slug as it's saved: tidied, or made from the name when left empty.
  const finalSlug = (data) =>
    slugify(data.slug) || slugify(data.name);

  const tidySlug = () => {
    setFormData((prev) => ({
      ...prev,
      slug: finalSlug(prev),
    }));
  };

  const handleImage = (e) => {
    const { name } = e.target;
    const picked = e.target.files?.[0] || null;

    // Cleared so the same file can be picked again after being removed.
    e.target.value = "";

    if (!picked) return;

    setFormData((prev) => ({
      ...prev,
      [name]: picked,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  // Dropping a picked file falls back to the image already saved, if any.
  const removeImage = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  // A saved image comes back as a URL, so only a File counts as picked.
  const pickedImage = (name) =>
    formData[name] instanceof File
      ? formData[name]
      : null;

  const imageProps = (name) => ({
    name,
    picked: pickedImage(name),
    savedUrl: resolveMediaUrl(
      course?.[`${name}_url`],
      course?.[name]
    ),
    savedName: mediaFileName(
      course?.[`${name}_url`],
      course?.[name]
    ),
    error: errors[name] || "",
    saving,
    onChange: handleImage,
    onRemove: removeImage,
  });

  const validate = () => {
    const newErrors = validateRequired(
      formData,
      requiredFields
    );

    // Two courses with one slug would share one address. A saved course's
    // locked slug is the one it already has, so only a new or unlocked one
    // can clash; a locked one is changed through the name.
    if (
      (!course || slugUnlocked) &&
      takenSlugs(courses, course).has(finalSlug(formData))
    ) {
      if (slugUnlocked) {
        newErrors.slug = "Another course already has this slug.";
      } else {
        newErrors.name =
          "Another course already has this address. Change the name a little.";
      }
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

    onSave({
      ...formData,
      slug: finalSlug(formData),
      // A saved image comes back as a URL, which the API won't take as an
      // upload — only a newly picked file is sent. Left null otherwise, which
      // keeps it out of the request altogether.
      thumbnail: pickedImage("thumbnail"),
      og_image: pickedImage("og_image"),
      learning_outcomes: formData.learning_outcomes
        .split("\n")
        .filter(Boolean),
      prerequisites: formData.prerequisites
        .split("\n")
        .filter(Boolean),
    });
  };

  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: errors[name] || "",
  });

  // Inactive categories aren't offered for new picks, but a course already
  // filed under one keeps showing it rather than a blank select.
  const categoryOptions = categories
    .filter(
      (category) =>
        category.is_active ||
        String(category.id) === String(formData.category)
    )
    .map((category) => ({
      value: category.id,
      label: category.name,
    }));

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={course ? "Edit Course" : "Add Course"}
      subtitle={
        course
          ? "Update course information"
          : "Create a new academy course"
      }
      submitLabel={
        course ? "Update Course" : "Save Course"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
      maxWidth="lg"
    >
      <div ref={contentRef}>

        {/* ================= BASIC INFORMATION ================= */}

        <FormSection
          title="Basic Information"
          columns={2}
        >
          <FormField
            required
            label="Course Name"
            placeholder="Full Stack Development"
            {...fieldProps("name")}
          />

          <FormField
            required
            label="Course Code"
            placeholder="FSD-101"
            {...fieldProps("course_code")}
          />

          <FormSelect
            label="Category"
            {...fieldProps("category")}
            placeholder="Select Category"
            options={[
              { value: "", label: "Select Category" },
              ...categoryOptions,
            ]}
          />

          <FormSelect
            required
            label="Mode"
            {...fieldProps("mode")}
            options={[
              { value: "ONLINE", label: "Online" },
              { value: "OFFLINE", label: "Offline" },
              { value: "ONLINE_OFFLINE", label: "Online / Offline" },
            ]}
          />

          <FormField
            type="number"
            label="Display Order"
            placeholder="1"
            {...fieldProps("display_order")}
          />
        </FormSection>

        {/* ================= DURATION AND FEE ================= */}

        <FormSection
          title="Duration & Fee"
          columns={3}
        >
          <FormField
            type="number"
            label="Duration"
            placeholder="6"
            {...fieldProps("duration")}
          />

          <FormSelect
            label="Duration Type"
            {...fieldProps("duration_type")}
            options={[
              { value: "DAYS", label: "Days" },
              { value: "WEEKS", label: "Weeks" },
              { value: "MONTHS", label: "Months" },
              { value: "YEARS", label: "Years" },
            ]}
          />

          <FormField
            required
            type="number"
            label="Course Fee"
            placeholder="60000"
            {...fieldProps("course_fee")}
          />

          <FormField
            type="number"
            label="Discount Fee"
            placeholder="54000"
            {...fieldProps("discount_fee")}
          />
        </FormSection>

        {/* ================= DISCOUNTS ================= */}
        {/*
          Fee options are nested under a course, so they can only be managed
          once one exists — the section is absent while adding. Each row saves
          itself; none of this rides along with the dialog's own submit.
        */}

        {course && (
          <CourseFeeOptions courseId={course.id} />
        )}

        {/* ================= CONTENT ================= */}

        <FormSection
          title="Course Content"
          columns={1}
        >
          <FormField
            multiline
            rows={4}
            label="Description"
            placeholder="What this course covers and who it is for…"
            {...fieldProps("details")}
          />

          <FormField
            multiline
            rows={4}
            label="Learning Outcomes (One per line)"
            placeholder={"Build and deploy a full stack app\nWrite REST APIs with Django"}
            {...fieldProps("learning_outcomes")}
          />

          <FormField
            multiline
            rows={4}
            label="Prerequisites (One per line)"
            placeholder={"Basic computer knowledge\nFamiliarity with HTML and CSS"}
            {...fieldProps("prerequisites")}
          />
        </FormSection>

        {/* ================= SETTINGS ================= */}

        <FormSection
          title="Settings"
          columns={1}
        >
          <div className="flex flex-wrap gap-4">
            <Field orientation="horizontal" className="w-fit">
              <Switch
                checked={formData.certificate_available}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    certificate_available: checked,
                  }))
                }
                name="certificate_available"
              />
              <FieldLabel>Certificate Available</FieldLabel>
            </Field>

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
          </div>

          <ImageUpload
            label="Thumbnail"
            emptyText="No thumbnail yet."
            {...imageProps("thumbnail")}
          />
        </FormSection>

        {/* ================= SEO ================= */}

        <FormSection
          title="SEO"
          columns={2}
        >
          {/* Title is hidden for now: the course name is its title. It stays
              in the form's data, so a saved one isn't lost on edit. */}

          <div className="sm:col-span-2">
            <SlugField
              value={formData.slug}
              error={errors.slug}
              saving={saving}
              saved={!!course}
              unlocked={slugUnlocked}
              openingSlug={openingSlug(formData)}
              path="/courses/"
              what="course"
              source="course name"
              placeholder="full-stack-development"
              suggestedSlug={suggestedSlug}
              following={slugFollowsName}
              onChange={handleSlugChange}
              onBlur={tidySlug}
              onUnlock={() => setSlugUnlocked(true)}
              onLock={lockSlug}
              onUseSuggestion={takeSuggestedSlug}
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              multiline
              rows={2}
              label="Short Description"
              placeholder="A one-line summary of the course…"
              {...fieldProps("short_description")}
            />
          </div>

          <FormField
            label="SEO Title"
            placeholder="Full Stack Development Course | Cignes Academy"
            {...fieldProps("seo_title")}
          />

          <FormField
            label="SEO Keywords"
            placeholder="full stack course, python, react"
            helperText="Separate keywords with commas."
            {...fieldProps("seo_keywords")}
          />

          <div className="sm:col-span-2">
            <FormField
              multiline
              rows={2}
              label="SEO Description"
              placeholder="What search results should say about this course…"
              {...fieldProps("seo_description")}
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              type="url"
              label="Canonical URL"
              placeholder="https://"
              helperText="Leave blank. Only set this when the content was first published at another address."
              {...fieldProps("canonical_url")}
            />
          </div>

          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium">OG Image</p>

            <ImageUpload
              label="OG Image"
              emptyText="No OG image yet. Link previews use the thumbnail."
              {...imageProps("og_image")}
            />
          </div>
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default CourseForm;
