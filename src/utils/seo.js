// ================= SEO FIELDS =================
//
// The SEO fields a course or blog post has, in the order the forms show them,
// for the tables' SEO column. A field counts once something is saved in it:
// the API sends an empty one as null or "".
//
// The canonical URL isn't one of them. It's left blank unless the content was
// first published at another address, so a blank one isn't missing.

export const SEO_FIELDS = [
  { key: "slug", label: "Slug" },
  { key: "seo_title", label: "SEO Title" },
  { key: "seo_description", label: "SEO Description" },
  { key: "seo_keywords", label: "SEO Keywords" },
  { key: "og_image", label: "OG Image" },
];

const isSet = (value) =>
  typeof value === "string"
    ? value.trim() !== ""
    : value != null;

// Each field with whether it's set. An OG image may come back as either its
// path or its full URL.
export function seoFields(item) {
  return SEO_FIELDS.map((field) => ({
    ...field,
    set:
      isSet(item[field.key]) ||
      (field.key === "og_image" && isSet(item.og_image_url)),
  }));
}
