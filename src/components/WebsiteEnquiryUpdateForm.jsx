import { useEffect, useRef, useState } from "react";

import { updateWebsiteEnquiry } from "../api/websiteEnquiryApi";

import FormDialog from "./common/FormDialog";
import FormField from "./common/FormField";
import FormSection from "./common/FormSection";
import FormSelect from "./common/FormSelect";

import {
  clearFieldError,
  focusFirstError,
  FORM_ERROR_KEY,
  normalizeApiErrors,
} from "../utils/formErrors";

const initialForm = {
  responsible_person: "",
  recommended_by: "",
  feedback: "",
};

// The follow-up on a website enquiry: who's handling it, who recommended the
// academy to them, and how the conversation went. The rest of the enquiry is
// what the visitor sent, so it isn't changed here. `users` are the CRM's
// staff, for the responsible person.
function WebsiteEnquiryUpdateForm({
  enquiry,
  users,
  onClose,
  onSuccess,
}) {
  const contentRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!enquiry) return;

    setFormData({
      // Kept as a string, as the select's options are.
      responsible_person: enquiry.responsible_person ? String(enquiry.responsible_person) : "",
      recommended_by: enquiry.recommended_by || "",
      feedback: enquiry.feedback || "",
    });
    setErrors({});
  }, [enquiry]);

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

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setErrors({});

      await updateWebsiteEnquiry(enquiry.id, {
        feedback: formData.feedback.trim(),
        responsible_person: formData.responsible_person ? Number(formData.responsible_person) : null,
        recommended_by: formData.recommended_by.trim(),
      });

      onSuccess();
    } catch (error) {
      console.error("Failed to update enquiry:", error);

      const apiErrors = normalizeApiErrors(
        error,
        "Failed to update enquiry."
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
      open={Boolean(enquiry)}
      onClose={onClose}
      title="Update Enquiry"
      subtitle={enquiry ? `Follow-up on ${enquiry.name}'s enquiry` : ""}
      submitLabel="Update Enquiry"
      onSubmit={handleSubmit}
      saving={saving}
      formError={errors[FORM_ERROR_KEY]}
    >
      <div ref={contentRef}>

        {/* ================= FOLLOW-UP ================= */}

        <FormSection
          title="Follow-up"
          columns={2}
        >
          <FormSelect
            label="Responsible Person"
            placeholder="Select User"
            options={[
              { value: "", label: "Select User" },
              ...users.map((user) => ({
                value: String(user.id),
                label: user.full_name,
              })),
            ]}
            {...fieldProps("responsible_person")}
          />

          <FormField
            label="Recommended By"
            placeholder="Student / staff name"
            {...fieldProps("recommended_by")}
          />
        </FormSection>

        {/* ================= FEEDBACK ================= */}

        <FormSection
          title="Feedback"
          columns={1}
        >
          <FormField
            multiline
            rows={5}
            label="Feedback"
            placeholder="Notes from the conversation…"
            {...fieldProps("feedback")}
          />
        </FormSection>

      </div>
    </FormDialog>
  );
}

export default WebsiteEnquiryUpdateForm;
