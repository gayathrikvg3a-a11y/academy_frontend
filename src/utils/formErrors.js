// ================= FORM ERROR HELPERS =================
//
// Every add/edit dialog keeps an `errors` object keyed by field name and feeds
// it to MUI's `error` / `helperText` props, so messages appear under the field
// they belong to. These helpers build that object from two sources: local
// required-field checks, and Django REST Framework validation responses.

// Errors that belong to the form as a whole rather than to one field
// (non_field_errors, detail, network failures) land under this key.
export const FORM_ERROR_KEY = "_form";

// ================= REQUIRED FIELDS =================
//
// `rules` maps a field name to its label:
//
//   validateRequired(formData, {
//     student_name: "Student name",
//     phone: "Phone number",
//   })
//
// A rule may instead be an object for extra checks:
//
//   { label: "Course fee", positive: true }

const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return false;
};

export function validateRequired(values, rules) {
  const errors = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const config =
      typeof rule === "string"
        ? { label: rule }
        : rule;

    const value = values[field];

    if (isEmpty(value)) {
      errors[field] = `${config.label} is required.`;
      return;
    }

    if (
      config.positive &&
      Number(value) <= 0
    ) {
      errors[field] = `${config.label} must be greater than 0.`;
    }

    if (
      config.min !== undefined &&
      Number(value) < config.min
    ) {
      errors[field] = `${config.label} must be at least ${config.min}.`;
    }
  });

  return errors;
}

// ================= SERVER ERRORS =================
//
// DRF returns validation errors as
//   { field: ["message", ...], non_field_errors: [...], detail: "..." }
// and occasionally a bare string. Some endpoints (enquiry-new/) wrap the
// field errors as { status: false, errors: { field: [...] } }, which is
// unwrapped first. Flatten all of those into the same `{ field: "message" }`
// shape the local checks produce, so the caller can merge them straight into
// its `errors` state.

const flattenMessage = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(flattenMessage)
      .filter(Boolean)
      .join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .map(flattenMessage)
      .filter(Boolean)
      .join(" ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export function normalizeApiErrors(
  error,
  fallbackMessage = "Something went wrong. Please try again."
) {
  const body = error?.response?.data;

  const data =
    body?.errors && typeof body.errors === "object" && !Array.isArray(body.errors)
      ? body.errors
      : body;

  // No response body at all — offline, timeout, 500 with an HTML body.
  if (!data) {
    return {
      [FORM_ERROR_KEY]:
        error?.message === "Network Error"
          ? "Unable to reach the server. Check your connection and try again."
          : fallbackMessage,
    };
  }

  if (typeof data === "string") {
    // Django's DEBUG page is HTML, never a real API message — keep it out of
    // the UI instead of dumping raw markup into an Alert.
    if (/^\s*</.test(data)) {
      return {
        [FORM_ERROR_KEY]:
          "The server returned an error page. Please try again later.",
      };
    }

    return {
      [FORM_ERROR_KEY]:
        data.trim() || fallbackMessage,
    };
  }

  if (Array.isArray(data)) {
    return {
      [FORM_ERROR_KEY]:
        flattenMessage(data) || fallbackMessage,
    };
  }

  const errors = {};

  Object.entries(data).forEach(([key, value]) => {
    const message = flattenMessage(value);

    if (!message) {
      return;
    }

    if (
      key === "non_field_errors" ||
      key === "detail"
    ) {
      errors[FORM_ERROR_KEY] = message;
      return;
    }

    errors[key] = message;
  });

  if (Object.keys(errors).length === 0) {
    errors[FORM_ERROR_KEY] = fallbackMessage;
  }

  return errors;
}

// ================= FOCUS FIRST ERROR =================
//
// After a failed submit, bring the first offending field into view. Fields are
// found by their `name` attribute, which every form already sets.

export function focusFirstError(errors, containerRef) {
  const field = Object.keys(errors).find(
    (key) => key !== FORM_ERROR_KEY
  );

  if (!field) {
    return;
  }

  const root =
    containerRef?.current || document;

  const element = root.querySelector(
    `[name="${field}"]`
  );

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Selects render a hidden input; focusing it does nothing useful, so only
  // focus when the element can actually take focus.
  if (element.type !== "hidden") {
    element.focus({ preventScroll: true });
  }
}

// ================= CLEAR ONE FIELD =================
//
// Used by every `handleChange` so a message disappears as soon as the user
// starts fixing that field.

export function clearFieldError(errors, field) {
  if (!errors[field] && !errors[FORM_ERROR_KEY]) {
    return errors;
  }

  const next = { ...errors };

  delete next[field];
  delete next[FORM_ERROR_KEY];

  return next;
}
