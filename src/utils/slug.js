// ================= SLUGS =================
//
// A slug is the last part of an item's address on the landing site, as in
// /courses/<slug>/ or /blogs/<slug>/. When none is saved the site makes one
// from the name (a post's title) by this same rule (slugify in the landing
// page's content/api.ts), so filling one in from the name keeps the address
// the item already has. Change the rule in both places or not at all.

export function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ================= WHILE TYPING =================
//
// The same rule for a slug being typed, except that a hyphen at the end is
// kept: it's where the next word goes. slugify tidies it away afterwards.

export function slugInput(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-/, "");
}

// ================= TAKEN SLUGS =================
//
// The addresses the other items already have: the slug each one saved, or
// the one the site makes from its name when it hasn't. `current` is the item
// being edited, left out so its own slug doesn't count against it.

export function takenSlugs(
  items,
  current = null,
  nameOf = (item) => item.name
) {
  return new Set(
    items
      .filter((item) => item.id !== current?.id)
      .map((item) => item.slug || slugify(nameOf(item)))
      .filter(Boolean)
  );
}

// ================= CURRENT SLUG =================
//
// The address a saved item's page already has: the slug it saved, or else the
// one the site makes from its name, with its id added when another item
// already has that one.

export function currentSlug(
  item,
  items,
  nameOf = (entry) => entry.name
) {
  if (item.slug) return item.slug;

  const slug = slugify(nameOf(item)) || String(item.id);

  return takenSlugs(items, item, nameOf).has(slug)
    ? `${slug}-${item.id}`
    : slug;
}
