import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

import {
  createStaff,
  updateStaff,
} from "../api/staffApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSelect from "./common/FormSelect";
import FormSection from "./common/FormSection";

import {
  DOMAIN_OPTIONS,
  ROLE_OPTIONS,
  usernameOf,
} from "../utils/staff";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
  validateRequired,
} from "../utils/formErrors";

// A new staff member joins today unless changed. Formatted locally rather
// than with toISOString, which is UTC and gives yesterday's date before
// 5:30 AM IST.
const newForm = () => ({
  staff_name: "",
  email: "",
  phone: "",
  role: "",
  domain: "",
  joining_date: format(new Date(), "yyyy-MM-dd"),
  username: "",
  password: "",
  confirm_password: "",
});

// ================= REQUIRED FIELDS =================

// Domain is required for every role; "Other" covers staff who don't work in
// one course area.
const detailFields = {
  staff_name: "Full name",
  email: "Email",
  phone: "Phone number",
  role: "Role",
  domain: "Domain",
  joining_date: "Joining date",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StaffForm({
  open,
  staff = null,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(staff);

  const originalUsername = usernameOf(staff);

  const contentRef = useRef(null);

  const [formData, setFormData] = useState(newForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (staff) {
      // Mapped field by field rather than spread, so read-only server fields
      // (id, timestamps) never ride along into the PATCH body. The password
      // is never sent back, so it starts blank.
      setFormData({
        staff_name: staff.staff_name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        role: staff.role || "",
        domain: staff.domain || "",
        joining_date: (staff.joining_date || "").slice(0, 10),
        username: usernameOf(staff),
        password: "",
        confirm_password: "",
      });
    } else {
      setFormData(newForm());
    }

    setErrors({});
  }, [staff, open]);

  // ================= INPUT CHANGE =================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((previousErrors) =>
      clearFieldError(previousErrors, name)
    );
  };

  // ================= VALIDATION =================

  // A new staff member needs a full login. When editing, the password is
  // only checked if a new one is being set.
  const validate = () => {
    const rules = { ...detailFields };

    if (!isEdit || originalUsername) {
      rules.username = "Username";
    }

    if (!isEdit || formData.password) {
      rules.password = "Password";
      rules.confirm_password = "Confirm password";
    }

    const newErrors = validateRequired(formData, rules);

    if (!newErrors.email && !EMAIL_PATTERN.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (
      !newErrors.confirm_password &&
      formData.password !== formData.confirm_password
    ) {
      newErrors.confirm_password = "Passwords don't match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors, contentRef);
      return false;
    }

    return true;
  };

  // ================= SUBMIT =================

  const buildPayload = () => {
    const payload = {
      staff_name: formData.staff_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      domain: formData.domain,
      joining_date: formData.joining_date,
    };

    const username = formData.username.trim();

    // When editing, the username goes only if it changed, so an unchanged
    // one is never checked against itself as taken.
    if (!isEdit || (username && username !== originalUsername)) {
      payload.username = username;
    }

    if (!isEdit || formData.password) {
      payload.password = formData.password;
      payload.confirm_password = formData.confirm_password;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      if (isEdit) {
        await updateStaff(staff.id, buildPayload());
      } else {
        await createStaff(buildPayload());
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save staff:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to save staff member."
      );

      setErrors(apiErrors);

      focusFirstError(apiErrors, contentRef);
    } finally {
      setSaving(false);
    }
  };

  // ================= FIELD PROPS =================

  const fieldProps = (name) => ({
    name,
    value: formData[name] ?? "",
    onChange: handleChange,
    error: errors[name] || "",
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Staff" : "Add Staff"}
      subtitle={
        isEdit
          ? `Update ${staff.staff_name}'s details and login`
          : "Add a staff member and create their login"
      }
      submitLabel={isEdit ? "Update Staff" : "Add Staff"}
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= DETAILS ================= */}

        <FormSection title="Details" columns={2}>
          <div className="sm:col-span-2">
            <FormField
              required
              label="Full Name"
              placeholder="Anjali N"
              {...fieldProps("staff_name")}
            />
          </div>

          <FormField
            required
            type="email"
            label="Email"
            placeholder="anjali@cignes.com"
            {...fieldProps("email")}
          />

          <FormField
            required
            type="tel"
            label="Phone"
            placeholder="9876543210"
            {...fieldProps("phone")}
          />
        </FormSection>

        {/* ================= ROLE ================= */}

        <FormSection title="Role" columns={3}>
          <FormSelect
            required
            label="Role"
            placeholder="Select Role"
            {...fieldProps("role")}
            options={[
              { value: "", label: "Select Role" },
              ...ROLE_OPTIONS,
            ]}
          />

          <FormSelect
            required
            label="Domain"
            placeholder="Select Domain"
            {...fieldProps("domain")}
            options={[
              { value: "", label: "Select Domain" },
              ...DOMAIN_OPTIONS,
            ]}
          />

          <FormField
            required
            type="date"
            label="Joining Date"
            {...fieldProps("joining_date")}
          />
        </FormSection>

        {/* ================= LOGIN ================= */}

        <FormSection
          title="Login"
          description={
            isEdit
              ? "Leave the password blank to keep the current one."
              : "The username and password they'll sign in with."
          }
          columns={3}
        >
          <FormField
            required={!isEdit || Boolean(originalUsername)}
            label="Username"
            placeholder="anjali"
            autoComplete="off"
            {...fieldProps("username")}
          />

          <FormField
            required={!isEdit}
            type="password"
            label={isEdit ? "New Password" : "Password"}
            autoComplete="new-password"
            {...fieldProps("password")}
          />

          <FormField
            required={!isEdit || Boolean(formData.password)}
            type="password"
            label={isEdit ? "Confirm New Password" : "Confirm Password"}
            autoComplete="new-password"
            {...fieldProps("confirm_password")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}
