import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

import { createBlog, updateBlog } from "../api/blogApi";

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

// A new post is dated today unless changed. Formatted locally rather than
// with toISOString, which is UTC and gives yesterday's date before 5:30 AM IST.
const newForm = () => ({
  title: "",
  short_description: "",
  description: "",
  blog_date: format(new Date(), "yyyy-MM-dd"),
  image: null,
  slug: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  og_image: null,
});

// A post's slug is made from its title, as a course's is from its name.
const titleOf = (blog) => blog.title;

// ================= REQUIRED FIELDS =================

// The short description is optional: without one, the website uses the
// post's first paragraph on its blog cards instead.
const requiredFields = {
  title: "Blog title",
  description: "Description",
  blog_date: "Blog date",
};

function BlogForm({
  open,
  blog,
  blogs = [],
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(newForm);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  // Whether the slug can be typed (see SlugField). Locked, a new post's is
  // made from its title as it's typed.
  const [slugUnlocked, setSlugUnlocked] = useState(false);

  // Whether a saved post's slug follows its title as it's typed, as a new
  // one's does: from when the suggested slug is taken until the slug is typed
  // in or put back.
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(false);

  // The slug the form opened with, which locking it again puts back.
  const openingSlug = (data) =>
    blog
      ? currentSlug(blog, blogs, titleOf)
      : slugify(data.title);

  useEffect(() => {
    if (!open) return;

    setSlugUnlocked(false);
    setSlugFollowsTitle(false);

    // The images only ever hold a newly picked file; the ones already saved
    // are read off the blog itself.
    setFormData(
      blog
        ? {
            title: blog.title || "",
            short_description: blog.short_description || "",
            description: blog.description || "",
            blog_date: blog.blog_date || "",
            image: null,
            slug: currentSlug(blog, blogs, titleOf),
            seo_title: blog.seo_title || "",
            seo_description: blog.seo_description || "",
            seo_keywords: blog.seo_keywords || "",
            canonical_url: blog.canonical_url || "",
            og_image: null,
          }
        : newForm()
    );

    setErrors({});
  }, [blog, open]);

  // Flags a slug another post already has, there and then rather than on
  // save, or clears the flag.
  const flagTakenSlug = (previousErrors, slug) =>
    takenSlugs(blogs, blog, titleOf).has(slug)
      ? {
          ...previousErrors,
          slug: "Another post already has this slug.",
        }
      : clearFieldError(previousErrors, "slug");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // A new post's slug is made from its title as it's typed, until the slug
    // is unlocked; a saved one's once its suggested slug is taken.
    const slugFollows =
      name === "title" &&
      (blog ? slugFollowsTitle : !slugUnlocked);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(slugFollows && { slug: slugify(value) }),
    }));

    setErrors((previousErrors) => {
      const nextErrors = clearFieldError(previousErrors, name);

      return blog && slugFollows
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

  // A saved post that's been retitled is offered the slug its new title
  // gives, unless that's the one it already has.
  const titleSlug = slugify(formData.title);
  const suggestedSlug =
    blog &&
    titleSlug &&
    titleSlug !== slugify(blog.title) &&
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
      blog?.[`${name}_url`],
      blog?.[name]
    ),
    savedName: mediaFileName(
      blog?.[`${name}_url`],
      blog?.[name]
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

    // Two posts with one slug would share one address. A saved post's locked
    // slug is the one it already has, so only a new or unlocked one can
    // clash; a locked one is changed through the title.
    if (
      (!blog || slugUnlocked) &&
      takenSlugs(blogs, blog, titleOf).has(finalSlug(formData))
    ) {
      if (slugUnlocked) {
        newErrors.slug = "Another post already has this slug.";
      } else {
        newErrors.title =
          "Another post already has this address. Change the title a little.";
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
      data.append("blog_date", formData.blog_date);
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

      // A new blog is saved active. Editing one leaves it as it is.
      if (blog) {
        await updateBlog(blog.id, data);
      } else {
        data.append("is_active", "true");

        await createBlog(data);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save blog:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save blog."
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
      title={blog ? "Edit Blog" : "Add Blog"}
      subtitle={
        blog
          ? "Update blog post"
          : "Write a new post for the website"
      }
      submitLabel={
        blog ? "Update Blog" : "Create Blog"
      }
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
      maxWidth="lg"
    >
      <div ref={contentRef}>

        {/* ================= POST ================= */}

        <FormSection
          title="Post"
          columns={1}
        >
          <FormField
            required
            label="Title"
            placeholder="Learn Python Full Stack in 2026"
            {...fieldProps("title")}
          />

          <FormField
            required
            type="date"
            label="Blog Date"
            className="sm:max-w-60"
            {...fieldProps("blog_date")}
          />

          <FormField
            multiline
            rows={2}
            label="Short Description"
            placeholder="One or two sentences for the blog card"
            helperText="Shown on the website's blog cards. Left empty, the first paragraph of the description is used."
            {...fieldProps("short_description")}
          />

          <FormField
            required
            multiline
            label="Description"
            placeholder="The full post…"
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
              saved={!!blog}
              unlocked={slugUnlocked}
              openingSlug={openingSlug(formData)}
              path="/blogs/"
              what="post"
              source="post title"
              placeholder="learn-python-full-stack-in-2026"
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
            placeholder="Learn Python Full Stack in 2026 | Cignes Academy"
            {...fieldProps("seo_title")}
          />

          <FormField
            label="SEO Keywords"
            placeholder="python full stack, django, react"
            helperText="Separate keywords with commas."
            {...fieldProps("seo_keywords")}
          />

          <div className="sm:col-span-2">
            <FormField
              multiline
              rows={2}
              label="SEO Description"
              placeholder="What search results should say about this post…"
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

export default BlogForm;
