import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

import { createCaseStudy, updateCaseStudy } from "../api/caseStudyApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";
import ImageUpload from "./common/ImageUpload";
import SlugField from "./common/SlugField";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";
import { mediaFileName, resolveMediaUrl } from "../utils/mediaUrl";
import {
  currentSlug,
  slugify,
  slugInput,
  takenSlugs,
} from "../utils/slug";

// A new case study is dated today unless changed. Formatted locally rather
// than with toISOString, which is UTC and gives yesterday's date before
// 5:30 AM IST.
const newForm = () => ({
  title: "",
  short_description: "",
  description: "",
  case_study_date: format(new Date(), "yyyy-MM-dd"),
  image: null,
  slug: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  og_image: null,
});

// A case study's slug is made from its title, as a course's is from its name.
const titleOf = (caseStudy) => caseStudy.title;

// ================= REQUIRED FIELDS =================

// The short description is optional, as a blog post's is: without one, the
// case study's first paragraph stands in for it on its card.
const requiredFields = {
  title: "Case study title",
  description: "Description",
  case_study_date: "Case study date",
};

function CaseStudyForm({
  open,
  caseStudy,
  caseStudies = [],
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(newForm);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  // Whether the slug can be typed (see SlugField). Locked, a new case study's
  // is made from its title as it's typed.
  const [slugUnlocked, setSlugUnlocked] = useState(false);

  // Whether a saved case study's slug follows its title as it's typed, as a
  // new one's does: from when the suggested slug is taken until the slug is
  // typed in or put back.
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(false);

  // The slug the form opened with, which locking it again puts back.
  const openingSlug = (data) =>
    caseStudy
      ? currentSlug(caseStudy, caseStudies, titleOf)
      : slugify(data.title);

  useEffect(() => {
    if (!open) return;

    setSlugUnlocked(false);
    setSlugFollowsTitle(false);

    // The images only ever hold a newly picked file; the ones already saved
    // are read off the case study itself.
    setFormData(
      caseStudy
        ? {
            title: caseStudy.title || "",
            short_description: caseStudy.short_description || "",
            description: caseStudy.description || "",
            case_study_date: caseStudy.case_study_date || "",
            image: null,
            slug: currentSlug(caseStudy, caseStudies, titleOf),
            seo_title: caseStudy.seo_title || "",
            seo_description: caseStudy.seo_description || "",
            seo_keywords: caseStudy.seo_keywords || "",
            canonical_url: caseStudy.canonical_url || "",
            og_image: null,
          }
        : newForm()
    );

    setErrors({});
  }, [caseStudy, open]);

  // Flags a slug another case study already has, there and then rather than
  // on save, or clears the flag.
  const flagTakenSlug = (previousErrors, slug) =>
    takenSlugs(caseStudies, caseStudy, titleOf).has(slug)
      ? {
          ...previousErrors,
          slug: "Another case study already has this slug.",
        }
      : clearFieldError(previousErrors, "slug");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // A new case study's slug is made from its title as it's typed, until the
    // slug is unlocked; a saved one's once its suggested slug is taken.
    const slugFollows =
      name === "title" &&
      (caseStudy ? slugFollowsTitle : !slugUnlocked);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(slugFollows && { slug: slugify(value) }),
    }));

    setErrors((previousErrors) => {
      const nextErrors = clearFieldError(previousErrors, name);

      return caseStudy && slugFollows
        ? flagTakenSlug(nextErrors, slugify(value))
        : nextErrors;
    });
  };

  const lockSlug = () => {
    setSlugUnlocked(false);
    setSlugFollowsTitle(false);

    setFormData((prev) => ({
      ...prev,
      slug: openingSlug(prev),
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, "slug")
    );
  };

  // Typing a slug stops it following the title.
  const handleSlugChange = (e) => {
    const slug = slugInput(e.target.value);

    setSlugFollowsTitle(false);

    setFormData((prev) => ({
      ...prev,
      slug,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, "slug")
    );
  };

  // A saved case study that's been retitled is offered the slug its new
  // title gives, unless that's the one it already has.
  const titleSlug = slugify(formData.title);
  const suggestedSlug =
    caseStudy &&
    titleSlug &&
    titleSlug !== slugify(caseStudy.title) &&
    titleSlug !== formData.slug
      ? titleSlug
      : "";

  // Unlocked with the offered slug filled in, which then follows the title
  // as it's edited further. Undo puts the old one back.
  const takeSuggestedSlug = () => {
    setSlugUnlocked(true);
    setSlugFollowsTitle(true);

    setFormData((prev) => ({
      ...prev,
      slug: suggestedSlug,
    }));

    setErrors((previousErrors) =>
      flagTakenSlug(previousErrors, suggestedSlug)
    );
  };

  // The slug as it's saved: tidied, or made from the title when left empty.
  const finalSlug = (data) =>
    slugify(data.slug) || slugify(data.title);

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

  const imageProps = (name) => ({
    name,
    picked: formData[name],
    savedUrl: resolveMediaUrl(
      caseStudy?.[`${name}_url`],
      caseStudy?.[name]
    ),
    savedName: mediaFileName(
      caseStudy?.[`${name}_url`],
      caseStudy?.[name]
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

    // Two case studies with one slug would share one address. A saved one's
    // locked slug is the one it already has, so only a new or unlocked one
    // can clash; a locked one is changed through the title.
    if (
      (!caseStudy || slugUnlocked) &&
      takenSlugs(caseStudies, caseStudy, titleOf).has(finalSlug(formData))
    ) {
      if (slugUnlocked) {
        newErrors.slug = "Another case study already has this slug.";
      } else {
        newErrors.title =
          "Another case study already has this address. Change the title a little.";
      }
    }

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

      const data = new FormData();

      data.append("title", formData.title);
      data.append("short_description", formData.short_description);
      data.append("description", formData.description);
      data.append("case_study_date", formData.case_study_date);
      data.append("slug", finalSlug(formData));
      data.append("seo_title", formData.seo_title);
      data.append("seo_description", formData.seo_description);
      data.append("seo_keywords", formData.seo_keywords);
      data.append("canonical_url", formData.canonical_url);

      // Only a newly picked file is sent; leaving one out keeps the saved one.
      if (formData.image) {
        data.append("image", formData.image);
      }

      if (formData.og_image) {
        data.append("og_image", formData.og_image);
      }

      // A new case study is saved active. Editing one leaves it as it is.
      if (caseStudy) {
        await updateCaseStudy(caseStudy.id, data);
      } else {
        data.append("is_active", "true");

        await createCaseStudy(data);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save case study:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save case study."
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
      title={caseStudy ? "Edit Case Study" : "Add Case Study"}
      subtitle={
        caseStudy
          ? "Update case study"
          : "Write a new case study for the website"
      }
      submitLabel={
        caseStudy ? "Update Case Study" : "Create Case Study"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
      maxWidth="lg"
    >
      <div ref={contentRef}>

        {/* ================= CASE STUDY ================= */}

        <FormSection
          title="Case Study"
          columns={1}
        >
          <FormField
            required
            label="Title"
            placeholder="From Fresher to Full Stack Developer"
            {...fieldProps("title")}
          />

          <FormField
            required
            type="date"
            label="Case Study Date"
            className="sm:max-w-60"
            {...fieldProps("case_study_date")}
          />

          <FormField
            multiline
            rows={2}
            label="Short Description"
            placeholder="One or two sentences for the case study card"
            helperText="Shown on the website's case study cards. Left empty, the first paragraph of the description is used."
            {...fieldProps("short_description")}
          />

          <FormField
            required
            multiline
            label="Description"
            placeholder="The full case study…"
            helperText="Each line becomes a paragraph on the website."
            className="min-h-48"
            {...fieldProps("description")}
          />
        </FormSection>

        {/* ================= IMAGE ================= */}

        <FormSection
          title="Cover Image"
          columns={1}
        >
          <ImageUpload
            label="Image"
            emptyText="No image yet."
            {...imageProps("image")}
          />
        </FormSection>

        {/* ================= SEO ================= */}

        <FormSection
          title="SEO"
          columns={2}
        >
          <div className="sm:col-span-2">
            <SlugField
              value={formData.slug}
              error={errors.slug}
              saving={saving}
              saved={!!caseStudy}
              unlocked={slugUnlocked}
              openingSlug={openingSlug(formData)}
              path="/case-studies/"
              what="case study"
              source="case study title"
              placeholder="from-fresher-to-full-stack-developer"
              suggestedSlug={suggestedSlug}
              following={slugFollowsTitle}
              onChange={handleSlugChange}
              onBlur={tidySlug}
              onUnlock={() => setSlugUnlocked(true)}
              onLock={lockSlug}
              onUseSuggestion={takeSuggestedSlug}
            />
          </div>

          <FormField
            label="SEO Title"
            placeholder="From Fresher to Full Stack Developer | Cignes Academy"
            {...fieldProps("seo_title")}
          />

          <FormField
            label="SEO Keywords"
            placeholder="full stack developer, career change, placement"
            helperText="Separate keywords with commas."
            {...fieldProps("seo_keywords")}
          />

          <div className="sm:col-span-2">
            <FormField
              multiline
              rows={2}
              label="SEO Description"
              placeholder="What search results should say about this case study…"
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
              emptyText="No OG image yet. Link previews use the cover image."
              {...imageProps("og_image")}
            />
          </div>
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default CaseStudyForm;
